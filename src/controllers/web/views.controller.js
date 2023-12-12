import ProductsService from "../../services/products.service.js"
import UsersService from "../../services/users.service.js"
import CartsService from "../../services/carts.service.js"
import jwt from "jsonwebtoken"
import CONFIG from "../../config/config.js"
import { ResultNotFound } from "../../utils/recursos.js"

const productsService = new ProductsService()
const usersService = new UsersService()
const cartsService = new CartsService()

const privateAccess = async (req, res, next) => {
  const token = req.cookies.token

  if (token) {
    jwt.verify(token, CONFIG.JWT_SECRET, (err, decoded) => {
      req.session.user = decoded
      next()
    })
  } else {
    res.redirect('/login')
  }
}

const publicAccess = async (req, res, next) => {
  if (req.session.user) return res.redirect('/products')
  next()
}

const privateUserAccess = async (req, res, next) => {
  if (req.session.user) {
    if (req.session.user.rol === "USER") { return next() }
  }

  return res.redirect('/login')
}

const privateAdminAccess = async (req, res, next) => {
  if (req.session.user) {
    if (req.session.user.rol === "ADMIN") { return next() }
  }

  return res.redirect('/login')
}

const privateAdminPremiumAccess = async (req, res, next) => {
  if (req.session.user) {
    if (req.session.user.rol === "ADMIN" || req.session.user.rol === "PREMIUM") { return next() }
  }

  return res.redirect('/login')
}

//*********** PAGES ******************/

const login = async (req, res) => {
  res.render('login', { style: 'login.css' })
}

const register = (req, res) => {
  res.render('register', { style: 'register.css' })
}

const forgotPassword = (req, res) => {
  res.render('forgotPassword', { style: 'login.css' })
}

const resetPassword = (req, res) => {
  res.render('resetPassword', { style: 'login.css' })
}

const getProductsPaginate = async (req, res) => {
  try {
    const { limit = 12, page = 1, sort, category, stock } = req.query

    const prod = await productsService.getAll()
    const result = await productsService.getAllPage(limit, page, sort, category, stock)

    const admin = req.session.user.rol === 'ADMIN' ? true : false
    const premium = req.session.user.rol === 'PREMIUM' ? true : false
    const us = req.session.user.rol === 'USER' ? true : false

    const cat = [...new Set(prod.map(product => product.category))]

    res.render('products', {
      products: result.payload,
      hasPrevPage: result.hasPrevPage,
      prevPage: result.prevPage,
      hasNextPage: result.hasNextPage,
      nextPage: result.nextPage,
      Page: result.page,
      totalPages: result.totalPages,
      user: req.session.user,
      admin: admin,
      premium: premium,
      us: us,
      cat: cat,
      style: 'products.css'
    })

    res.status(200)
    req.logger.info(`Solicitud procesada: ${req.method} ${req.url}`)

  } catch (error) {
    req.logger.error(`${req.method} en ${req.url} - ${new Date().toISOString()} - ${error}`)

    if (error instanceof ResultNotFound) {
      return res.status(400).send(error.message)
    }

    res.status(500).send({ status: 'error', error })
  }
}

const getCart = async (req, res) => {
  try {
    const token = req.cookies.token
    const decodedToken = jwt.verify(token, CONFIG.JWT_SECRET)

    let cart
    let cid = ''
    let total = 0

    const user = await usersService.getByEmail(decodedToken.email)

    if (user.cart === '') {
      cart = false
    } else {
      cart = await cartsService.getById(user.cart)
    }

    const admin = req.session.user.rol === 'ADMIN' ? true : false
    const premium = req.session.user.rol === 'PREMIUM' ? true : false
    const us = req.session.user.rol === 'USER' ? true : false

    const cartProducts = cart?.products ?? []

    if (cartProducts.length > 0) {
      for (const product of cartProducts) {
        const subtotal = product.product.price * product.quantity
        total += subtotal
      }
      cid = cart?._id?.toString() ?? ''
    } else {
      cart = false
    }

    res.render('cart', {
      cart: cart,
      cid: cid,
      total: total,
      user: req.session.user,
      admin: admin,
      premium: premium,
      us: us,
      style: 'cart.css'
    })

    res.status(200)
    req.logger.info(`Solicitud procesada: ${req.method} ${req.url}`)

  } catch (error) {
    req.logger.error(`${req.method} en ${req.url} - ${new Date().toISOString()} - ${error}`)

    if (error instanceof ResultNotFound) {
      return res.status(400).send(error.message)
    }

    res.status(500).send({ status: 'error', error })
  }
}

