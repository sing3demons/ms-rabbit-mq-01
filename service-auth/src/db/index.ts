import mongoose from 'mongoose'
import logger from '../utils/logger'

const connectDB = async () => {
  try {
    const user = process.env.MONGO_USER
    const password = encodeURIComponent(process.env.MONGO_PASS!)
    const db = process.env.MONGO_DATABASE
    const ip = process.env.MONGO_IP
    const port = process.env.MONGO_PORT
    const auth = process.env.MONGO_AUTH
    const timeout = process.env.MONGO_TIMEOUT

    const MONGO_URI = `mongodb://${user}:${password}@${ip}:${port}/${db}?connectTimeoutMS=${timeout}&authSource=${auth}`
    const conn = await mongoose.connect(MONGO_URI)
    logger.info(`MongoDB Connected: ${conn.connection.host}`)
  } catch (error) {
    logger.error(`MongoDB connection error: ${error}`)
    process.exit(1)
  }
}

export default connectDB
