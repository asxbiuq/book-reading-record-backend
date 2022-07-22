// import { Schema, model } from 'mongoose'
import mongoose from 'mongoose'
const { Schema, model, set, connect } = mongoose

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    default: 'I am new!',
  },
  posts: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Post',
    },
  ],
})

export default model('User', userSchema)
