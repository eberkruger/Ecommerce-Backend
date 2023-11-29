import ticketsModel from "../models/tickets.schema.js";

export default class TicketsManagerDB {

  createTicket = async (ticket) => {
    try {
      const newTicket = await ticketsModel.create(ticket)
      return newTicket
    } catch (error) {
      throw new Error("Failure to create Ticket", error)
    }
  }

  getTicket = async (code) => {
    try {
      const getTicket = await ticketsModel.findOne({ code }).lean()
      return getTicket
    } catch (error) {
      throw new Error("Failure to get ticket", error)
    }
  }
}