import express, { Express, Request, Response } from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import os from 'os'
import logger from './utils/logger'
import connectDB from './db'
import JSONResponse from './utils/response'
import UserModel from './model/user'
import connectQueue, { consumeMessage, sendToQueue } from './rabbitmq'

dotenv.config()

async function main() {
  const app: Express = express()
  const port = process.env.PORT
  await connectDB()
  const channel = await connectQueue()
  app.use(cors())
  app.use(express.json({ limit: '50mb' }))
  app.use(express.urlencoded({ extended: true }))

  app.get('/', async (req: Request, res: Response) => {
    const data = await UserModel.find({})
    // await consumeMessage(channel)
    JSONResponse.success(req, res, 'success', data)
  })

  app.post('/auth/signup', async (req: Request, res: Response) => {
    const result: { password?: string } = await UserModel.create(req.body)
    delete result.password

    await sendToQueue(channel, result)
    JSONResponse.create(req, res, 'created', result)
  })

  app.listen(port, () => logger.info(`[server]: Server is running at ${os.hostname}:${port}`))
}

main()
