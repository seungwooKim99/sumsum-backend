import express from 'express'
import verifyTokenMiddleware from '../../middlewares/verifytoken.js';
import postsService from '../../services/postsService.js'

const router = express.Router()

router.get('/', postsService.getPosts);
router.post('/postid', postsService.getPostByUid);
router.post('/', verifyTokenMiddleware, postsService.createPost);
router.patch('/dealt', verifyTokenMiddleware, postsService.setIsDealtDone);
router.post('/distance', postsService.getPostsByDistance);
router.post('/created', postsService.getPostsByCreated);

export default router