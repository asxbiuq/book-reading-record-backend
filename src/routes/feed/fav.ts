import express from 'express'
const { Router } = express
import { getFav,deleteFav,addFav } from 'controllers/feed/fav.js'
import isAuth from 'middleware/is-auth.js'

const router: any = Router()

router.get('/:page', isAuth, getFav)
router.post('/:postId', isAuth, addFav)
router.delete('/:postId', isAuth, deleteFav)

export default router
