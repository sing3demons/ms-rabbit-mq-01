import { Request, Response, Router } from 'express'

const router = Router({ caseSensitive: true })
router.get('/', (req: Request, res: Response) => {
  res.status(200).send('Hello World!')
})

router.get('/healthz', (req: Request, res: Response) => {
  res.status(200).send('OK')
})

export default router
