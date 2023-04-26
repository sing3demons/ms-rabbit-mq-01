import { Request, Response } from 'express'
import logger from './logger'

class JSONResponse {
  static success(req: Request, res: Response, message: string, data?: object) {
    req.body.password && delete req.body.password
    logger.info(
      JSON.stringify({
        ip: req.ip,
        method: req.method,
        url: req.url,
        query: req.query,
        body: req.body,
        data: data,
      })
    )
    res.status(200).json({
      code: 200,
      message: message || 'success',
      data: data,
    })
  }

  static create(req: Request, res: Response, message: string, data: object) {
    req.body.password && delete req.body.password

    logger.info(
      JSON.stringify({
        ip: req.ip,
        method: req.method,
        url: req.url,
        body: req.body,
        data: data,
      })
    )
    res.status(201).json({
      code: 201,
      message: message || 'created',
      data: data,
    })
  }

  static badRequest(req: Request, res: Response, message: string, data?: object) {
    if (req.body?.password) {
      delete req.body.password
    }

    logger.info(
      JSON.stringify({
        ip: req.ip,
        method: req.method,
        url: req.url,
        query: req.query,
        body: req.body,
        data: data,
      })
    )

    res.status(400).json({
      code: 400,
      message: message || 'bad request',
      data: data,
    })
  }

  static notFound(req: Request, res: Response, message: string) {
    logger.info(
      JSON.stringify({
        ip: req.ip,
        method: req.method,
        url: req.url,
        query: req.query,
      })
    )
    res.status(404).json({
      code: 404,
      message: message || 'not found',
    })
  }

  static unauthorized(req: Request, res: Response, message: string) {
    logger.info(
      JSON.stringify({
        ip: req.ip,
        method: req.method,
        url: req.url,
        query: req.query,
      })
    )
    res.status(401).json({
      code: 401,
      message: message || 'unauthorized',
    })
  }

  static serverError(req: Request, res: Response, message: string, data?: object) {
    logger.info(
      JSON.stringify({
        ip: req.ip,
        method: req.method,
        url: req.url,
        query: req.query,
        data: data,
      })
    )
    res.status(500).json({
      code: 500,
      message: message || 'internal server error',
      data: data,
    })
  }
}

export default JSONResponse
