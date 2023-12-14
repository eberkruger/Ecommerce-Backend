import mongoose from "mongoose"
import CartsManagerDB from "../../src/dao/dbManagers/carts.dao.js"
import chai from "chai"
import CONFIG from "../../src/config/config.js"

await mongoose.connect(CONFIG.MONGO_URL)

const expect = chai.expect

let cartsDao

describe('Probando nuestro dao de carritos', () => {
  before(() => {
    cartsDao = new CartsManagerDB()
  })

  beforeEach(async () => {
    try {
      await mongoose.connection.collections.carts.drop()
    } catch (error) {
      console.log(error)
    }
  })

  it('El dao agregará al carrito creado un arreglo de productos vacio por defecto', async () => {
    const result = await cartsDao.save()
    expect(result.products).to.be.deep.equal([])
  })
})