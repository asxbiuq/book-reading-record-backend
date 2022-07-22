import expressValidator from 'express-validator'
const {body} = expressValidator
import User from 'models/user.js'

// POST /feed/post

const postValidator = [
  body('title').trim().isLength({ min: 5 }),
  // body('content')
  //   .trim()
  //   .isLength({ min: 5 })
]

// PUT /feed/post
const putValidator = [
  body('title').trim().isLength({ min: 5 }),
  body('author').trim().isLength({ min: 5 }),
]
//  /auth/signup
const signupValidator = [
  body('email')
    .isEmail()
    .withMessage('Please enter a valid email.')
    .custom((value, { req }) => {
      return User.findOne({ email: value }).then((userDoc: any) => {
        if (userDoc) {
          return Promise.reject('E-Mail address already exists!')
        }
      })
    })
    .normalizeEmail(),
  body('password').trim().isLength({ min: 5 }),
  body('name').trim().not().isEmpty(),
]
//  /auth/status
const statusValidator = [body('status').trim().not().isEmpty()]
export { postValidator, putValidator, signupValidator, statusValidator }
