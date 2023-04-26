import express, { Express } from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import os from 'os'
import logger from './utils/logger'
import connectDB from './db'
import connectQueue from './rabbitmq'
import morgan from 'morgan'

import home from './routes/index'
import auth from './routes/auth'
import users from './routes/user'
import { decodeToken } from './utils/jwt'
dotenv.config()

async function main() {
  const app: Express = express()
  const port = process.env.PORT
  await connectDB()
  await connectQueue()
  app.use(cors())
  app.use(morgan('dev'))
  app.use(express.json({ limit: '50mb' }))
  app.use(express.urlencoded({ extended: true }))

  app.use('/', home)
  app.use('/auth', auth)

  app.use('/users', decodeToken, users)

  app.listen(port, () => logger.info(`[server]: Server is running at ${os.hostname}:${port}`))
}

main()
