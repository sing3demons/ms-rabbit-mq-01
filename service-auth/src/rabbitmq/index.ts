import amqp from 'amqplib'
import logger from '../utils/logger'

let channel: amqp.Channel | undefined

async function connectQueue(): Promise<amqp.Channel | undefined> {
  try {
    const url: string = process.env.RABBITMQ_URL!
    const connection = await amqp.connect(url)
    channel = await connection.createChannel()

    const queue = 'mail-queue'
    await channel.assertExchange('ex.sing.fanout', 'fanout', { durable: false })
    await channel.assertQueue(queue, { durable: false })
    await channel.bindQueue(queue, 'ex.sing.fanout', '')

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

const sendToQueue = async (type: string, msg: object) => {
  try {
    const queue = 'mail-queue'
    const as = await channel?.assertQueue(queue, { durable: false })
    console.log(as)

    channel?.sendToQueue(queue, Buffer.from(JSON.stringify(msg)), {
      contentType: 'application/json',
      contentEncoding: 'utf-8',
      type,
      persistent: true,
    })
  } catch (error) {
    logger.error(error)
  }
}

export default connectQueue

export { sendToQueue, consumeMessage }
