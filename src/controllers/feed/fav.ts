import Post from 'models/post.js'
import expressValidator from 'express-validator'
const { validationResult } = expressValidator
import { assign } from 'lodash-es'
import User from 'models/user.js'
import Fav from 'models/fav.js'

export const getFav = async (
  req: { userId: string; params: { page: number } },
  res: {
    status: (arg0: number) => {
      (): any
      new(): any
      json: {
        (arg0: { message: string; favs: Array<any> }): void
        new(): any
      }
    }
  },
  next: (arg0: unknown) => void
) => {
  const { userId } = req
  const { page } = req.params
  const favs: Fav[] = await Fav.find({ creator: userId })
    .skip((page - 1) * 3)
    .limit(3)
    // console.log('favs: ',favs)

  let posts: Post[] = []
  await Promise.all(
    favs.map(async (fav: Fav) => {
      const post = await Post.findOne({ _id: fav.postId })
      console.log('post: ',post)
      post.isFav = true
      posts.push(post)
    })
  )

  // const posts = await Post.find({ postId: favs })
  // .skip((page - 1) * 3)
  // .limit(3)
  // console.log(posts)
  if (posts) {
    console.log('Fetched fav posts successfully')
    console.log('posts: ',posts)
    res.status(200).json({
      message: 'Fetched fav favs successfully.',
      favs: posts,
    })
  } else {
    throw {
      message: 'getFav failed',
    }
  }
}

export const deleteFav = async (
  req: { params: { postId: string }; userId: string },
  res: {
    status: (arg0: number) => {
      (): any
      new(): any
      json: { (arg0: { message: string }): void; new(): any }
    }
  },
  next: (arg0: unknown) => void
) => {
  const postId = req.params.postId
  const { userId } = req

  const fav: Fav = await Fav.findOne({ creator: userId, postId: postId })
  if (!fav) {
    throw {
      message: 'Could not find fav.',
      statusCode: 404,
    }
  }
  if (fav.creator !== req.userId) {
    console.log('creator: ', fav, 'userId: ', req.userId)
    throw {
      message: 'Not authorized!',
      statusCode: 403,
    }
  }
  const result = await Fav.deleteOne({ postId: postId })
  if (result) {
    console.log('delete fav successfully!')

    res.status(200).json({
      message: 'delete fav successfully!'
    })
  }
}

export const addFav = async (
  req: { params: { postId: string }; userId: string },
  res: {
    status: (arg0: number) => {
      (): any
      new(): any
      json: { (arg0: { message: string; fav: any }): void; new(): any }
    }
  },
  next: (arg0: unknown) => void
) => {
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    throw {
      message: 'Validation failed, entered data is incorrect.',
      statusCode: 422,
    }
  }

  const { postId } = req.params
  const { userId } = req
  const favs: Fav[] = await Fav.find({ creator: userId, postId: postId })
  if (favs.length !== 0) {
    console.log(favs)
    throw {
      message: '已经在收藏夹中'
    }
  }


  const fav = new Fav({
    creator: userId,
    postId: postId,
  })

  const result = await fav.save()
  // console.log(result)
  if (result) {
    console.log('add fav successfully!')

    res.status(201).json({
      message: 'add fav successfully!',
      fav: fav,
    })
  } else {
    throw {
      message: 'add fav failed!',
      statusCode: 400,
    }
  }
}