import express from 'express';
import handlebars from 'express-handlebars';
import { Server } from 'socket.io';
import passport from 'passport';
import cookieParser from 'cookie-parser';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUiExpress from 'swagger-ui-express';
import http from 'http'

import CONFIG from './config/config.js';
import { sessionMiddleware } from './config/db.config.js';
import __dirname from './utils/utils.js';
import initializePassport from './config/passport.config.js';

import ProductsManagerDB from './dao/dbManagers/products.dao.js';
import ChatManagerDb from './dao/dbManagers/messages.dao.js';

import viewsRouter from './routes/web/views.router.js';
import authGithub from './routes/api/authGithub.router.js';
import UsersRouter from './routes/api/users.router.js';
import SessionsRouter from './routes/api/sessions.router.js';
import CartsRouter from './routes/api/carts.router.js';
import ProductsRouter from './routes/api/products.router.js';

import ProductsService from './services/products.service.js';

import { loggerTest } from './routes/api/loggerTest.js';
import { addLogger } from './logs/logger.js';

import './config/db.config.js';
import { sessionMiddleware } from './config/db.config.js';

import CustomError from './middlewares/errors/customError.js';
import EErrors from './middlewares/errors/enum.js';
import { generateProductErrorInfo } from './middlewares/errors/info.js';
import errorHandler from './middlewares/index.js'

const usersRouter = new UsersRouter()
const sessionsRouter = new SessionsRouter()
const cartsRouter = new CartsRouter()
const productsRouter = new ProductsRouter()

const productsService = new ProductsService()

const app = express()

app.use(errorHandler)
app.use(addLogger)

app.engine('handlebars', handlebars.engine())
app.set('views', `${__dirname}/views`)
app.set('view engine', 'handlebars')

//Documentación API's
const swaggerOptions = {
  definition: {
    openapi: '3.0.1',
    info: {
      title: 'Documentación proyecto Ecommerce Backend',
      description: 'API pensada para resolver el proceso de ventas de productos de un Ecommerce'
    }
  },
  apis: [`${__dirname}/docs/**/*.yaml`]
}
const specs = swaggerJSDoc(swaggerOptions)
app.use('/apidocs', swaggerUiExpress.serve, swaggerUiExpress.setup(specs))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static(`${__dirname}/public`))

app.use(sessionMiddleware)

app.use(cookieParser())

//Configuracion de passport
initializePassport()
app.use(passport.initialize())
app.use(passport.session())

app.use('/', viewsRouter)
app.use('/api/authGithub', authGithub)
app.use('/api/sessions', sessionsRouter.getRouter())
app.use('/api/users', usersRouter.getRouter())
app.use('/api/carts', cartsRouter.getRouter())
app.use('/api/products', productsRouter.getRouter())
app.use('/loggerTest', loggerTest)

server.listen(CONFIG.PORT, () => {
  console.log(`Server running on port ${CONFIG.PORT}`)
})

// ----------------------------------SOCKET--------------------------------------

const server = http.createServer(app)
const io = new Server(server)

const productsManagerDB = new ProductsManagerDB()
const chatManagerDb = new ChatManagerDb()

const messages = []

io.on('connection', async socket => {
  console.log("Cliente conectado")

  //web productos
  const products = await productsManagerDB.getAll()

  io.emit('products', products)

  socket.on('newProduct', async (data) => {
    try {
      if (!data.title || !data.description || !data.code || !data.price || !data.stock || !data.category) {
        throw CustomError.createError({
          name: 'UserError',
          cause: generateProductErrorInfo({
            title: data.title,
            description: data.description,
            code: data.code,
            price: data.price,
            stock: data.stock,
            category: data.category
          }),
          message: 'Error tratando de crear un producto',
          code: EErrors.INVALID_TYPES_ERROR
        })
      }

      await productsManagerDB.saveProduct(data)

      const productsAll = await productsManagerDB.getAll()
      io.emit('newProductAdded', { success: true })

      io.emit('products', productsAll)

    } catch (error) {
      console.log(error.message)
      io.emit('WarningMessage', 'Por favor, completa todos los campos antes de crear el nuevo producto.')
    }
  })

  socket.on('spliced', async (data) => {
    let token = socket.request.headers.cookie?.split('; ').find(row => row.startsWith('token=')).split('=')[1]

    await productsService.deleteById(data, token)

    const productsAll = await productsManagerDB.getAll()
    io.emit('products', productsAll)
  })


  //web chat
  io.emit('messageLogs', messages)

  socket.on('message', async data => {
    messages.push(data)
    await chatManagerDb.save(data)
    io.emit('messageLogs', messages)
  })

  socket.on('authenticated', data => {
    socket.emit('messageLogs', messages)
    socket.broadcast.emit('newUserConnected', data)
  })
})





