import express from 'express'
const { Router } = express
import validator from 'express-validator'
import {
  getReplies,
  createReply,
  getReply,
  updateReply,
  deleteReply,
} from 'controllers/feed/reply.js'
import isAuth from 'middleware/is-auth.js'

const router: any = Router()

router.get('/:commentId/replies', isAuth, getReplies)

router.get('/:commentId/:replyId', isAuth, getReply)

router.post(
  '/:commentId',
  isAuth,
  // commentValidator,
  createReply
)

router.put(
  '/:replyId',
  isAuth,
  // commentValidator,
  updateReply
)

router.delete('/:replyId', isAuth, deleteReply)

export default router
