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

const app = express()
const server = http.createServer(app)
const io = new Server(server)

server.listen(CONFIG.PORT, () => {
  console.log(`Server running on port ${CONFIG.PORT}`)
})

app.use(sessionMiddleware)


