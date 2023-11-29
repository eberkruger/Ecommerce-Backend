import path from "path";
import { fileURLToPath } from "url";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken"
import CONFIG from "../config/config.js";


export const createHash = password => bcrypt.hashSync(password, bcrypt.genSaltSync(10))

export const isValidPassword = (user, password) => bcrypt.compareSync(password, user.password)

export const compareHashedData = async (password, passwordDB) => {
  return bcrypt.compare(password, passwordDB)
}

export const generateToken = (usuario) => {
  return jwt.sign(usuario, CONFIG.JWT_SECRET)
}

export const transporter = nodemailer.createTransport({
  service: CONFIG.NODEMAILER_SERVICE,   
  port: CONFIG.NODEMAILER_PORT, 
  auth: { 
      user: CONFIG.NODEMAILER_EMAIL,
      pass: CONFIG.NODEMAILER_PWD
  }
})


const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default __dirname