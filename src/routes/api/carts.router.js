import Router from "./router.js"
import { save, getById, addProduct, deleteProductFromCart, updateAllProducts, updateQuantity, deleteAllProductsFromCart, saveProductToCartSession, purchaseCart } from "../../controllers/api/carts.controller.js"
import __dirname from "../../utils/utils.js"

export default class CartsRouter extends Router {
  init() {
    this.post('/', ['PUBLIC'], save)
    this.get('/:cid', ['PUBLIC'], getById)
    this.post('/:cid/product/:pid', ['USER'], addProduct) //Agregar un producto dentro de un carrito específico (cid)
    this.delete('/:cid/product/:pid', ['USER', 'PREMIUM'], deleteProductFromCart)
    this.put('/:cid', ['PUBLIC'], updateAllProducts)
    this.put('/:cid/product/:pid', ['PUBLIC'], updateQuantity)
    this.delete('/:cid', ['PUBLIC'], deleteAllProductsFromCart)
    this.post('/cart/add/:id', ['USER', 'PREMIUM'], saveProductToCartSession) //agregar un producto dentro del carrito de mi usuario logeado
    this.post('/:cid/purchase', ['USER', 'PREMIUM'], purchaseCart)
  }
}