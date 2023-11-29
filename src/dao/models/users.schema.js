import mongoose from "mongoose";

const usersCollection = 'users'

const usersSchema = new mongoose.Schema({

  first_name: {
    type: String,
    require: true,
  },
  last_name: {
    type: String,
    require: true,
  },
  email: {
    type: String,
    require: true,
    unique: true,
  },
  age: {
    type: Number,
    require: true,
  },
  password: {
    type: String,
    require: true,
  },
  rol: {
    type: String,
    require: true,
    default: 'user',
  },
  cart: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'carts',
    default: ''
  },
  documents: [{
    name: String,
    reference: String
  }],
  last_connection: Date
})

const usersModel = mongoose.model(usersCollection, usersSchema)

export default usersModel