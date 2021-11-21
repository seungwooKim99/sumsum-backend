import express from 'express'
import verifyTokenMiddleware from '../../middlewares/verifytoken.js';
import postsService from '../../services/postsService.js'

const router = express.Router()

router.get('/', postsService.getPosts);
router.get('/:id', postsService.getPostByUid);
router.post('/', verifyTokenMiddleware, postsService.createPost);
//router.post('/filter', postsService.createPost);

export default router