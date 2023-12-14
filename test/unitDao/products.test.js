import mongoose, { mongo } from "mongoose";
import ProductsManagerDB from "../../src/dao/dbManagers/products.dao.js";
import chai from "chai";
import CONFIG from "../../src/config/config.js";

await mongoose.connect(CONFIG.MONGO_URL)

const expect = chai.expect

let productsDao

describe('Probando nuestro dao de productos', () => {
  before(() => {
    productsDao = new ProductsManagerDB()
  })

  beforeEach(async () => {
    try {
      await mongoose.connection.collections.products.drop()
    } catch (error) {
      console.log(error)
    }
  })

  //Escenario 1
  it('El dao debe poder obtener los productos en formato de arreglo', async () => {
    const result = await productsDao.getAll()
    expect(result).to.be.deep.equal([])
    expect(Array.isArray(result)).to.be.equal(true)
  })

  //Escenario 2
  it('El dao debe agergar los productos correctamente a la base de datos', async () => {
    const mockProduct = {
      title: 'Prueba Save',
      description: 'color sahara',
      code: 'MN1',
      price: '50',
      stock: 5,
      category: 'Room'
    }
    const result = await productsDao.saveProduct(mockProduct)
    expect(result._id).to.be.ok
  })

  //Escenario 3
  it('El dao debe ontener un producto por id', async () => {
    const mockProduct = {
      title: 'Prueba getById',
      description: 'color sahara',
      code: 'MN1',
      price: '50',
      stock: 5,
      category: 'Room'
    }
    const result = await productsDao.saveProduct(mockProduct)

    const product = await productsDao.getById({ _id: result._id })

    expect(typeof product).to.be.equal('object')
  })

  //Escenario 4
  it('El dao debe poder actualizar un producto', async () => {
    const mockProduct = {
      title: 'Prueba update',
      description: 'color sahara',
      code: 'MN1',
      price: '50',
      stock: 5,
      category: 'Room'
    };
    const result = await productsDao.saveProduct(mockProduct)

    const mockProductUpdate = {
      title: 'Prueba ejecutada update',
      description: 'Test'
    }

    await productsDao.update(mockProductUpdate, result._id)

    const product = await productsDao.getById({ _id: result._id })

    expect(product.title).to.be.equal(mockProductUpdate.title)
    expect(product.description).to.be.equal(mockProductUpdate.description)
  })

  //Escenario 5
  it('El dao debe poder eliminar un producto', async () => {
    const mockProduct = {
      title: 'Prueba update',
      description: 'color sahara',
      code: 'MN1',
      price: '50',
      stock: 5,
      category: 'Room'
    }
    const result = await productsDao.saveProduct(mockProduct)

    await productsDao.deleteById(result._id)

    const products = await productsDao.getAll()
    expect(products).to.be.deep.equal([])
  })
})