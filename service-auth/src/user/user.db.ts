import { ObjectId } from 'mongoose'
import UserModel from '../model/user'
import { Register } from '../type'

export async function findByEmail(email: string) {
  try {
    return await UserModel.findOne({ email: email })
  } catch (error: any) {
    throw error.message
  }
}

export async function createUser(user: Register) {
  try {
    return await UserModel.create(user)
  } catch (error: any) {
    throw error.message
  }
}

export async function getUsers(filter: Object) {
  try {
    return await UserModel.find(filter).select('name email role').exec()
  } catch (error: any) {
    throw error.message
  }
}
export async function findByUserId(id: string) {
  try {
    return await UserModel.findById(id).select('name email role').exec()
  } catch (error: any) {
    throw error.message
  }
}

export async function deleteUser(id: string) {
  try {
    return await UserModel.findByIdAndDelete(id)
  } catch (error: any) {
    throw error.message
  }
}
