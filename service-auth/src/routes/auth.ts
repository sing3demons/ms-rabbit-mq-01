import { Router } from 'express'
import { signIn, signUp } from '../user/user.controller'

const router = Router({ caseSensitive: true })

router.post('/signup', signUp)

router.post('/signin', signIn)

export default router
