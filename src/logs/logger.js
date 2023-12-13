import winston from 'winston'
import CONFIG from "../config/config.js"

const customLevelOptions = {
  levels: {
    fatal: 0,
    error: 1,
    warning: 2,
    info: 3,
    http: 4,
    debug: 5
  },
  colors: {
    fatal: 'red',
    error: 'magenta',
    warning: 'cyan',
    info: 'yellow',
    http: 'green',
    debug: 'blue'
  }
}

let logger

if (CONFIG.NODE_ENV === 'production') {
  logger = winston.createLogger({
    levels: customLevelOptions.levels,
    transports: [
      new winston.transports.Console({
        level: 'info',
        format: winston.format.combine(
          winston.format.colorize({
            all: true,
            colors: customLevelOptions.colors
          }),
          winston.format.simple()
        )
      }),
      new winston.transports.File({
        filename: 'logs/errors.log',
        level: 'error'
      })
    ]
  })
} else {
  logger = winston.createLogger({
    levels: customLevelOptions.levels,
    transports: [
      new winston.transports.Console({
        level: 'debug',
        format: winston.format.combine(
          winston.format.colorize({
            all: true,
            colors: customLevelOptions.colors
          }),
          winston.format.simple()
        )
      })
    ]
  })
}

export const addLogger = (req, res, next) => {
  req.logger = logger
  next()
}