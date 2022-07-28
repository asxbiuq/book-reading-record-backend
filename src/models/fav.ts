// import { Schema, model } from 'mongoose'
import mongoose from 'mongoose'
const { Schema, model, set, connect } = mongoose

const favSchema = new Schema(
  {
    postId:{
      type: String,
      required: true,
    },
    creator: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
)

export default model('Fav', favSchema)
