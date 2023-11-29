import TicketsManagerDB from "../dao/dbManagers/tickets.dao.js";

const ticketsManagerDB = TicketsManagerDB()

export default class TicketsRepository {
  constructor() {

  }

  createTicket = async (ticket) => {
    const result = await ticketsManagerDB.createTicket(ticket)
    return result
  }

  getTicket = async (code) => {
    const result = await ticketsManagerDB.getTicket(code)
    return result
  }
}