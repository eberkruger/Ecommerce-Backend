import UsersDto from "../dao/DTOs/users.dto.js";
import UsersRepository from "../repository/users.repository.js";
import { compareHashedData, generateToken, createHash } from "../utils/utils.js";
import { IncorrectLoginCredentials, ResultNotFound, SamePassword, TokenExpired, UserExists } from "../utils/recursos.js";
import { DeleteUserNotification, generatePasswordResetEmailHTML, loginNotification, registerNotification } from "../utils/customHTML.js";
import { sendEmail } from "./email.service.js";
import bcrypt from "bcrypt"

const usersService = new UsersRepository()

export default class UsersService {

  saveUser = async (user) => {
    const hashPassword = createHash(user.password)
    user.password = hashPassword
    user.rol = user.rol.toUpperCase()

    const result = await usersService.saveUser(user)

    const email = {
      to: user.email,
      subject: 'Registro Exitoso',
      html: registerNotification
    }

    await sendEmail(email)

    return result
  }

  login = async (user, password) => {
    const comparePassword = await compareHashedData(password, user.password)

    if (!comparePassword) {
      throw new IncorrectLoginCredentials('Incorrect credentials')
    }

    const usersDto = new UsersDto(user)
    const userLog = { ...usersDto }
    const accessToken = generateToken(userLog)

    const email = {
      to: user.email,
      subject: 'Intento de Login',
      html: loginNotification
    }

    await sendEmail(email)
    return accessToken
  }

  getByEmail = async (email) => {
    const user = await usersService.getByEmail(email)

    if (!user) {
      throw new ResultNotFound('User not found')
    }

    return user
  }

  saveResetPassword = async (user) => {
    const Hash = await bcrypt.hash(user.email, 1)
    const userHash = Buffer.from(Hash).toString('base64')

    const resetPassword = {
      "user": user._id,
      "token": userHash
    }

    const result = await usersService.saveResetPassword(resetPassword)

    const email = {
      to: user.email,
      subject: 'Recuperación de contraseña',
      html: generatePasswordResetEmailHTML(userHash)
    }

    await sendEmail(email)

    return result
  }

  getUserResetPassword = async (userToken) => {
    const result = await usersService.getUserResetPassword(userToken)
    return result
  }

  updateUserPassword = async (user, newPassword, userResetPasswordDB) => {
    const tokenCreatedAt = userResetPasswordDB.createdAt.getTime()
    const tokenExpiration = 300000 // 1 hora en milisegundos
    const currentTime = new Date().getTime()

    const obj = { "email": user.email }

    if (tokenCreatedAt + tokenExpiration < currentTime) {
      await usersService.deleteUserResetPassword(userResetPasswordDB.user)
      fetch('/api/sessions/forgot-password', {
        method: 'POST',
        body: JSON.stringify(obj),
        headers: {
          'Content-Type': 'application/json'
        }
      })
      throw new TokenExpired(`Token expired, new token generated and sent by email`)
    }

    const comparePassword = await compareHashedData(newPassword, user.password)

    if (comparePassword) {
      throw new SamePassword('Cant enter the same password as before');
    }

    const hashPassword = createHash(newPassword)

    const userUpdate = await usersService.updateUserPassword(user, hashPassword)

    return userUpdate
  }

  getById = async (id) => {
    const user = await usersService.getById(id)

    if (!user) {
      throw new ResultNotFound('User not found');
    }

    return user
  }

  updateUserRole = async (uid, newRole) => {
    const updateUserRol = await usersService.updateUserRole(uid, newRole)
    return updateUserRol
  }

  saveDocuments = async (uid, documents) => {
    const uploaderDocuments = await usersService.saveDocuments(uid, documents)
    return uploaderDocuments
  }

  updateLastConnection = async (email) => {
    const updateLastConnection = await usersService.updateLastConnection(email)
    return updateLastConnection
  }

  getUsers = async () => {
    const users = await usersService.getUsers()

    if (!users) {
      throw new ResultNotFound('Users not found')
    }

    return users
  }

  deleteInactiveUsers = async () => {
    const currentTime = new Date()
    const users = await usersService.getUsers()

    if (!users) {
      throw new ResultNotFound('Users not found')
    }

    const inactiveUsers = []

    users.forEach(user => {
      const lastActivityTime = user.last_connection;

      const timeDifferenceInMinutes = Math.floor((currentTime - lastActivityTime) / (1000 * 60));

      if (timeDifferenceInMinutes >= 2880) {
        usersService.deleteUsers(user._id.toString())
        const email = {
          to: user.email,
          subject: 'Usuario eliminado',
          html: DeleteUserNotification
        }
        sendEmail(email);
        inactiveUsers.push(user.email)
      }
    })

    return inactiveUsers
  }

  deleteUsers = async (id) => {
    const result = await usersService.deleteUsers(id)
    return result
  }

  updateCart = async (email, cart) => {
    const result = await usersService.updateCart(email, cart)
    return result
  }
}