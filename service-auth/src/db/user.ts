import UserModel from '../model/user'

const findByEmail = async (email: string) => {
  try {
    return await UserModel.findOne({ email: email })
  } catch (error: any) {
    throw error.message
  }
}

export { findByEmail }
