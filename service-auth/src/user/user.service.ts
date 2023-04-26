import { Request } from 'express'
import UserModel from '../model/user'
import { Login, Register, ResponseUser, Token, User } from '../type'
import { generateJWT } from '../utils/jwt'
import { createUser, deleteUser, findByEmail, findByUserId, getUsers } from './user.db'
import { isValidObjectId } from 'mongoose'

const CreateUser = async (body: Register): Promise<User | undefined> => {
  try {
    const exist = await findByEmail(body.email)
    if (exist) {
      throw new Error('bad request')
    }

    const result: User | undefined = await createUser(body)
    if (!result) {
      throw new Error('bad request')
    }

    const user: User = ResponseUser(
      result._id,
      result.name,
      result.email,
      result.role,
      result.createdAt,
      result.updatedAt
    )

    return user
  } catch (error: any) {
    throw error.message
  }
}

const SignIn = async (body: Login): Promise<Token | undefined> => {
  try {
    const user = await findByEmail(body.email)
    if (!user) {
      throw new Error('username or password invalid')
    }

    const isMatch = await user.comparePassword(body.password)
    if (!isMatch) {
      throw new Error('username or password invalid')
    }
    return await generateJWT(user)
  } catch (error: any) {
    throw error.message
  }
}

const GetUsers = async (req: Request): Promise<User[] | []> => {
  try {
    let filter = {}
    if (req.query.name) {
      filter = {
        name: { $regex: req.query.name as string, $options: 'i' },
      }
    }
    const data = await getUsers(filter)
    const users: User[] = []
    for (const { _id, name, email, role, createdAt, updatedAt } of data) {
      users.push({ _id, name, email, role, createdAt, updatedAt })
    }
    return users
  } catch (error: any) {
    throw error.message
  }
}

const GetUserById = async (req: Request): Promise<User | null> => {
  try {
    const { id } = req.params
    if (!isValidObjectId(id)) {
      return null
    }

    return await findByUserId(id)
  } catch (error: any) {
    throw error.message
  }
}

const DeleteUser = async (req: Request): Promise<User | null> => {
  try {
    const { id } = req.params
    if (!isValidObjectId(id)) {
      return null
    }

    const user = await deleteUser(id)
    if (!user) {
      return null
    }
    return user
  } catch (error: any) {
    throw error.message
  }
}

export { CreateUser, SignIn, GetUsers, GetUserById, DeleteUser }
