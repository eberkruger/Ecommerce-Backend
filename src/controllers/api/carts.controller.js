import CartsService from "../../services/carts.service.js"
import ProductsService from "../../services/products.service.js"
import { ResultNotFound, RolForbiden } from "../../utils/recursos.js"

const cartsService = new CartsService()
const productsService = new ProductsService()

const save = async (req, res) => {
  try {
    const result = await cartsService.save()
    res.sendSuccess({ message: 'Carrito creado', payload: result })
    req.logger.info(`Solicitud procesada: ${req.method} ${req.url}`)

  } catch (error) {
    res.sendServerError(error)
    req.logger.error(`${req.method} en ${req.url} - ${new Date().toISOString()} - ${error}`)
  }
}

const getById = async (req, res) => {
  try {
    const cid = req.params.cid
    const result = await cartsService.getById(cid)

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

const addProduct = async (req, res) => {
  try {
    const cid = req.params.cid
    const pid = req.params.pid

    await cartsService.getById(cid)
    await productsService.getById(pid)

    const result = await cartsService.addProduct(cid, pid)

    res.sendSuccess('Producto agregado al carrito')
    req.logger.info(`Solicitud procesada: ${req.method} ${req.url}`)

  } catch (error) {
    req.logger.error(`${req.method} en ${req.url} - ${new Date().toISOString()} - ${error}`)
    if (error instanceof ResultNotFound) {
      return res.sendClientError(error.message)
    }
    res.sendServerError(error)
  }
}

const deleteProductFromCart = async (req, res) => {
  try {
    const cid = req.params.cid
    const pid = req.params.pid

    const result = await cartsService.deleteProductFromCart(cid, pid)

    res.sendSuccess('Producto eliminado del carrito')
    req.logger.info(`Solicitud procesada: ${req.method} ${req.url}`)

  } catch (error) {
    req.logger.error(`${req.method} en ${req.url} - ${new Date().toISOString()} - ${error}`)
    if (error instanceof ResultNotFound) {
      return res.sendClientError(error.message)
    }
    res.sendServerError(error)
  }
}

const updateAllProducts = async (req, res) => {
  try {
    const productsUpdate = req.body
    const cid = req.params.cid

    await cartsService.getById(cid);
    await productsService.getById(productsUpdate[0].product)

    const result = await cartsService.updateCart(cid, productsUpdate)

    res.sendSuccess('Carrito modificadoo')
    req.logger.info(`Solicitud procesada: ${req.method} ${req.url}`)

  } catch (error) {
    req.logger.error(`${req.method} en ${req.url} - ${new Date().toISOString()} - ${error}`)
    if (error instanceof ResultNotFound) {
      return res.sendClientError(error.message)
    }
    res.sendServerError(error)
  }
}

const updateQuantity = async (req, res) => {
  try {
    const cid = req.params.cid
    const pid = req.params.pid
    const quantityUpdate = req.body

    await cartsService.getById(cid)
    await productsService.getById(pid)

    const result = await cartsService.updateQuantity(cid, pid, quantityUpdate);

    res.sendSuccess('Cantidad del producto modificado')
    req.logger.info(`Solicitud procesada: ${req.method} ${req.url}`)

  } catch (error) {
    req.logger.error(`${req.method} en ${req.url} - ${new Date().toISOString()} - ${error}`)
    if (error instanceof ResultNotFound) {
      return res.sendClientError(error.message)
    }
    res.sendServerError(error)
  }
}

const deleteAllProductsFromCart = async (req, res) => {
  try {
    const cid = req.params.cid

    await cartsService.getById(cid)

    const result = await cartsService.deleteAllProductsFromCart(cid)

    res.sendSuccess('Productos eliminados del carrito')
    req.logger.info(`Solicitud procesada: ${req.method} ${req.url}`)

  } catch (error) {
    req.logger.error(`${req.method} en ${req.url} - ${new Date().toISOString()} - ${error}`)
    if (error instanceof ResultNotFound) {
      return res.sendClientError(error.message)
    }
    res.sendServerError(error)
  }
}

const saveProductToCartSession = async (req, res) => {
  try {
    const pid = req.params.id
    const quantityProduct = req.body.quantityProduct
    const token = req.cookies.token

    let quantity
    if (quantityProduct) { quantity = quantityProduct } else { quantity = 1 }

    const result = await cartsService.saveProductToCartSession(pid, token, quantity)

    res.sendSuccess('Producto agregado al carrito')
    req.logger.info(`Solicitud procesada: ${req.method} ${req.url}`)

  } catch (error) {
    req.logger.error(`${req.method} en ${req.url} - ${new Date().toISOString()} - ${error}`)

    if (error instanceof ResultNotFound) {
      return res.sendClientError(error.message)
    }
    if (error instanceof RolForbiden) {
      return res.sendForbbidenError(error.message)
    }

    res.sendServerError(error)
  }
}

const purchaseCart = async (req, res) => {
  try {
    const cid = req.params.cid

    const cart = await cartsService.getById(cid)

    const user = req.user

    const result = await cartsService.purchaseCart(cart, user)

    res.sendSuccess({ result })
    req.logger.info(`Solicitud procesada: ${req.method} ${req.url}`)

  } catch (error) {
    req.logger.error(`${req.method} en ${req.url} - ${new Date().toISOString()} - ${error}`)
    if (error instanceof ResultNotFound) {
      return res.sendClientError(error.message)
    }
    res.sendServerError(error)
  }
}

export {
  save,
  getById,
  addProduct,
  deleteProductFromCart,
  updateAllProducts,
  updateQuantity,
  deleteAllProductsFromCart,
  saveProductToCartSession,
  purchaseCart
}
