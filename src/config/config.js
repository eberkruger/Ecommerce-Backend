import dotenv from 'dotenv'

dotenv.config()

const CONFIG = {
  MONGO_URL : process.env.MONGO_DB_URL || '',
  PORT: +process.env.PORT || 8080,
  MONGO_SECRET : process.env.MONGO_SECRET,
  CLIENT_ID : process.env.CLIENT_ID,
  CLIENT_SECRET : process.env.CLIENT_SECRET,
  CALLBACK_URL : process.env.CALLBACK_URL,
  ADMIN_EMAIL : process.env.ADMIN_EMAIL,
  ADMIN_PWD : process.env.ADMIN_PWD,
  PERSISTENCE : process.env.PERSISTENCE,
  NODE_ENV : process.env.NODE_ENV,
  JWT_COOKIE : process.env.JWT_COOKIE,
  JWT_SECRET : process.env.JWT_SECRET,
  NODEMAILER_EMAIL : process.env.NODEMAILER_EMAIL,
  NODEMAILER_PWD : process.env.NODEMAILER_PWD,
  NODEMAILER_SERVICE : process.env.NODEMAILER_SERVICE,
  NODEMAILER_PORT : process.env.NODEMAILER_PORT
}

export default CONFIG