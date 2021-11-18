import express from 'express'
import usersService from '../../services/usersService.js'
import authService from '../../services/authService.js'

const router = express.Router()

router.get('/', usersService.getUsers);
router.post('/', usersService.createUser);
router.get('/oauth', usersService.kakaoOauth);
router.get('/login',authService.createFirebaseToken);

export default router