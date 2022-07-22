import { client } from '@/config/oss.js'
import Post from 'models/post.js'
import expressValidator from 'express-validator'
const { validationResult } = expressValidator
import { assign } from 'lodash-es'
import User from 'models/user.js'
import OSS from 'ali-oss'
import path from 'path'
import fs from 'fs'
import { last } from 'lodash-es'

export const getPosts = async (
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
  const { page } = req.params

  const posts = await Post.find({})
    .skip((page - 1) * 3)
    .limit(3)

  if (!posts) {
    throw {
      statusCode: 404,
      message: `Fetched posts(page: ${page}) failed.`,
    }
  }
  res.status(200).json({
    message: 'Fetched posts successfully.',
    posts: posts,
  })
  console.log('Fetched posts successfully')
}

export const createPost = async (
  req: {
    body: {
      title: string
      author: string
      isFav: boolean
      creator: string
      time: any
    }
    file: { originalname: string; path: string | number }
  },
  res: {
    status: (arg0: number) => {
      (): any
      new (): any
      json: { (arg0: { message: string; post: any }): void; new (): any }
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

  const { title, author, isFav, creator, time } = req.body
  if (!process.env.Storage_URL) {
    throw `process.env.Storage_URL is ${process.env.Storage_URL || null}`
  }

  let ossImageName = req.file.path.toString().slice(7)
  let imageUrl = `C:\\Users\\72994\\Downloads\\Chrome_download\\js\\book-reading-record-backend\\src\\tmp\\${req.file.path}`

  let client = new OSS({
    // yourRegion填写Bucket所在地域。以华东1（杭州）为例，Region填写为oss-cn-hangzhou。
    region: 'oss-cn-shanghai',
    // 阿里云账号AccessKey拥有所有API的访问权限，风险很高。强烈建议您创建并使用RAM用户进行API访问或日常运维，请登录RAM控制台创建RAM用户。
    accessKeyId: 'LTAI5tGazUPpfGYbyniy5dzq',
    accessKeySecret: 'eLiCtlk39kVOZmWztLIXmeHxOmKI1x',
    // 填写Bucket名称。
    bucket: 'webplus-cn-shanghai-s-62a8832ef968dd14ceb7c781',
  })

  const ossResult = await client.put(ossImageName, path.normalize(imageUrl))

  const post = new Post({
    title: title,
    author: author,
    isFav: isFav,
    time: time,
    imageUrl: ossResult.url,
    creator: creator,
  })
  // assign(post,req.body)

  // console.log(post)
  const result = await post.save()
  if (result) {
    console.log('Post created successfully!')

    fs.unlink(imageUrl, (err) => {
      if (err) {
        throw new Error(err.message)
      }
      // console.log('remove file success')
    })
    res.status(201).json({
      message: 'Post created successfully!',
      post: post,
    })
  }
}

export const getPost = async (
  req: { params: { postId: string } },
  res: {
    status: (arg0: number) => {
      (): any
      new (): any
      json: { (arg0: { message: string; post: {} }): void; new (): any }
    }
  },
  next: (arg0: unknown) => void
) => {
  const postId = req.params.postId

  const post = await Post.findById(postId)
  if (!post) {
    throw {
      message: 'Could not find post.',
      statusCode: 404,
    }
  }

  res.status(200).json({ message: 'Post fetched.', post: post })
  console.log('Post fetched')
}

export const updatePost = async (
  req: {
    params: { postId: string }
    body: {
      title: string
      author: string
      isFav: boolean
      userUid: string
      imageUrl: string
    }
    userId: string
  },
  res: {
    status: (arg0: number) => {
      (): any
      new (): any
      json: { (arg0: { message: string; post: object }): void; new (): any }
    }
  },
  next: (arg0: unknown) => void
) => {
  const postId = req.params.postId
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    throw {
      message: 'Validation failed, entered data is incorrect.',
      statusCode: 422,
    }
  }

  const post = await Post.findById(postId)
  if (!post) {
    throw {
      message: 'Could not find post.',
      statusCode: 404,
    }
  }
  if (post.creator.toString() !== req.userId) {
    throw {
      message: 'Not authorized!',
      statusCode: 403,
    }
  }
  assign(post, req.body)

  const result = await post.save()
  if (result) {
    res.status(200).json({ message: 'Post updated!', post: result })
    console.log('Post updated!')
  }
}

export const deletePost = async (
  req: { params: { postId: string }; userId: string },
  res: {
    status: (arg0: number) => {
      (): any
      new (): any
      json: { (arg0: { message: string }): void; new (): any }
    }
  },
  next: (arg0: unknown) => void
) => {
  const postId = req.params.postId

  const post = await Post.findById(postId)
  if (!post) {
    throw {
      message: 'Could not find post.',
      statusCode: 404,
    }
  }
  if (post.creator.toString() !== req.userId) {
    throw {
      message: 'Not authorized!',
      statusCode: 403,
    }
  }
  const result = await Post.findByIdAndRemove(postId)

  const imageUrl = last(result.imageUrl.split('/'))
  // console.log(imageUrl)
  if (typeof imageUrl === 'string') {
    let ossDeleteResult: any = await client.delete(imageUrl)
    if (ossDeleteResult.res.status !== 204) {
      throw new Error(`delete oss failed, ossDeleteResult: ${ossDeleteResult}`)
    }
  } else {
    throw new Error(`delete image failed, imageUrl:${imageUrl ?? null}`)
  }
  const user = await User.findById(req.userId)
  await user.posts.pull(postId)
  await user.save()

  // console.log(result);

  res.status(200).json({ message: 'Deleted post!' })

  console.log('Deleted post!')
}
