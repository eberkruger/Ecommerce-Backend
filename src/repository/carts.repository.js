import CartsManagerDB from "../dao/dbManagers/carts.dao.js";

const cartsManagerDB = new CartsManagerDB()

export default class CartsRepository {
  constructor() {

  }

  getAll = async () => {
    const result = await cartsManagerDB.getAll()
    return result
  }

  save = async (cart) => {
    const result = await cartsManagerDB.save({})
    return result
  }
  
  getById = async (id) => {
    const result = await cartsManagerDB.getById(id)
    return result
  }

  addProduct = async (cid, pid) => {
    const result = await cartsManagerDB.addProduct(cid, pid)
    return result
  }

  deleteProductFromCart = async (cid, pid) => {
    const result = await cartsManagerDB.deleteProductFromCart(cid, pid)
    return result
  }
  
  deleteAllProductsFromCart = async (cid) => {
    const result = await cartsManagerDB.deleteAllProductsFromCart(cid)
    return result
  }

  updateAllProducts = async (cid, products) => {
    const result = await cartsManagerDB.updateAllProducts(cid, products)
    return result
  }

  updateQuantity = async (cid, pid, updatedQuantity) => {
    const result = await cartsManagerDB.updateQuantity(cid, pid, updatedQuantity)
    return result
  }
}