


interface Reply {
  _id: string
  creator: string
  creatorId: string
  content: string
  time: Date
  commentId: string
}
interface Comment {
  _id: string
  creatorId: string
  creator: string
  content: string
  time: Date
  postId: string
  replies: Reply[]
}

interface Post {
  title: string
  imageUrl: string
  content: string
  creator: string
  author: string
  isFav: boolean
  time: string
  avatar: string
  comments: Comment[]
  _id: string
}
type UserId = string
type Name = string
interface User {
  posts: Post[]
  comments: Comment[]
  userId: UserId
  name: Name
}

interface Fav {
  _id: string
  creator: string
  postId: string
}
