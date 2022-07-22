import express from 'express'
const { Router } = express
import {
  getComments,
  createComment,
  getComment,
  updateComment,
  deleteComment,
} from 'controllers/feed/comment.js'
import isAuth from 'middleware/is-auth.js'

const router: any = Router()

router.post(
  '/:postId',
  isAuth,
  // commentValidator,
  createComment
)

router.get('/:postId/comments', isAuth, getComments)

router.get('/:postId/:commentId', isAuth, getComment)

router.put(
  '/:commentId',
  isAuth,
  // commentValidator,
  updateComment
)

router.delete('/:commentId', isAuth, deleteComment)

// app.use('/comment/:commentId/*', replyRoutes)

export default router
