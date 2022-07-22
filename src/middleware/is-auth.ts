// import { verify } from 'jsonwebtoken'
import jsonwebtoken from 'jsonwebtoken'
const { sign, verify } = jsonwebtoken
const isAuth = (
  req: { get: (arg0: string) => any; userId: string },
  res: any,
  next: () => void
) => {
  const authHeader = req.get('Authorization')

  if (!authHeader) {
    throw {
      statusCode: 401,
      message: 'Not authenticated.',
    }
  }

  const token = authHeader.split(' ')[1]

  let decodedToken: any

  if (process.env.KEY) {
    decodedToken = verify(token, process.env.KEY)
  } else {
    throw {
      statusCode: 401,
      message: `process.env.KEY is ${process.env.KEY || null}`,
    }
  }

  if (!decodedToken) {
    throw {
      statusCode: 401,
      message: 'Token error.',
    }
  }
  req.userId = decodedToken.userId
  next()
}

export default isAuth
