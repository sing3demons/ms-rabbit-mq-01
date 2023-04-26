import UserModel from '../model/user'
import { sendToQueue } from '../rabbitmq'
import { Register, ResponseUser, User } from '../type'
import JSONResponse from '../utils/response'
import { Request, Response } from 'express'
import { userSchema } from './user.interface'

const signup = async (req: Request, res: Response) => {
  try {
    const { error } = userSchema.validate(req.body)
    if (error) {
      console.error(error.details)
      error.details.forEach(() => {
        throw new Error('bad request')
      })
    }

    const body: Register = req.body
    const exist = await UserModel.findOne({ email: body.email })
    if (exist) {
      JSONResponse.badRequest(req, res, 'username or password invalid')
      return
    }
    const result = await UserModel.create(body)

    const user: User = ResponseUser(
      result._id,
      result.name,
      result.email,
      result.role,
      result.createdAt,
      result.updatedAt
    )

    // const user: User = {
    //   _id: result._id,
    //   name: result.name,
    //   email: result.email,
    //   role: result.role,
    //   createdAt: result.createdAt,
    //   updatedAt: result.updatedAt,
    // }

    const type: string = 'Created'
    await sendToQueue(type, user)
    JSONResponse.create(req, res, type, result._id)
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'bad request') {
        JSONResponse.badRequest(req, res, error.message)
        return
      }
      JSONResponse.serverError(req, res, error.message)
    }
  }
}

export { signup }
