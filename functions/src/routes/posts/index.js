import express from 'express'
import postsService from '../../services/postsService.js'

const router = express.Router()

router.get('/', postsService.getPosts);
router.post('/', postsService.createPost);

export default router