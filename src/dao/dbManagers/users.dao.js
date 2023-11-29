import usersModel from "../models/users.schema.js";
import { resetPasswordModel } from "../models/resetPassword.schema.js";

export default class UsersManagerDB {

  saveUser = async (user, cart) => {
    try {
      user.cart = cart._id
      let newUser = await usersModel.create(user)
      return newUser
    } catch (error) {
      throw new Error("Failure to create user", error)
    }
  }

  getByEmail = async (email) => {
    try {
      const user = await usersModel.findOne({ email }).lean()
      return user
    } catch (error) {
      throw new Error("Failure to find user by email", error)
    }
  }

  getById = async (id) => {
    try {
      const user = await usersModel.findOne({ _id: id }).lean()
      return user
    } catch (error) {
      throw new Error("Failure to find user by ID", error)
    }
  }

  getUsers = async () => {
    try {
      const users = await usersModel.find().lean()
      return users
    } catch (error) {
      throw new Error("Failure to find all users", error)
    }
  }

  saveResetPassword = async (resetPassword) => {
    try {
      const result = await resetPasswordModel.create(resetPassword)
      return result
    } catch (error) {
      throw new Error("Failure to save new password", error)
    }
  }

  getUserResetPassword = async (userToken) => {
    try {
      const result = await resetPasswordModel.findOne({ token: userToken }).lean()
      return result
    } catch (error) {
      throw new Error("Failure to get new password", error)
    }
  }

  updateUserPassword = async (email, newPassword) => {
    try {
      let user = await usersModel.findOne({ email }).lean()
      if (!user) {
        throw new Error("User not found")
      }
      const result = await usersModel.updateOne({ _id: user._id }, { password: newPassword })
      return result
    } catch (error) {
      throw new Error("Failure to update user's new password", error)
    }
  }

  deleteUserResetPassword = async (uid) => {
    try {
      const result = await resetPasswordModel.deleteOne({ user: uid })
      return result
    } catch (error) {
      throw new Error("Failure to delete user's new password", error)
    }
  }

  updateUserRole = async (uid, newRole) => {
    try {
      const user = await usersModel.findOne({ _id: uid }).lean()
      if (!user) {
        throw new Error("User not found")
      }
      const result = await usersModel.updateOne({ _id: uid }, { role: newRole })
      return result
    } catch (error) {
      throw new Error("Failure to update user's role", error)
    }
  }

  saveDocuments = async (uid, documents) => {
    try {
      const userUploaderDocuments = await usersModel.findByIdAndUpdate(
        uid,
        {
          $push: {
            documents: documents
          }
        },
        { new: true }
      )
      return userUploaderDocuments
    } catch (error) {
      throw new Error("Failure to save documents", error)
    }
  }

  updateLastConnection = async (email) => {
    try {
      const result = await usersModel.updateOne({ email: email }, { last_connection: new Date() })
      return result
    } catch (error) {
      throw new Error("Failure to update last connection", error)
    }
  }

  deleteUsers = async (id) => {
    try {
      const result = await usersModel.deleteOne({ _id: id })
      return result
    } catch (error) {
      throw new Error("Failure to delete user", error)
    }
  }

  updateCart = async (email, cart) => {
    try {
      const result = await usersModel.updateOne({ email: email }, { cart: cart })
      return result
    } catch (error) {
      throw new Error("Failure to update cart's user", error)
    }
  }
}