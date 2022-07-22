import Comment from 'models/comment.js'
import Post from 'models/post.js'
import expressValidator from 'express-validator'
const { validationResult } = expressValidator
import { assign } from 'lodash-es'

export const getComments = async (
  req: { params: { postId: string } },
  res: {
    status: (arg0: number) => {
      (): any
      new (): any
      json: {
        (arg0: { message: string; comments: Array<any> }): void
        new (): any
      }
    }
  },
  next: (arg0: unknown) => void
) => {
  const { postId } = req.params

  const comments = await Comment.find({ postId: postId })

  if (comments) {
    console.log('Fetched comments successfully')

    res.status(200).json({
      message: 'Fetched comments successfully.',
      comments: comments,
    })
  } else {
    throw {
      message: 'Could not find comment.',
      statusCode: 404,
    }
  }
}

export const getComment = async (
  req: { params: { userId: string; commentId: string } },
  res: {
    status: (arg0: number) => {
      (): any
      new (): any
      json: { (arg0: { message: string; posts: string }): void; new (): any }
    }
  },
  next: (arg0: unknown) => void
) => {
  const { commentId } = req.params

  const comment = await Comment.findById(commentId)
  if (comment) {
    console.log('Fetched comment successfully')

    res.status(200).json({
      message: 'Fetched comment successfully',
      posts: comment,
    })
  }
}

export const updateComment = async (
  req: { body: { _id: any } },
  res: {
    status: (arg0: number) => {
      (): any
      new (): any
      json: { (arg0: { message: string; comment: any }): void; new (): any }
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

  const { _id: commentId } = req.body

  const comment = await Comment.findById(commentId)
  if (!comment) {
    throw {
      message: 'Could not find comment.',
      statusCode: 404,
    }
  }
  // if (comment.creator.toString() !== req.userId) {
  //   const error = new Error('Not authorized!')
  //   error.statusCode = 403
  //   throw error
  // }

  assign(comment, req.body)

  const result = await comment.save()
  if (result) {
    console.log('comment updated!')

    res.status(200).json({ message: 'comment updated!', comment: result })
  }
}
export const deleteComment = async (
  req: { params: { commentId: string; postId: string }; userId: string },
  res: {
    status: (arg0: number) => {
      (): any
      new (): any
      json: { (arg0: { message: string }): void; new (): any }
    }
  },
  next: (arg0: unknown) => void
) => {
  const { commentId, postId } = req.params

  const comment = await Comment.findById(commentId)
  if (!comment) {
    throw {
      message: 'Could not find comment.',
      statusCode: 404,
    }
  }
  if (comment.creatorId !== req.userId) {
    throw {
      message: 'Not authorized!',
      statusCode: 403,
    }
  }
  const post = await Post.findById(comment.postId)

  await Comment.findByIdAndRemove(commentId)
  // const post = await Post.findById(postId)

  await post.comments.pull(commentId)
  await post.save()
  console.log('Deleted comment!')

  res.status(200).json({ message: 'Deleted comment!' })
}

export const createComment = async (
  req: {
    body: {
      creator: string
      creatorId: string
      time: any
      content: string
      postId: string
    }
  },
  res: {
    status: (arg0: number) => {
      (): any
      new (): any
      json: { (arg0: { message: string; comment: any }): void; new (): any }
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

  const { creator, creatorId, time, content, postId } = req.body

  // const avatar = process.env.Storage_URL + req.file.path;

  const comment = new Comment({
    creator: creator,
    time: time,
    content: content,
    postId: postId,
    creatorId: creatorId,
    // avatar: avatar,
  })

  const result = await comment.save()
  const post = await Post.findById(postId)
  await post.comments.push(result)
  await post.save()
  if (result) {
    console.log('Comment created successfully!')

    res.status(201).json({
      message: 'Comment created successfully!',
      comment: result,
    })
  }
}
