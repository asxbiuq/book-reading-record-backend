import Reply from 'models/reply.js'
import { assign } from 'lodash-es'
import expressValidator from 'express-validator'
const { validationResult } = expressValidator
import Comment from 'models/comment.js'

export const getReplies = async (
  req: { params: { commentId: string } },
  res: {
    status: (arg0: number) => {
      (): any
      new (): any
      json: {
        (arg0: { message: string; replies: Array<any> }): void
        new (): any
      }
    }
  },
  next: (arg0: unknown) => void
) => {
  const { commentId } = req.params

  const replies = await Reply.find({ commentId: commentId })
  if (replies) {
    console.log('Fetched replies successfully')

    res.status(200).json({
      message: 'Fetched replies successfully.',
      replies: replies,
    })
  }
}

export const createReply = async (
  req: { body: { commentId: string } },
  res: {
    status: (arg0: number) => {
      (): any
      new (): any
      json: { (arg0: { message: string; reply: object }): void; new (): any }
    }
  },
  next: (arg0: unknown) => void
) => {
  try {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
      throw {
        message: 'Validation failed, entered data is incorrect.',
        statusCode: 422,
      }
    }

    // const creator = req.body.creator
    // const time = req.body.time
    // const content = req.body.content
    // const commentId = req.body.commentId
    // const replyId = req.body.replyId
    // const avatar = process.env.Storage_URL + req.file.path;
    // {
    //   creator: title,
    //   time: author,
    //   avatar: isFav,
    //   content: userUid,
    //   commentId: imageUrl,
    //   replyId:replyId
    // }
    const reply = new Reply()

    assign(reply, req.body)
    // console.log(post)
    const result = await reply.save()

    const comment = await Comment.findById(req.body.commentId)
    // console.log(result)
    await comment.replies.push(result)
    await comment.save()
    if (result) {
      console.log('reply created successfully!')

      res.status(201).json({
        message: 'reply created successfully!',
        reply: reply,
      })
    }
  } catch (err: any) {
    if (!err.statusCode) {
      err.statusCode = 500
    }
    next(err)
  }
}

export const getReply = async (
  req: { params: { commentId: any } },
  res: {
    status: (arg0: number) => {
      (): any
      new (): any
      json: { (arg0: { message: string; reply: object }): void; new (): any }
    }
  },
  next: (arg0: unknown) => void
) => {
  const commentId = req.params.commentId

  const reply = await Reply.findById(commentId)
  if (!reply) {
    throw {
      message: 'Could not find post.',
      statusCode: 404,
    }
  }
  console.log('reply fetched')

  res.status(200).json({ message: 'reply fetched.', reply: reply })
}

export const updateReply = async (
  req: { params: { commentId: string }; userId: string; body: any },
  res: {
    status: (arg0: number) => {
      (): any
      new (): any
      json: { (arg0: { message: string; reply: object }): void; new (): any }
    }
  },
  next: (arg0: unknown) => void
) => {
  const commentId = req.params.commentId
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    throw {
      message: 'Validation failed, entered data is incorrect.',
      statusCode: 422,
    }
  }

  // const { creator, time, avatar, content, commentId, replyId } = req.body

  const reply = await Reply.findById(commentId)
  if (!reply) {
    throw {
      message: 'Could not find reply.',
      statusCode: 404,
    }
  }
  if (reply.creator.toString() !== req.userId) {
    throw {
      message: 'Not authorized!',
      statusCode: 403,
    }
  }
  // post.title = title
  // post.isFav = isFav
  // post.userUid = userUid
  // post.author = author
  // post.imageUrl = imageUrl
  // const reply = new Reply()

  assign(reply, req.body)

  const result = await reply.save()
  if (result) {
    console.log('reply updated!')

    res.status(200).json({ message: 'reply updated!', reply: result })
  }
}

export const deleteReply = async (
  req: { params: { replyId: string }; userId: string },
  res: {
    status: (arg0: number) => {
      (): any
      new (): any
      json: { (arg0: { message: string }): void; new (): any }
    }
  },
  next: (arg0: unknown) => void
) => {
  const replyId = req.params.replyId

  const reply = await Reply.findById(replyId)
  if (!reply) {
    throw {
      message: 'Could not find reply.',
      statusCode: 404,
    }
  }
  if (reply.creatorId !== req.userId) {
    throw {
      message: 'Not authorized!',
      statusCode: 403,
    }
  }
  await Reply.findByIdAndRemove(reply._id)
  const comment = await Comment.findById(reply.commentId)
  await comment.replies.pull(reply._id)
  await comment.save()
  console.log('Deleted reply!')

  res.status(200).json({ message: 'Deleted reply!' })
}
