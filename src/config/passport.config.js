import passport from "passport";
import local from "passport-local";
import GitHubStrategy from "passport-github2";
import jwt from "passport-jwt"
import CONFIG from "./config.js";
import UsersManagerDB from "../dao/dbManagers/users.dao.js";
import { createHash, isValidPassword } from "../utils/utils.js";

const LocalStrategy = local.Strategy
const JWTStrategy = jwt.Strategy
const ExtractJWT = jwt.ExtractJwt

const usersManagerDb = new UsersManagerDB()

const initializePassport = () => {

  passport.use('register', new LocalStrategy({ passReqToCallback: true, usernameField: 'email' },
    async (req, password, done) => {
      const { first_name, last_name, age, email } = req.body

      try {
        let userFound = await usersManagerDb.getByEmail(email)
        if (userFound) return done(null, false, { message: 'User already exists' })

        let isAdminRegistration = (email === CONFIG.ADMIN_EMAIL && password === CONFIG.ADMIN_PWD)

        let newUser = {
          first_name,
          last_name,
          email,
          age,
          password: createHash(password),
          role: isAdminRegistration ? 'admin' : 'user'
        }

        let result = await usersManagerDb.saveUser(newUser)
        done(null, result)
      } catch (error) {
        done(`Error getting user: ${error}`)
      }
    }))

  passport.use('login', new LocalStrategy({ usernameField: 'email' },
    async (email, password, done) => {
      try {
        let userFound = await usersManagerDb.getByEmail(email)
        if (!userFound) return done(null, false, { message: 'User not found' })
        if (!isValidPassword(userFound, password)) return done(null, false, { message: 'Invalid password' })
        done(null, userFound)
      } catch (error) {
        done(`Error logging in user: ${error}`)
      }
    }))

  passport.use('github', new GitHubStrategy({
    clientID: CONFIG.CLIENT_ID,
    clientSecret: CONFIG.CLIENT_SECRET,
    callbackURL: CONFIG.CALLBACK_URL,
  },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const user = await usersManagerDb.getByEmail(profile._json.email)

        if (!user) {
          const newUser = {
            first_name: profile._json.name,
            last_name: '',
            age: 0,
            email: profile._json.email,
            rol: 'user',
            password: ''
          }

          const result = await usersManagerDb.saveUser(newUser)
          done(null, result)
        } else {
          done(null, user)
        }
      } catch (error) {
        done(error)
      }
    }))

  passport.serializeUser((user, done) => {
    done(null, user._id)
  })

  passport.deserializeUser(async (id, done) => {
    const user = await usersManagerDb.getById(id)
    done(null, user)
  })

  passport.use('jwt', new JWTStrategy({
    jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
    secretOrKey: CONFIG.JWT_SECRET
  }, async (jwt_payload, done) => {
    try {
      return done(null, jwt_payload.user)
    } catch (error) {
      return done(error)
    }
  }))
}

export default initializePassport