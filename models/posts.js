const mongoose = require('mongoose')
const postSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, '名子必填'] },
    content: { type: String, required: [true, '內容必填'] },
    createdAt: {
      type: Date,
      default: Date.now,
      select: false,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
)

const Post = new mongoose.model('Post', postSchema)
module.exports = Post
