import express, { Express, Request, Response } from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import os from 'os'
import logger from './utils/logger'
import connectDB from './db'
import JSONResponse from './utils/response'
import UserModel from './model/user'
import connectQueue, { sendToQueue } from './rabbitmq'

dotenv.config()

interface User {
  _id: string
  name: string
  email: string
  createdAt: Date
  updatedAt: Date
}

async function main() {
  const app: Express = express()
  const port = process.env.PORT
  await connectDB()
  const channel = await connectQueue()
  app.use(cors())
  app.use(express.json({ limit: '50mb' }))
  app.use(express.urlencoded({ extended: true }))

  app.get('/', async (req: Request, res: Response) => {
    const data: User[] = await UserModel.find({})
    const users: User[] = []
    for (const user of data) {
      users.push({
        _id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      })
    }

    JSONResponse.success(req, res, 'success', users)
  })

  app.post('/auth/signup', async (req: Request, res: Response) => {
    const result = await UserModel.create(req.body)
    const user: User = {
      _id: result._id,
      name: result.name,
      email: result.email,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
    }

    await sendToQueue(channel, user)
    JSONResponse.create(req, res, 'created', user)
  })

  app.listen(port, () => logger.info(`[server]: Server is running at ${os.hostname}:${port}`))
}

main()
