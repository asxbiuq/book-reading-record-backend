import Post from 'models/post.js'
import expressValidator from 'express-validator'
const { validationResult } = expressValidator
import { assign } from 'lodash-es'
import User from 'models/user.js'

export const getFav = async (
  req: { userId: string; params: { page: number } },
  res: {
    status: (arg0: number) => {
      (): any
      new (): any
      json: {
        (arg0: { message: string; posts: Array<any> }): void
        new (): any
      }
    }
  },
  next: (arg0: unknown) => void
) => {
  const { userId } = req
  const { page } = req.params
  const posts = await Post.find({ creator: userId, isFav: true })
    .skip((page - 1) * 3)
    .limit(3)
  // console.log(posts)
  if (posts) {
    console.log('Fetched fav posts successfully')

    res.status(200).json({
      message: 'Fetched fav posts successfully.',
      posts: posts,
    })
  } else {
    throw {
      message: 'getFav failed',
    }
  }
}
