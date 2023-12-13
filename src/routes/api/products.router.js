import Router from "./router.js"
import { getAllPage, getById, saveProduct, updateProduct, deleteById } from "../../controllers/api/products.controller.js"
import __dirname from "../../utils/utils.js"

export default class ProductsRouter extends Router {
  init() {
    this.get('/', ['PUBLIC'], getAllPage)
    this.get('/:pid', ['PUBLIC'], getById)
    this.post('/', ['ADMIN', 'PREMIUM'], saveProduct)
    this.put('/:pid', ['ADMIN', 'PREMIUM'], updateProduct)
    this.delete('/:pid', ['ADMIN', 'PREMIUM'], deleteById)
  }
}
