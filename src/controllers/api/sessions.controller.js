import UsersService from "../../services/users.service.js"
import { IncorrectLoginCredentials, InputIncomplete, ResultNotFound, SamePassword, TokenExpired, UserExists } from "../../utils/recursos.js"
import jwt from "jsonwebtoken"
import CONFIG from "../../config/config.js"

const usersService = new UsersService()

const register = async (req, res) => {
  try {
    const { first_name, last_name, email, age, password, rol } = req.body

    if (!first_name || !last_name || !email || !age || !password || !rol) {
      throw new InputIncomplete('Incomplete values')
    }

    const user = { first_name, last_name, email, age, password, rol }

    const userDB = await usersService.getByEmail(user.email)

    if (userDB) {
      throw new UserExists('User already exists')
    }

    const result = await usersService.saveUser(user)

    res.sendSuccess(result)
    req.logger.info(`Solicitud procesada: ${req.method} ${req.url}`)

  } catch (error) {
    req.logger.error(`${req.method} en ${req.url} - ${new Date().toISOString()} - ${error}`)

    if (error instanceof UserExists) {
      return res.sendClientError(error.message)
    }
    if (error instanceof InputIncomplete) {
      return res.sendClientError(error.message)
    }

    res.sendServerError(error)
  }
}

const login = async (req, res) => {
  try {
    const { email, password } = req.body

    const user = await usersService.getByEmail(email)

    const result = await usersService.login(user, password)

    res.cookie('token', result, { httpOnly: true })

    await usersService.updateLastConnection(user.email)

    res.sendSuccess({ result })
    req.logger.info(`Solicitud procesada: ${req.method} ${req.url}`)

  } catch (error) {
    req.logger.error(`${req.method} en ${req.url} - ${new Date().toISOString()} - ${error}`)

    if (error instanceof ResultNotFound) {
      return res.sendClientError(error.message)
    }

    if (error instanceof IncorrectLoginCredentials) {
      return res.sendClientError(error.message)
    }

    res.sendServerError(error)
  }
}

const logout = async (req, res) => {
  try {
    const token = req.cookies.token

    const decodedToken = jwt.verify(token, CONFIG.JWT_SECRET)

    await usersService.updateLastConnection(decodedToken.email)

    res.clearCookie('token')

    req.session.destroy(err => {
      if (err) return res.sendServerError('Couldnt logout')
      res.redirect('/login')
    })

    req.logger.info(`Solicitud procesada: ${req.method} ${req.url}`)

  } catch (error) {
    req.logger.error(`${req.method} en ${req.url} - ${new Date().toISOString()} - ${error}`)
    res.sendServerError(error)
  }
}

const saveResetPassword = async (req, res) => {
  try {
    const { email } = req.body

    if (email === "") {
      throw new InputIncomplete('Email incomplete')
    }

    const user = await usersService.getByEmail(email)

    const result = await usersService.saveResetPassword(user)

    res.sendSuccess(`Password reset mail sent of ${result}`)
    req.logger.info(`Solicitud procesada: ${req.method} ${req.url}`)

  } catch (error) {
    req.logger.error(`${req.method} en ${req.url} - ${new Date().toISOString()} - ${error}`)

    if (error instanceof ResultNotFound) {
      return res.sendClientError(error.message)
    }
    if (error instanceof InputIncomplete) {
      return res.sendClientError(error.message)
    }

    res.sendServerError(error)
  }
}

const getUserResetPassword = async (req, res) => {
  try {
    const userToken = req.body.userToken
    const newPassword = req.body.newPassword

    if (newPassword === "") {
      throw new InputIncomplete('Password incomplete')
    }

    const userResetPasswordDB = await usersService.getUserResetPassword(userToken)

    if (!userResetPasswordDB) {
      throw new TokenExpired('Token is invalid or has expired')
    }

    const userDB = await usersService.getById(userResetPasswordDB.user)

    const result = await usersService.updateUserPassword(userDB, newPassword, userResetPasswordDB)

    res.sendSuccess("Password update")

  } catch (error) {
    req.logger.error(`${req.method} en ${req.url} - ${new Date().toISOString()} - ${error}`)

    if (error instanceof InputIncomplete) {
      return res.sendClientError(error.message)
    }
    if (error instanceof ResultNotFound) {
      return res.sendClientError(error.message)
    }
    if (error instanceof TokenExpired) {
      return res.sendClientError(error.message)
    }
    if (error instanceof SamePassword) {
      return res.sendClientError(error.message)
    }

    res.sendServerError(error)
  }
}

export {
  register,
  login,
  logout,
  saveResetPassword,
  getUserResetPassword
}