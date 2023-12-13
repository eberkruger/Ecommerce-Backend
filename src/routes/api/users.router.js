import Router from "./router.js"
import uploader from "../../utils/uploader.js"
import { current, updateUserRole, saveDocuments, getUsers, deleteInactiveUsers, deleteUsers } from "../../controllers/api/users.controller.js"

export default class UsersRouter extends Router {
  init() {
    this.get('/currentUser', ['ADMIN'], current)
    this.post('/premium/:uid', ['ADMIN'], updateUserRole)
    this.post('/:uid/documents', ['USER', 'PREMIUM', 'ADMIN'], uploader.array('document'), saveDocuments)
    this.get('/', ['ADMIN'], getUsers)
    this.delete('/', ['ADMIN'], deleteInactiveUsers)
    this.delete('/:uid', ['ADMIN'], deleteUsers)
  }
}