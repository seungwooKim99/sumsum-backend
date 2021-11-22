import express from 'express'
import usersRouter from './users/index.js'
import postsRouter from './posts/index.js'
import testRouter from './test/index.js'

const router = express.Router()

router.use('/users', usersRouter)
router.use('/posts', postsRouter)

//test api
router.use('/test', testRouter)

export default router