const saveDeleteProductsSocket = async (req, res) => {
  const admin = req.session.user.rol === 'ADMIN' ? true : false
  const premium = req.session.user.rol === 'PREMIUM' ? true : false
  const us = req.session.user.rol === 'USER' ? true : false

  res.render('realTimeProducts', {
    user: req.session.user,
    admin: admin,
    premium: premium,
    us: us,
    style: 'realTimeProducts.css'
  })
}

const chat = async (req, res) => {
  const admin = req.session.user.rol === 'ADMIN' ? true : false
  const premium = req.session.user.rol === 'PREMIUM' ? true : false
  const us = req.session.user.rol === 'USER' ? true : false

  res.render('chat', {
    user: req.session.user,
    admin: admin,
    premium: premium,
    us: us,
    style: 'chat.css'
  })
}

const profile = async (req, res) => {
  try {
    const user = req.session.user
    const userDB = await usersService.getByEmail(user.email)
    const documents = userDB.documents

    const admin = userDB.rol === 'ADMIN' ? true : false
    const premium = userDB.rol === 'PREMIUM' ? true : false
    const us = userDB.rol === 'USER' ? true : false

    let doc1
    let doc2
    let doc3

    if (documents) {
      const documentosModificados = documents.map(documento => ({
        name: documento.name.replace(/\d+|-/g, '').split('.').slice(0, -1).join(''),
        reference: documento.reference,
      }))

      doc1 = documentosModificados.some(documento => documento.name === "ComprobanteEstadoCuenta");
      doc2 = documentosModificados.some(documento => documento.name === "ComprobanteDomicilio")
      doc3 = documentosModificados.some(documento => documento.name === "Identificacion")
    }

    res.render('profile', {
      user: user,
      uid: userDB._id,
      admin: admin,
      premium: premium,
      us: us,
      doc1: doc1,
      doc2: doc2,
      doc3: doc3,
      style: 'profile.css'
    })

    res.status(200)
    req.logger.info(`Solicitud procesada: ${req.method} ${req.url}`)

  } catch (error) {
    req.logger.error(`${req.method} en ${req.url} - ${new Date().toISOString()} - ${error}`)

    if (error instanceof ResultNotFound) {
      return res.status(400).send(error.message)
    }

    res.status(500).send({ status: 'error', error })
  }
}

const usersView = async (req, res) => {
  try {
    const admin = req.session.user.rol === 'ADMIN' ? true : false
    const premium = req.session.user.rol === 'PREMIUM' ? true : false
    const us = req.session.user.rol === 'USER' ? true : false
    const users = await usersService.getUsers()

    res.render('users', {
      users,
      user: req.session.user,
      admin: admin,
      premium: premium,
      us: us,
      style: 'users.css'
    })

    res.status(200)
    req.logger.info(`Solicitud procesada: ${req.method} ${req.url}`)

  } catch (error) {
    req.logger.error(`${req.method} en ${req.url} - ${new Date().toISOString()} - ${error}`)

    if (error instanceof ResultNotFound) {
      return res.status(400).send(error.message)
    }

    res.status(500).send({ status: 'error', error })
  }
}

const getAllProducts = async (req, res) => {
  try {
    const products = await productsService.getAll()
    res.render('home', { products, style: 'home.css' })
    res.status(200)
    req.logger.info(`Solicitud procesada: ${req.method} ${req.url}`)

  } catch (error) {
    es.status(500).send({ status: 'error', error })
    req.logger.error(`${req.method} en ${req.url} - ${new Date().toISOString()} - ${error}`)
  }
}

export {
  publicAccess,
  privateAccess,
  privateUserAccess,
  privateAdminAccess,
  privateAdminPremiumAccess,
  getAllProducts,
  saveDeleteProductsSocket,
  chat,
  getProductsPaginate,
  getCart,
  register,
  login,
  profile,
  forgotPassword,
  resetPassword,
  usersView
}