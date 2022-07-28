import express from 'express'
const { Router } = express
import {
  getPosts,
  createPost,
  getPost,
  updatePost,
  deletePost,
  getMyPosts
} from 'controllers/feed/post.js'
import isAuth from 'middleware/is-auth.js'
import { postValidator, putValidator } from 'controllers/validatorRules.js'

const router: any = Router()

router.get('/posts/:page', isAuth, getPosts)

router.get('/myposts/:page', isAuth, getMyPosts)
// router.get('/posts', isAuth, getPosts)
router.get('/:postId', isAuth, getPost)

router.post('/', isAuth, postValidator, createPost)

router.put('/:postId', isAuth, putValidator, updatePost)

router.delete('/:postId', isAuth, deletePost)

export default router
