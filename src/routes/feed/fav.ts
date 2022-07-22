import express from 'express'
const { Router } = express
import { getFav } from 'controllers/feed/fav.js'
import isAuth from 'middleware/is-auth.js'

const router: any = Router()

router.get('/:page', isAuth, getFav)

export default router
