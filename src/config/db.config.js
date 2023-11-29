import mongoose from "mongoose";
import session from "express-session";
import MongoStore from "connect-mongo";
import CONFIG from "./config.js";


// Conexión a MONGO
mongoose.connect(CONFIG.MONGO_URL)
  .then(() => {
    console.log('Connected to DB MONGO')
  })
  .catch((error) => {
    console.log('Error conecting to DB MONGO: ', error)
  })

// Configuración de sesión
const sessionMiddleware = session({
  store: new MongoStore({
    mongoUrl: CONFIG.MONGO_URL,
    ttl: 3600
  }),
  secret: CONFIG.MONGO_SECRET,
  resave: true,
  saveUninitialized: true
})

export { sessionMiddleware }