import UsersService from "../../services/users.service.js"
import __dirname from "../../utils/utils.js"
import { NotDocuments, ResultNotFound, UserCannotChanged } from "../../utils/recursos.js"
import UsersDto from "../../dao/DTOs/users.dto.js"

const usersService = new UsersService()

const current = async (req, res) => {
  res.sendSuccess(req.user)
}

const updateUserRole = async (req, res) => {
  try {
    const { uid } = req.params

    const user = await usersService.getById(uid)

    if (user.rol === 'ADMIN') {
      throw new UserCannotChanged('El rol ADMIN no puede cambiarse')
    }

    const requiredDocuments = ['Identificacion', 'ComprobanteDomicilio', 'ComprobanteEstadoCuenta']
    const missingDocuments = requiredDocuments.filter(document => user.documents.some(doc => doc.name.split(/[.-]/)[1] === document))

    let rol

    if (user.rol === 'USER') {
      if (missingDocuments.length === requiredDocuments.length) {
        rol = 'PREMIUM'
      } else {
        throw new UserCannotChanged('El usuario no ha terminado de procesar su documentación')
      }
    } else { rol = 'USER' }

    const result = await usersService.updateUserRole(uid, rol)

    res.sendSuccess(`Rol ${user.rol} modificado por ${rol}`)
    return req.logger.info(`Solicitud procesada: ${req.method} ${req.url}`)

  } catch (error) {
    req.logger.error(`${req.method} en ${req.url} - ${new Date().toISOString()} - ${error}`)

    if (error instanceof ResultNotFound) {
      return res.sendClientError(error.message)
    }

    if (error instanceof UserCannotChanged) {
      return res.sendClientError(error.message)
    }

    res.sendServerError(error)
  }
}

const saveDocuments = async (req, res) => {
  try {
    const uid = req.params.uid
    const files = req.files

    if (!files || files.length === 0) {
      throw new NotDocuments('No se han subido archivos.')
    }

    await usersService.getById(uid)

    let folder

    if (req.body.type === 'profile') {
      folder = 'profiles'
    } else if (req.body.type === 'product') {
      folder = 'products'
    } else {
      folder = 'documents'
    }

    const documents = files.map(file => ({
      name: file.filename,
      reference: `${__dirname}/public/${folder}/${file.filename}`
    }))

    const user = await usersService.saveDocuments(uid, documents)

    res.sendSuccess('Archivos subidos exitosamente.')

  } catch (error) {
    req.logger.error(`${req.method} en ${req.url} - ${new Date().toISOString()} - ${error}`)

    if (error instanceof NotDocuments) {
      return res.sendClientError(error.message)
    }

    if (error instanceof ResultNotFound) {
      return res.sendClientError(error.message)
    }

    res.status(500).send({ error })
  }
}

const getUsers = async (req, res) => {
  try {
    const users = await usersService.getUsers()
    const usersDto = users.map(user => new UsersDto(user))

    res.sendSuccess(usersDto)
    req.logger.info(`Solicitud procesada: ${req.method} ${req.url}`)

  } catch (error) {
    req.logger.error(`${req.method} en ${req.url} - ${new Date().toISOString()} - ${error}`)

    if (error instanceof ResultNotFound) {
      return res.sendClientError(error.message)
    }

    res.sendServerError(error)
  }
}

const deleteInactiveUsers = async (req, res) => {
  try {
    const usersDelete = await usersService.deleteInactiveUsers()

    res.sendSuccess(usersDelete)
    req.logger.info(`Solicitud procesada: ${req.method} ${req.url}`)

  } catch (error) {
    req.logger.error(`${req.method} en ${req.url} - ${new Date().toISOString()} - ${error}`)

    if (error instanceof ResultNotFound) {
      return res.sendClientError(error.message)
    }

    res.sendServerError(error)
  }
}

const deleteUsers = async (req, res) => {
  try {
    const uid = req.params.uid

    await usersService.getById(uid)

    const result = await usersService.deleteUsers(uid)

    res.sendSuccess('User deleted')
    req.logger.info(`Solicitud procesada: ${req.method} ${req.url}`)

  } catch (error) {
    req.logger.error(`${req.method} en ${req.url} - ${new Date().toISOString()} - ${error}`)

    if (error instanceof ResultNotFound) {
      return res.sendClientError(error.message)
    }

    res.sendServerError(error)
  }
}

export {
  current,
  updateUserRole,
  saveDocuments,
  getUsers,
  deleteInactiveUsers,
  deleteUsers
}