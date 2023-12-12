import UsersDto from "../../dao/DTOs/users.dto.js"
import { generateToken } from "../../utils/utils.js"

const authGithub = async (req, res) => {
  res.send({ status: 'success', message:'User Registered'})
}

const authGithubCallback = async (req, res) => {
  const userDto = new UsersDto(req.user)
  const userLog = {...userDto}
  const accessToken = generateToken(userLog)

  res.cookie('token', accessToken)
  res.redirect('/products')
}

export {
  authGithub,
  authGithubCallback
}