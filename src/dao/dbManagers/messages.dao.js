import { chatModel } from "../models/messages.schema.js";

export default class ChatManagerDb {

  save = async (message) => {
    try {
      const newMessage = await chatModel.create(message)
      return newMessage
    } catch (error) {
      throw new Error("Failure to send new message", error)
    }
  }

  getMessages = async () => {
    try {
      const messages = await chatModel.find().lean()
      return messages
    } catch (error) {
      throw new Error("Failure to get messages", error)
    }
  }
}