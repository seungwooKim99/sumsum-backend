import express from 'express'
import usersService from '../../services/usersService.js'

const router = express.Router()

router.get('/', usersService.getUsers);
router.post('/', usersService.createUser);
router.get('/oauth', usersService.kakaoOauth);

export default router