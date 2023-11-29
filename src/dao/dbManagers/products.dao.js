import { productsModel } from "../models/products.schema.js";

export default class ProductsManagerDB {

  getAll = async (limit) => {
    try {
      if (limit) {
        const products = await productsModel.find().limit(limit).lean()
        return products
      } else {
        const products = await productsModel.find().lean()
        return products
      }
    } catch (error) {
      throw new Error("Failure to get products", error)
    }
  }

  getAllPage = async (limit, page, sort, query) => {
    try {
      if (sort) {
        const result = await productsModel.paginate(query, { limit, page, sort: { price: sort }, lean: true })
        return result
      } else {
        const result = await productsModel.paginate(query, { limit, page, lean: true })
        return result
      }
    } catch (error) {
      throw new Error("Failure to get paginated products", error)
    }
  }

  getById = async (id) => {
    try {
      const product = await productsModel.findOne({ _id: id }).lean()
      if (!product) {
        return { status: 'error', error: 'Product not found' }
      }
      return product
    } catch (error) {
      throw new Error("Failure to get product by Id", error)
    }
  }

  saveProduct = async (product) => {
    try {
      const saveProduct = await productsModel.create(product)
      return saveProduct
    } catch (error) {
      throw new Error("Failure to create new product", error)
    }
  }

  updateProduct = async (id, product) => {
    try {
      const productUpdated = await productsModel.findOneAndUpdate(
        { _id: id },
        product,
        { new: true, runValidators: true }
      )

      if (!productUpdated) {
        throw new Error("Product not found")
      }

      return productUpdated
    } catch (error) {
      throw new Error("Failure to update product", error)
    }
  }

  deleteById = async (id) => {
    try {
      const product = await productsModel.deleteOne({ _id: id })
      return product
    } catch (error) {
      throw new Error("Failure to delete product", error)
    }
  }
}