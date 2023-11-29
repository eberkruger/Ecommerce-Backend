import { cartsModel } from "../models/carts.schema.js";

export default class CartsManagerDB {

  getAll = async () => {
    try {
      const carts = await cartsModel.find().lean()
      return carts
    } catch (error) {
      throw new Error("Failure to get carts", error)
    }
  }

  save = async (cart) => {
    try {
      const newCart = await cartsModel.create({})
      return newCart
    } catch (error) {
      throw new Error("Failure to save new cart", error)
    }
  }

  getById = async (id) => {
    try {
      const cart = await cartsModel.findOne({ _id: id }).lean().populate('products.product')
      if (!cart) {
        return null
      } else {
        return cart
      }
    } catch (error) {
      throw new Error("Failure to get cart by Id", error)
    }
  }

  addProduct = async (cid, pid) => {
    const newProduct = { product: pid, quantity: 1 }
    try {
      const cart = await cartsModel.findById(cid)
      const indexProduct = cart.products.findIndex((item) => item.product == pid)
      if (indexProduct < 0) {
        cart.products.push(newProduct)
      } else {
        cart.products[indexProduct].quantity += 1
      }
      await cart.save()
      return cart
    } catch (error) {
      throw new Error("Failure to add product to cart", error)
    }
  }

  deleteProductFromCart = async (cid, pid) => {
    try {
      const updatedCart = await cartsModel.findOneAndUpdate(
        { _id: cid },
        { $pull: { products: { product: pid } } },
        { new: true }
      ).populate("products.product")

      if (updatedCart) {
        return updatedCart
      } else {
        throw new Error("Product not found in the cart")
      }

    } catch (error) {
      throw new Error("Failure to delete product from cart", error)
    }
  }

  deleteAllProductsFromCart = async (cid) => {
    try {
      const updatedCart = await cartsModel.findOneAndUpdate(
        { _id: cid },
        { $set: { products: [] } },
        { new: true }
      ).populate("products.product")

      if (updatedCart) {
        return updatedCart
      } else {
        throw new Error("The cart is empty")
      }
    } catch (error) {
      throw new Error("Failure to remove all products from carts", error)
    }
  }

  updateAllProducts = async (cid, products) => {
    try {
      await this.deleteAllProductsFromCart(cid)
      await products.forEach((product) => {
        this.addProduct(cid, product.id)
      })

      return this.getById(cid)

    } catch (error) {
      throw new Error("Failure to update all products from cart", error)
    }
  }

  updateQuantity = async (cid, pid, updatedQuantity) => {
    try {
      const currentCart = await this.getById(cid)
      const indexProduct = currentCart.products.findIndex((item) => item.product.toString() === pid)

      if (indexProduct !== -1) {
        currentCart.products[indexProduct].quantity = updatedQuantity
        await currentCart.save()
        return currentCart
      } else {
        throw new Error("Product not found on cart")
      }
    } catch (error) {
      throw new Error("Failure to update product quantity", error)
    }
  }
}