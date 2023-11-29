import { faker } from "@faker-js/faker";

export const generateProductsMock = (numberOfProducts) => {

  let productsMock = []

  for (let i = 0; i < numberOfProducts; i++) {
    let newMockProduct = {
      id: faker.database.mongodbObjectId(),
      title: faker.commerce.product(),
      description: faker.commerce.productDescription(),
      price: parseFloat(faker.commerce.price()),
      thumbnails: faker.image.url(),
      code: faker.string.alphanumeric(10),
      stock: faker.number.int({ min: 0, max: 50 }),
      category: faker.commerce.department(),
      status: faker.datatype.boolean()
    }

    productsMock.push(newMockProduct)
  }
  return { status: 'success', payload: productsMock}
}