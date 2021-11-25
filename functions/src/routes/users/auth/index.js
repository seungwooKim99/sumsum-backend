import express from 'express'
import usersService from '../../../services/usersService.js'
import authService from '../../../services/authService.js'
import verifyTokenMiddleware from '../../../middlewares/verifytoken.js'

const router = express.Router()

router.patch('/phoneauth',verifyTokenMiddleware, authService.setIsPhoneAuthDoneTrue)
router.patch('/univauth',verifyTokenMiddleware, authService.setIsUnivAuthDoneTrue)
router.get('/redirect', authService.kakaoOauth)
router.get('/verifytoken', authService.verifyToken)
//router.get('/refreshtoken', );

export default router