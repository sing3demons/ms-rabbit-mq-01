import { Request, Response, Router } from 'express'
import UserModel from '../model/user'
import JSONResponse from '../utils/response'
import { User } from '../type'
import { deleteUser, getUser, getUsers } from '../user/user.controller'

const router = Router({ caseSensitive: true })

router.get('/', getUsers)

router.get('/:id', getUser)

// router.patch('/:id', async (req: Request, res: Response) => {})

router.delete('/:id', deleteUser)

export default router
