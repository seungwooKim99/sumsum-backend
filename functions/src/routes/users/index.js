import express from 'express'
import authRouter from './auth/index.js'
import usersService from '../../services/usersService.js'
import authService from '../../services/authService.js'
import verifyTokenMiddleware from '../../middlewares/verifytoken.js'

const router = express.Router()

router.get('/', verifyTokenMiddleware, usersService.getUser);
router.get('/signin',authService.createFirebaseToken);

router.patch('/nickname',verifyTokenMiddleware, usersService.setNicknameAndIsNickNameSettingDoneTrue)
router.patch('/isposted', verifyTokenMiddleware, usersService.setIsPostedTrue)
router.patch('/location',verifyTokenMiddleware, usersService.patchLocation)
router.patch('/contact',verifyTokenMiddleware, usersService.makeContact)

router.use('/auth', authRouter)

export default router