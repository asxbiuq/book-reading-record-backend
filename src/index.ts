import express from 'express'
import bodyParser from 'body-parser'
import mongoose from 'mongoose'
const { set, connect } = mongoose
import multer from 'multer'
const { diskStorage } = multer
import authRoutes from 'routes/auth.js'
import postRoutes from 'routes/feed/post.js'
import favRoutes from 'routes/feed/fav.js'
import commentRoutes from 'routes/feed/comment.js'
import replyRoutes from 'routes/feed/reply.js'
import setHeader from 'middleware/setHeader.js'
import { errorHandler } from 'middleware/handleError.js'
import '@/config/env.js'
import path from 'path'
import { fileURLToPath } from 'url'





const app = express()
const rootUrl = fileURLToPath(new URL('../',import.meta.url).href)

const fileStorage = diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'tmp/')
  },
  filename: (req, file, cb) => {
    // Windows 操作系统不接受带有 “:” 所以要做处理
    cb(
      null,
      new Date().toISOString().replace(/:/g, '-') + '-' + file.originalname
    )
  },
})

const fileFilter = (
  req: any,
  file: { mimetype: string },
  cb: (arg0: null, arg1: boolean) => void
) => {
  if (
    file.mimetype === 'image/png' ||
    file.mimetype === 'image/jpg' ||
    file.mimetype === 'image/jpeg'
  ) {
    cb(null, true)
  } else {
    cb(null, false)
  }
}

app.use(bodyParser.urlencoded({ extended: false })) // x-www-form-urlencoded <form>
app.use(bodyParser.json()) // application/json
app.use(
  multer({
    // dest: 'upload/'
    storage: fileStorage,
    fileFilter: fileFilter,
  }).single('image')
)

app.use(setHeader)



app.get("/", (req, res,next) => {
  res.sendFile(`${rootUrl}/public/index.html`)
});
app.use('/', express.static('public'))
app.use('/auth', authRoutes)
app.use('/reply', replyRoutes)
app.use('/comment', commentRoutes)
app.use('/post', postRoutes)
app.use('/fav', favRoutes)

app.use(errorHandler)

try {
  if (process.env.DATABASE_URL) {
    set('useFindAndModify', false)
    connect(process.env.DATABASE_URL, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
    })
  } else {
    throw {
      message: `process.env.DATABASE_URL is ${
        process.env.DATABASE_URL || null
      }`,
    }
  }
  console.log('mongodb connected!')
  app.listen(process.env.PORT)
  console.log('express listening: ',process.env.PORT)
} catch (err: any) {
  console.log(err.message)
}
