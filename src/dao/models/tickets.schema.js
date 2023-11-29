import mongoose from "mongoose";

const ticketCollection = 'tickets'

const ticketsSchema = new mongoose.Schema({
  code: {
    type: String,
    unique: true,
    required: true
  },
  purchase_datetime: {
    type: Date,
    default: Date.now,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  purchaser: {
    type: String,
    required: true
  }
})

const ticketsModel = mongoose.model(ticketCollection, ticketsSchema)

export default ticketsModel