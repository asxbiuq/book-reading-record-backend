// import { Schema, model } from 'mongoose'
import mongoose from 'mongoose'
const { Schema, model, set, connect } = mongoose
const commentSchema = new Schema(
  {
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
    postId: {
      type: String,
      required: true,
    },
    replies: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Reply',
      },
    ],
  },
  { timestamps: true }
)

export default model('Comment', commentSchema)
