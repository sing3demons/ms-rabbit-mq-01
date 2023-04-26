import jwt from 'jsonwebtoken'
import { NextFunction, Request, Response } from 'express'

import { Token, User } from '../../type'
import JSONResponse from '../response'



function generateJWT(user: User): Promise<Token> | undefined {
  return new Promise<Token>((resolve, reject) => {
    const payload = {
      sub: user._id,
      username: user.name,
      role: user.role,
    }

    const ATS: jwt.Secret | undefined = process.env.ACCESS_TOKEN_SECRET
    if (!ATS) {
      reject(new Error('ACCESS_TOKEN_SECRET is not defined'))
      return
    }
    const RTS: jwt.Secret | undefined = process.env.REFRESH_TOKEN_SECRET
    if (!RTS) {
      reject(new Error('REFRESH_TOKEN_SECRET is not defined'))
      return
    }
    const accessToken = jwt.sign(payload, ATS, { expiresIn: '1h' })
    const refreshToken = jwt.sign(payload, RTS, { expiresIn: '1d' })

    resolve({ access_token: accessToken, refresh_token: refreshToken })
  })
}

interface TokenData extends Request {
  tokenDt: Object
}

function decodeToken(req: Request, res: Response, next: NextFunction) {
  return verify(req as TokenData, res, next)
}

function verify(req: TokenData, res: Response, next: NextFunction) {
  try {
    if (!req.headers['authorization']) return JSONResponse.unauthorized(req, res, 'Unauthorized')

    const token = req.headers['authorization'].replace('Bearer ', '')
    const secret: jwt.Secret | undefined = process.env.ACCESS_TOKEN_SECRET
    if (!secret) {
      JSONResponse.unauthorized(req, res, 'Unauthorized')
      return
    }
    jwt.verify(token, secret, (err, decoded: any) => {
      if (err) return JSONResponse.unauthorized(req, res, 'Unauthorized')

      req.tokenDt = {
        userId: decoded.sub,
        role: decoded.role,
      }
      next()
    })
  } catch (error: any) {
    return JSONResponse.unauthorized(req, res, 'Unauthorized')
  }
}

export { generateJWT, decodeToken }
