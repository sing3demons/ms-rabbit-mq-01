import amqp from 'amqplib'
import logger from '../utils/logger'

async function connectQueue(): Promise<amqp.Channel | undefined> {
  try {
    const url: string = process.env.RABBITMQ_URL!
    const connection = await amqp.connect(url)
    const channel = await connection.createChannel()

    const queue = 'mail-queue'
    await channel.assertQueue(queue, { durable: false })

    return channel
  } catch (error) {
    logger.error(error)
    process.exit(1)
  }
}

const consumeMessage = async (channel: amqp.Channel | undefined) => {
  try {
    const queue = 'mail-queue'
    channel?.consume(queue, (data: any) => {
      logger.info(`consume :: ${Buffer.from(data.content)}`)
      channel.ack(data)
    })
  } catch (error) {
    logger.error(error)
  }
}

const sendToQueue = async (channel: amqp.Channel | undefined, msg: object) => {
  try {
    const queue = 'mail-queue'
    await channel?.assertQueue(queue, { durable: false })
    channel?.sendToQueue(queue, Buffer.from(JSON.stringify(msg)), {
      contentType: 'application/json',
      contentEncoding: 'utf-8',
      type: 'Created',
      persistent: true,
    })
  } catch (error) {
    logger.error(error)
  }
}

export default connectQueue

export { sendToQueue, consumeMessage }
