import ProductsRepository from "../repository/products.repository.js";
import { ResultNotFound, RolForbiden } from "../utils/recursos.js";
import { sendEmail } from "./email.service.js";
import jwt from "jsonwebtoken";
import CONFIG from "../config/config.js";
import { productDeleteNotification, productUpdateNotification } from "../utils/customHTML.js";

const productsService = new ProductsRepository()

export default class ProductsService {

  getAllPage = async (limit, page, sort, category, stock) => {
    let query = {}
    if (category) query = { category: `${category}` }
    if (stock) query = { stock: `${stock}` }
    if (category && stock) query = { $and: [{ category: `${category}` }, { stock: `${stock}` }] }

    const result = await productsService.getAllPage(limit, page, sort, query)

    const products = result.docs
    result.prevLink = result.hasPrevPage
      ? `/api/products?limit=${limit}&page=${result.prevPage}`
      : null;
    result.nextLink = result.hasNextPage
      ? `/api/products?limit=${limit}&page=${result.nextPage}`
      : null;

    const res = {
      payload: products,
      totalPages: result.totalPages,
      prevPage: result.prevPage,
      nextPage: result.nextPage,
      page: result.page,
      hasPrevPage: result.hasPrevPage,
      hasNextPage: result.hasNextPage,
      prevLink: result.prevLink,
      nextLink: result.nextLink
    }
    return res
  }

  getAll = async (limit) => {
    const result = await productsService.getAll(limit)
    if (result === null) {
      throw new ResultNotFound('Products not found')
    }
    return result
  }

  getById = async (id) => {
    const result = await productsService.getById(id)
    if (result === null) {
      throw new ResultNotFound('Product not found')
    }
    return result
  }

  saveProduct = async (product) => {
    const result = await productsService.saveProduct(product)
    return result
  }

  updateProduct = async (id, product, productReq, token) => {
    const decodedToken = jwt.verify(token, CONFIG.JWT_SECRET)

    if (decodedToken.rol === 'ADMIN' || (decodedToken.rol === 'PREMIUM' && decodedToken.email === product.owner)) {
      const result = await productsService.updateProduct(id, productReq)

      const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

      if (decodedToken.rol === 'ADMIN' && regex.test(product.owner)) {
        const email = {
          to: product.owner,
          subject: 'Producto Modificado',
          html: productUpdateNotification
        }
        await sendEmail(email)
      }
      return result
    } else {
      throw new RolForbiden("User does not owner of product")
    }
  }

  deleteById = async (id, token, product) => {
    const decodedToken = jwt.verify(token, CONFIG.JWT_SECRET)

    if (decodedToken.rol === 'ADMIN' || (decodedToken.rol === 'PREMIUM' && decodedToken.email === product.owner)) {
      const result = await productsService.deleteById(id)

      const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

      if (decodedToken.rol === 'ADMIN' && regex.test(product.owner)) {
        const email = {
          to: product.owner,
          subject: 'Producto Eliminado',
          html: productDeleteNotification
        }
        await sendEmail(email)
      }
      return result
    }else {
      throw new RolForbiden("User does not owner of product")
    }
  }
}