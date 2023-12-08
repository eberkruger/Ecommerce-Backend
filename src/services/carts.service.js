import CartsRepository from "../repository/carts.repository.js";
import CONFIG from "../config/config.js";
import { ResultNotFound, RolForbiden } from "../utils/recursos.js";
import ProductsService from "./products.service.js";
import UsersService from "./users.service.js";
import jwt from "jsonwebtoken"
import TicketsRepository from "../repository/tickets.respository.js";
import { v4 } from "uuid";
import { successfulPurchase } from "../utils/customHTML.js";
import { sendEmail } from "./email.service.js";

const cartsService = new CartsRepository()
const ticketsService = new TicketsRepository()
const productsService = new ProductsService()
const usersService = new UsersService()

export default class CartsService {

  save = async () => {
    const result = await cartsService.save()
    return result
  }

  getById = async (id) => {
    const result = await cartsService.getById(id)
    return result
  }

  addProduct = async (cid, pid) => {
    const result = await cartsService.addProduct(cid, pid)
    return result
  }

  deleteProductFromCart = async (cid, pid) => {
    const cart = await cartsService.getById(cid)

    if (!cart) {
      throw new ResultNotFound('Cart not found')
    }

    const product = await productsService.getById(pid)

    if (!product) {
      throw new ResultNotFound('Product not found')
    }

    const prodIndex = cart.products.findIndex(prod => prod.product._id == pid)

    if (prodIndex > -1) {
      let result = await cartsService.deleteProductFromCart(cid, pid)
      return result
    } else {
      throw new ResultNotFound('The product does not exist in the cart')
    }
  }

  updateAllProducts = async (cid, products) => {
    const result = await cartsService.updateAllProducts(cid, products)
    return result
  }

  updateQuantity = async (cid, pid, updatedQuantity) => {
    const result = await cartsService.updateQuantity(cid, pid, updatedQuantity)
    return result
  }

  deleteAllProductsFromCart = async (cid) => {
    const result = await cartsService.deleteAllProductsFromCart(cid)
    return result
  }

  saveProductToCartSession = async (pid, token) => {
    const decodedToken = jwt.verify(token, CONFIG.JWT_SECRET)

    let cart
    const user = await usersService.getByEmail(decodedToken.email)

    if (user.cart === '') {
      cart = await cartsService.save()
      await usersService.updateCart(decodedToken.email, cart._id)
    } else {
      cart = await cartsService.getById(user.cart)
    }

    const product = await productsService.getById(pid)

    if (product.owner === decodedToken.email) {
      throw new RolForbiden('The owner cannot add his own products to the cart')
    }

    const cid = cart._id

    const cartDB = await cartsService.getById(cid)

    if (!cartDB) {
      throw new ResultNotFound('Cart not found')
    }

    const result = await cartsService.addProduct(cid, pid)
    return result
  }

  purchaseCart = async (cart, user) => {
    const productsPurchase = []
    const productsCanceled = []

    for (const item of cart.products) {
      const product = await productsService.getById(item.product)

      if (product.stock >= item.quantity) {
        const price = product.price
        productsPurchase.push({ ...item, price })
        product.stock -= item.quantity
        await productsService.updateProduct({ "stock": product.stock }, product._id)
      } else {
        productsCanceled.push(item)
      }
    }

    const total = productsPurchase.reduce((acc, product) => acc + product.price * product.quantity, 0)

    await cartsService.updateAllProducts(cart._id, productsCanceled)

    const code = v4()
    const purchaseDatetime = new Date()

    const ticket = {
      code: code,
      date: purchaseDatetime,
      amount: total,
      purchaser: user.email
    }

    await ticketsService.createTicket(ticket)

    const ticketResult = {
      productsPurchased: productsPurchase,
      total: total,
      productsUnpurchased: productsCanceled,
    }

    const productsPurchasedTitle = productsPurchase.map(item => item.product.title)
    const productsUnpurchasedTitle = productsCanceled.map(item => item.product.title)

    const email = {
      to: user.email,
      subject: 'Compra Exitosa',
      html: successfulPurchase(productsPurchasedTitle, total, productsUnpurchasedTitle)
    }
    await sendEmail(email)

    return ticketResult
  }
}