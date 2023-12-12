import CustomError from "../../middlewares/errors/customError.js"
import EErrors from "../../middlewares/errors/enum.js"
import { generateProductErrorInfo } from "../../middlewares/errors/info.js"
import ProductsService from "../../services/products.service.js"
import { ResultNotFound, RolForbiden } from "../../utils/recursos.js"
import jwt from "jsonwebtoken"
import CONFIG from "../../config/config.js"

const productsService = new ProductsService()

const getAllPage = async (req, res) => {
  try {
    const { limit = 10, page = 1, sort, category, stock } = req.query

    const result = await productsService.getAllPage(limit, page, sort, category, stock)

    res.sendSuccess({ result })
    req.logger.info(`Solicitud procesada: ${req.method} ${req.url}`)

  } catch (error) {
    req.logger.error(`${req.method} en ${req.url} - ${new Date().toISOString()} - ${error}`)

    res.sendServerError(error)
  }
}

const getById = async (req, res) => {
  try {
    const pid = req.params.pid

    const result = await productsService.getById(pid)

    res.sendSuccess(result)
    req.logger.info(`Solicitud procesada: ${req.method} ${req.url}`)

  } catch (error) {
    req.logger.error(`${req.method} en ${req.url} - ${new Date().toISOString()} - ${error}`)
    if (error instanceof ResultNotFound) {
      return res.sendClientError(error.message)
    }
    res.sendServerError(error)
  }
}

const saveProduct = async (req, res) => {
  try {
    const { title, description, code, price, status, stock, category, thumbnails, id, owner } = req.body

    if (!title || !description || !code || !price || !stock || !category) {
      throw CustomError.createError({
        name: 'ProductError',
        cause: generateProductErrorInfo({
          title,
          description,
          code,
          price,
          stock,
          category
        }),
        message: 'Error tratando de crear un producto',
        code: EErrors.INVALID_TYPES_ERROR
      })
    }

    const token = req.cookies.token
    const decodedToken = jwt.verify(token, CONFIG.JWT_SECRET)

    const product = {
      title,
      description,
      code,
      price,
      status,
      stock,
      category,
      thumbnails,
      id,
      owner: decodedToken.rol === "PREMIUM" ? decodedToken.email : "ADMIN"
    }

    const result = await productsService.saveProduct(product)

    res.sendSuccess(result)

  } catch (error) {
    req.logger.error(`${req.method} en ${req.url} - ${new Date().toISOString()} - ${error}`)
    res.sendServerError(error)
  }
}

const updateProduct = async (req, res) => {
  try {
    const productReq = req.body
    const pid = req.params.pid

    const token = req.cookies.token

    const product = await productsService.getById(pid)

    const result = await productsService.updateProduct(productReq, pid, token, product)

    res.sendSuccess('Producto modificado')

  } catch (error) {
    req.logger.error(`${req.method} en ${req.url} - ${new Date().toISOString()} - ${error}`)

    if (error instanceof ResultNotFound) {
      return res.sendClientError(error.message)
    }
    if (error instanceof RolForbiden) {
      return res.sendClientError(error.message)
    }
    res.status(500).send({ status: 'error' })
  }
}

const deleteById = async (req, res) => {
  try {
    const pid = req.params.pid
    const token = req.cookies.token

    const product = await productsService.getById(pid)

    const result = await productsService.deleteById(pid, token, product)

    res.sendSuccess(`Producto Eliminado`)
    req.logger.info(`Solicitud procesada: ${req.method} ${req.url}`)

  } catch (error) {
    req.logger.error(`${req.method} en ${req.url} - ${new Date().toISOString()} - ${error}`)

    if (error instanceof ResultNotFound) {
      return res.sendClientError(error.message)
    }
    if (error instanceof RolForbiden) {
      return res.sendClientError(error.message)
    }
    res.sendServerError(error)
  }
}

export {
  getAllPage,
  getById,
  saveProduct,
  updateProduct,
  deleteById
}