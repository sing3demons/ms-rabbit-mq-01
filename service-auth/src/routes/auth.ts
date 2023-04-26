import { Request, Response, Router } from 'express'
import UserModel from '../model/user'
import { sendToQueue } from '../rabbitmq'
import JSONResponse from '../utils/response'
import { Login, Register, User } from '../type'
import jwt from 'jsonwebtoken'
import { generateJWT } from '../utils/jwt'
import { signup } from '../user/user.controller'

const router = Router({ caseSensitive: true })

router.post('/signup', signup)

router.post('/signin', async (req: Request, res: Response) => {
  try {
    const body: Login = req.body
    const user = await UserModel.findOne({ email: body.email })
    if (!user) {
      JSONResponse.badRequest(req, res, 'username or password invalid')
      return
    }

    const isMatch = await user.comparePassword(body.password)
    if (!isMatch) {
      JSONResponse.badRequest(req, res, 'username or password invalid')
      return
    }

    const token = await generateJWT(user)

    JSONResponse.success(req, res, 'success', token)
  } catch (error) {}
})

export default router
