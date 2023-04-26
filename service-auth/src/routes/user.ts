import { Request, Response, Router } from 'express'
import UserModel from '../model/user'
import JSONResponse from '../utils/response'
import { User } from '../type'

const router = Router({ caseSensitive: true })

router.get('/', async (req: Request, res: Response) => {
  const data: User[] = await UserModel.find({})
  const users: User[] = []
  for (const { _id, name, email,role, createdAt, updatedAt } of data) {
    users.push({ _id, name, email, role, createdAt, updatedAt })
  }

  JSONResponse.success(req, res, 'success', users)
})

router.get('/:id', async (req: Request, res: Response) => {
  const data: User | null = await UserModel.findById(req.params.id)

  if (!data) {
    JSONResponse.notFound(req, res, 'User not found')
    return
  }

  const { _id, name, email, createdAt, updatedAt } = data
  JSONResponse.success(req, res, 'success', { _id, name, email, createdAt, updatedAt })
})

router.delete('/:id', async (req: Request, res: Response) => {
  const result = await UserModel.findByIdAndDelete(req.params.id)

  if (!result) {
    JSONResponse.notFound(req, res, 'User not found')
    return
  }

  JSONResponse.success(req, res, 'delete')
})

export default router
