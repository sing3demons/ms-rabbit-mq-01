import { Request, Response } from 'express'
import logger from './logger'

class JSONResponse {
  static success(req: Request, res: Response, message: string, data: object) {
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

  static serverError(req: Request, res: Response, message: string, data: object) {
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
