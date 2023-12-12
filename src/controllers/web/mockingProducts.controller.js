import { generateProductsMock } from "../../services/mock.service.js";

const getMocksProductsController = async (req, res) => {
  const result = await generateProductsMock(10)

  res.send({
    count: result.length,
    data: result
  })
}

export {
  getMocksProductsController
}