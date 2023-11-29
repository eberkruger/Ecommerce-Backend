import UsersManagerDB from "../dao/dbManagers/users.dao.js";
import UsersDto from "../dao/DTOs/users.dto.js";

const usersManagersDB = new UsersManagerDB()

export default class UsersRepository {
  constructor() {

  }
  saveUser = async (user) => {
    const result = await usersManagersDB.saveUser(user)
    const dtoResult = new UsersDto(result)
    return dtoResult
  }

  getByEmail = async (email) => {
    const result = await usersManagersDB.getByEmail(email)
    return result
  }

  getById = async (id) => {
    const result = await usersManagersDB.getById(id)
    return result
  }

  getUsers = async () => {
    const result = await usersManagersDB.getUsers()
    return result
  }

  saveResetPassword = async (resetPassword) => {
    const result = await usersManagersDB.saveResetPassword(resetPassword)
    return result
  }

  getUserResetPassword = async (userToken) => {
    const result = await usersManagersDB.getUserResetPassword(userToken)
    return result
  }

  updateUserPassword = async (email, newPassword) => {
    const result = await usersManagersDB.updateUserPassword(email, newPassword)
    return result
  }

  deleteUserResetPassword = async (uid) => {
    const result = await usersManagersDB.deleteUserResetPassword(uid)
    return result
  }

  updateUserRole = async (uid, newRole) => {
    const result = await usersManagersDB.updateUserRole(uid, newRole)
    return result
  }

  saveDocuments = async (uid, documents) => {
    const result = await usersManagersDB.saveDocuments(uid, documents)
    return result
  }

  updateLastConnection = async (email) => {
    const result = await usersManagersDB.updateLastConnection(email)
    return result
  }

  deleteUsers = async (id) => {
    const result = await usersManagersDB.deleteUsers(id)
    return result
  }

  updateCart = async (email, cart) => {
   const result = await usersManagersDB.updateCart(email, cart)
   return result
  }
}