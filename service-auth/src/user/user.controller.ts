import { sendToQueue } from '../rabbitmq'
import { User } from '../type'
import JSONResponse from '../utils/response'
import { Request, Response } from 'express'
import { loginSchema, userSchema } from './user.interface'
import { CreateUser, DeleteUser, GetUserById, GetUsers, SignIn } from './user.service'

const signUp = async (req: Request, res: Response) => {
  try {
    const { value, error } = userSchema.validate(req.body)
    if (error) {
      error.details.forEach(() => {
        throw new Error('bad request')
      })
    }

    const result: User | undefined = await CreateUser(value)
    if (!result) {
      throw new Error('bad request')
    }

    const type: string = 'Created'
    await sendToQueue(type, result)
    JSONResponse.create(req, res, type, result)
  } catch (error: any) {
    if (error === 'bad request') {
      JSONResponse.badRequest(req, res, error)
      return
    } else {
      JSONResponse.serverError(req, res, error)
    }
  }
}

const signIn = async (req: Request, res: Response) => {
  try {
    const { value, error } = loginSchema.validate(req.body)
    if (error) {
      error.details.forEach(() => {
        throw new Error('bad request')
      })
    }

    const token = await SignIn(value)
    if (!token) {
      throw new Error('username or password invalid')
    }

    JSONResponse.success(req, res, 'success', token)
  } catch (error) {
    if (error === 'bad request') {
      JSONResponse.badRequest(req, res, error)
      return
    } else if (error === 'username or password invalid') {
      JSONResponse.badRequest(req, res, 'username or password invalid')
    } else {
      JSONResponse.serverError(req, res, 'system error')
    }
  }
}

const getUsers = async (req: Request, res: Response) => {
  try {
    const users: User[] | [] = await GetUsers(req)
    JSONResponse.success(req, res, 'success', users)
  } catch (error) {
    JSONResponse.serverError(req, res, 'system error')
  }
}

const getUser = async (req: Request, res: Response) => {
  try {
    const user = await GetUserById(req)
    if (!user) {
      JSONResponse.notFound(req, res, 'Not found')
      return
    }
    const { _id, name, email, createdAt, updatedAt } = user
    JSONResponse.success(req, res, 'success', { _id, name, email, createdAt, updatedAt })
  } catch (error) {
    JSONResponse.serverError(req, res, 'system error')
  }
}

const deleteUser = async (req: Request, res: Response) => {
  try {
    const result = await DeleteUser(req)
    if (!result) {
      JSONResponse.notFound(req, res, 'User not found')
      return
    }

    JSONResponse.success(req, res, 'delete')
  } catch (error) {
    JSONResponse.serverError(req, res, 'system error')
  }
}

export { signUp, signIn, getUsers, getUser, deleteUser }
