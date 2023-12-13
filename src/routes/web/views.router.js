import { Router } from "express"
import __dirname from "../../utils/utils.js"
import { getMocksProductsController } from "../../controllers/web/mockingProducts.controller.js"
import { publicAccess, privateAccess, privateUserAccess, privateAdminAccess, privateAdminPremiumAccess, getAllProducts, saveDeleteProductsSocket, chat, getProductsPaginate, getCart, register, login, profile, forgotPassword, resetPassword, usersView } from "../../controllers/web/views.controller.js"

const router = Router()

router.get('/login', publicAccess, login) 
router.get('/register', publicAccess, register)
router.get('/forgotPassword', publicAccess, forgotPassword)
router.get('/resetPassword', publicAccess, resetPassword)
router.get('/products', privateAccess, getProductsPaginate)
router.get('/realtimeproducts', privateAdminPremiumAccess, saveDeleteProductsSocket)
router.get('/chat', privateUserAccess, chat)
router.get('/cart', privateAccess, getCart)
router.get('/profile', privateAccess, profile)
router.get('/users', privateAdminAccess, usersView)

router.get('/', privateAccess, getAllProducts)

router.use('/mockinkg-products', getMocksProductsController)


export default router