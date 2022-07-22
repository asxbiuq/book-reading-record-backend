import expressValidator from 'express-validator'
const {validationResult} = expressValidator
import bcryptjs from 'bcryptjs'
const { hash, compare } = bcryptjs
// import { sign } from 'jsonwebtoken'
import jsonwebtoken from 'jsonwebtoken'
const { sign, verify } = jsonwebtoken
import User from 'models/user.js'
import '@/config/env.js'

const signup = async (
  req: { body: { email: string; name: string; password: string } },
  res: any,
  next: any
) => {
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    throw {
      statusCode: 422,
      message: 'Validation failed.',
    }
  }
  const { email, name, password } = req.body
  const hashedPw = await hash(password, 12)
  const user = new User({
    email: email,
    password: hashedPw,
    name: name,
  })
  const result = await user.save()
  if (!process.env.KEY) {
    throw {
      statusCode: 401,
      message: `process.env.KEY is ${process.env.KEY || null}`,
    }
  }
  const token = sign(
    {
      email: email,
      userId: result._id,
    },
    process.env.KEY,
    { expiresIn: '24h' }
  )
  res
    .status(201)
    .json({ message: 'User created!', userId: result._id, token: token })
  console.log('User created!')
}

const login = async (
  req: { body: { email: string; password: string } },
  res: any,
  next: any
) => {
  const { email, password } = req.body
  let loadedUser

  const user = await User.findOne({ email: email })
  if (!user) {
    throw {
      statusCode: 401,
      message: `A user with this email could not be found.${email}`,
    }
  }
  loadedUser = user
  const isEqual = await compare(password, user.password)
  if (!isEqual) {
    throw {
      statusCode: 401,
      message: 'Wrong password!',
    }
  }
  if (!process.env.KEY) {
    throw {
      statusCode: 401,
      message: `process.env.KEY is ${process.env.KEY || null}`,
    }
  }
  const token = sign(
    {
      email: loadedUser.email,
      userId: loadedUser._id.toString(),
    },
    process.env.KEY,
    { expiresIn: '24h' }
  )
  const remainingMilliseconds = 24 * 60 * 60 * 1000
  const expiryDate = new Date(new Date().getTime() + remainingMilliseconds)

  res.status(200).json({
    token: token,
    userId: loadedUser._id.toString(),
    name: user._doc.name,
    expiryDate: expiryDate,
  })
  console.log('User login!')
}

export { signup, login }
