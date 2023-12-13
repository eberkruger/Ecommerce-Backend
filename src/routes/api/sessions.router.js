import Router from "./router.js"
import { register, login, logout, saveResetPassword, getUserResetPassword } from "../../controllers/api/sessions.controller.js"

export default class SessionsRouter extends Router {
  init() {
    this.post('/register', ['PUBLIC'], register)
    this.post('/login', ['PUBLIC'], login)
    this.get('/logout', ['PUBLIC'], logout)
    this.post('/forgot-password', ['PUBLIC'], saveResetPassword)
    this.post('/reset-password', ['PUBLIC'], getUserResetPassword)
  }
}