// import { Schema, model } from 'mongoose'
import mongoose from 'mongoose'
const { Schema, model, set, connect } = mongoose

const replySchema = new Schema({
  creator: {
    type: String,
    required: true,
  },
  creatorId: {
    type: String,
    required: true,
  },
  time: {
    type: Date,
    required: true,
  },
  avatar: {
    type: String,
    required: false,
  },
  content: {
    type: String,
    required: true,
  },
  commentId: {
    type: String,
    required: true,
  },
})

export default model('Reply', replySchema)
