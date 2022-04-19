const http = require('http')
const mongoose = require('mongoose')
const Post = require('./models/posts')
const errorHelper = require('./errorHelper')
const { headers } = require('./setup')

const dotenv = require('dotenv')
dotenv.config({ path: './config.env' })
const DATABASE = process.env.DATABASE.replace(
  '<password>',
  process.env.DATABASE_PASSWORD
)
const PORT = process.env.PORT

mongoose
  .connect(DATABASE)
  .then(() => {
    console.log('資料庫以連結')
  })
  .catch((error) => {
    console.log(error)
  })

const responseListener = async (req, res) => {
  const { url, method } = req
  let body = ''
  req.on('data', (chunk) => {
    body += chunk
  })
  if (url == '/posts' && method == 'GET') {
    const Posts = await Post.find()
    res.writeHeader(200, headers)
    res.write(
      JSON.stringify({
        status: 'true',
        Posts,
      })
    )
    res.end()
  } else if (url == '/posts' && method == 'POST') {
    req.on('end', async () => {
      try {
        const data = JSON.parse(body)
        const newPost = await Post.create({
          name: data.name,
          content: data.content,
        })
        res.writeHeader(200, headers)
        res.write(
          JSON.stringify({
            status: 'true',
            Post: newPost,
          })
        )
        res.end()
      } catch (error) {
        errorHelper(res, '欄位未填寫正確', error)
      }
    })
  } else if (url == '/posts' && method == 'DELETE') {
    await Post.deleteMany({})
    const posts = await Post.find()
    res.writeHeader(200, headers)
    res.write(
      JSON.stringify({
        status: 'true',
        message: '全部刪除成功',
        posts,
      })
    )
    res.end()
  } else if (url.startsWith('/posts/') && method == 'DELETE') {
    const id = url.split('/').pop()
    try {
      const test = await Post.findByIdAndDelete(id)
      if (test) {
        res.writeHeader(200, headers)
        res.write(
          JSON.stringify({
            status: 'true',
            message: '刪除單筆成功',
          })
        )
        res.end()
      } else {
        errorHelper(res, '查無此IP')
      }
    } catch (error) {
      errorHelper(res, '', error)
    }
  } else if (url.startsWith('/posts/') && method == 'PATCH') {
    const id = url.split('/').pop()
    req.on('end', async () => {
      try {
        const data = JSON.parse(body)
        const post = await Post.findByIdAndUpdate(id, data)
        if (post) {
          res.writeHeader(200, headers)
          res.write(
            JSON.stringify({
              status: 'true',
              message: '編輯單筆成功',
              post,
            })
          )
          res.end()
        } else {
          errorHelper(res, '或查無此ID')
        }
      } catch (error) {
        errorHelper(res, '欄位未填寫正確', error)
      }
    })
  } else if (url.startsWith('/posts/') && method == 'GET') {
    const id = url.split('/').pop()
    try {
      const post = await Post.findOne({ _id: id })
      if (post) {
        res.writeHeader(200, headers)
        res.write(
          JSON.stringify({
            status: 'true',
            post,
          })
        )
        res.end()
      } else {
        errorHelper(res, '查無此ID')
      }
    } catch (error) {
      errorHelper(res, '', error)
    }
  } else if (url == '/posts' && method == 'OPTIONS') {
    res.writeHeader(200, headers)
    res.write(
      JSON.stringify({
        status: 'true',
      })
    )
    res.end()
  } else {
    res.writeHeader(404, headers)
    res.write(
      JSON.stringify({
        status: 'false',
        message: '查無此頁面',
      })
    )
  }
}

const server = http.createServer(responseListener)
server.listen(PORT)
