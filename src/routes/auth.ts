import express from 'express'
const { Router } = express
import { signup, login } from 'controllers/auth.js'
import { signupValidator } from 'controllers/validatorRules.js'

const router: any = Router()


router.put('/signup', signupValidator, signup)

router.post('/login', login)

export default router
