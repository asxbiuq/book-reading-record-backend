// import { Schema, model } from 'mongoose'
import mongoose from 'mongoose'
const { Schema, model, set, connect } = mongoose

const postSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    imageUrl: {
      type: String,
      required: false,
    },
    content: {
      type: String,
      required: true,
    },
    creator: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    author: {
      type: String,
      required: true,
    },
    isFav: {
      type: Boolean,
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
    comments: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Comment',
      },
    ],
  },
  { timestamps: true }
)

export default model('Post', postSchema)
