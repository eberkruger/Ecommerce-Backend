import { Router as expressRouter } from "express"
import jwt from "jsonwebtoken"
import CONFIG from "../../config/config.js"

export default class Router {
  constructor() {
    this.router = expressRouter()
    this.init()
  }

  getRouter() {
    return this.router
  }

  init() { }

  get(path, policies, ...callbacks) {
    this.router.get(
      path,
      this.handlePolicies(policies),
      this.generateCustomResponse,
      this.applyCallbacks(callbacks)
    )
  }

  post(path, policies, ...callbacks) {
    this.router.post(
      path,
      this.handlePolicies(policies),
      this.generateCustomResponse,
      this.applyCallbacks(callbacks)
    )
  }

  put(path, policies, ...callbacks) {
    this.router.put(
      path,
      this.handlePolicies(policies),
      this.generateCustomResponse,
      this.applyCallbacks(callbacks)
    )
  }

  delete(path, policies, ...callbacks) {
    this.router.delete(
      path,
      this.handlePolicies(policies),
      this.generateCustomResponse,
      this.applyCallbacks(callbacks)
    )
  }

  handlePolicies = (policies) => (req, res, next) => {
    if (policies[0] === "PUBLIC") return next()


    // Middleware para verificar el token en las solicitudes posteriores

    const authToken1 = req.headers["authorization"] || req.headers["Authorization"]
    const authToken2 = req.cookies.token

    const token = (authToken1 && authToken1.split(" ")[1]) || authToken2
    if (!token) return res.status(401).json({ message: 'Not token provided' })

    const user = jwt.verify(token, CONFIG.JWT_SECRET)
    if (!policies.includes(user.rol.toUpperCase())) {
      res.status(403).json({ message: 'Forbidden', error: 'Forbidden' })
      return req.logger.error('Forbidden')
    }
    req.user = user
    next()
  }

  generateCustomResponse = (req, res, next) => {
    res.sendSuccess = (data) => {
      res.status(200).json({ data })
    }
    res.sendServerError = (error) => {
      res.status(500).json({ error })
    }
    res.sendClientError = (error) => {
      res.status(400).json({ error })
    }
    res.sendForbbidenError = (error) => {
      res.status(403).json({ error })
    }

    next()
  }

  applyCallbacks(callbacks) {
    return callbacks.map((callback) => async (...params) => {
      try {
        await callback.apply(this, params)
      } catch (error) {
        req.logger.error(`${req.method} en ${req.url} - ${new Date().toISOString()} - ${error}`)
        res.sendServerError(error)
      }
    })
  }
}