import ProductsManagerDB from "../dao/dbManagers/products.dao.js";

const productsManagerDB = new ProductsManagerDB()

export default class ProductsRepository {
  constructor() {

  }

  getAll = async (limit) => {
    const result = await productsManagerDB.getAll(limit)
    return result
  }

  getAllPage = async (limit, page, sort, query) => {
    const result = await productsManagerDB.getAllPage(limit, page, sort, query)
    return result
  }

  getById = async (id) => {
    const result = await productsManagerDB.getById(id)
    return result
  }

  saveProduct = async (product) => {
    const result = await productsManagerDB.saveProduct(product)
    return result
  }

  updateProduct = async (id, product) => {
    const result = await productsManagerDB.updateProduct(id, product)
    return result
  }
  
  deleteById = async (id) => {
    const result = await productsManagerDB.deleteById(id)
    return result
  }
}