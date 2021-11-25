import express from 'express'
import jwt from 'jsonwebtoken'
import constants from '../../utils/constants.js';
import resUtil from '../../utils/resUtil.js';
import {db} from '../../loaders/dbInit.js';

const { CODE, MSG } = constants

const router = express.Router()

const generateToken = (req,res) =>{

  const {uid} = req.body
  const token = jwt.sign({ uid }, process.env.TOKEN_SECRET, {
    expiresIn: '90d',
    issuer: 'sumsum',
  })
  res.status(200).send(token)
}

router.get('/verifytoken', (req,res) => {
    // 클라이언트는 header 내부에 'Authorization' : 'Bearer <token...>' 형태로 토큰을 전달한다. ('key': 'value' 쌍)
    const authHeader = req.headers.authorization

    // authHeader는 'Bearer <token...>'이다.
    if (!authHeader) {
      console.log('not logged in!!')
      return res.status(403).json({
        success: false,
        statusCode: 403,
        message: 'not logged in',
      })
    }

    // 'Bearer', '<token...>'중 '<token...>'만 받아서 저장한다.
    const token = authHeader.split(' ')[1]
    jwt.verify(token, process.env.TOKEN_SECRET, (err, decoded) => {
      if (err) {
        console.log('Wrong token!')
        return res.status(403).json({
          success: false,
          statusCode: 403,
          message: err.message,
        })
      }
      // req.decoded에 토큰을 decode한 내용을 저장해 넘겨준다.
      // req.decoded 내부에는 trainerid, _id, expiresIn 등 토큰에 대한 정보다 담겨있다.
      res.status(200).send(decoded)
    })
});

router.post('/gentoken', generateToken)

router.post('/dummyusers', (req,res) => {
  const data = req.body;
  let xRandom = Math.random();
  xRandom = xRandom.toFixed(1);
  let yRandom = Math.random();
  yRandom = yRandom.toFixed(1);

  console.log(data);
  const baseX = 126.922683; //경도
  const baseY = 37.544133;  //위도
  const errorX = 0.037525;
  const errorY = 0.025673;
  let uid = `kakao:${data.uid}`;
  let user = {
    uid,
    name : data.name,
    nickname : data.nickname,
    email : data.email,
    isPhoneAuthDone : true,
    isUnivAuthDone : true,
    isNicknameSettingDone : true,
    isPosted : true,
    wishLocation : data.wishLocation,
    xLocation : baseX + xRandom*errorX,
    yLocation : baseY + yRandom*errorY,
  }

  db.collection('users').doc(uid).set(user)
    .then((response)=>{
      return resUtil.success(req,res,CODE.OK,MSG.SUCCESS_CREATE_USER, {
        user
      })
    })
    .catch((error) => {
      return resUtil.fail(req,res,CODE.BAD_REQUEST,MSG.FAIL_CREATE_USER,error.message)
    })
})


router.post('/dummyposts', async (req, res) => {
  const uidNum = req.body.uid
  let r = req.body;
  const uid = `kakao:${uidNum}`;

  let data = {
    title: r.title,
    description: r.description,
    rentalFeeMonth: 40,
    rentalFeeWeek: 10,
    buildingType: "주택",
    floors: "지상층",
    roomType: "오픈형",
    residentStartDate: "1638284400000",
    residentFinishDate: "1642172400000",
    gender: 0,
    smoking: 1,
    pictures: ["url1", "url2", "url3"],
    features: [0,1,2,3,4],
    options: [1,2,3,4,7],
  }

  data['userRef'] = db.doc(`users/${uid}`)
  const userRef = db.collection('users').doc(uid)
  const userDoc = await userRef.get()
  const userData = userDoc.data()
  console.log(userData);
  data['name'] = userData.name
  data['nickname'] = userData.nickname
  const createdAtDate = new Date(2021,10,22);
  data['createdAt'] = String(createdAtDate.getTime());
  data['xLocation'] = userData.xLocation
  data['yLocation'] = userData.yLocation
  data['location'] = userData.wishLocation

  db.collection('posts').doc(uid).set(data)
    .then((response) => {
      console.log(response)
      return resUtil.success(req,res,CODE.CREATED,MSG.SUCCESS_CREATE_POST)
    })
    .catch((error) => {
      console.log(error)
      return resUtil.fail(req,res,CODE.BAD_REQUEST,MSG.FAIL_CREATE_POST)
    })
})

export default router