import express from 'express'
import usersRouter from './users/index.js'
import postsRouter from './posts/index.js'

const router = express.Router()

router.use('/users', usersRouter)
router.use('/posts', postsRouter)

export default router