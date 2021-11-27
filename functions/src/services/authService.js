import { db } from '../loaders/dbInit.js'
import axios from 'axios'
import admin from 'firebase-admin'
import resUtil from '../utils/resUtil.js'
import constants from '../utils/constants.js'
import jwt from 'jsonwebtoken'


const { CODE, MSG } = constants


const updateOrCreateUser = (userId, email, displayName, photoURL) => {
    console.log('updating or creating a firebase user');
    const updateParams = {
      provider: 'KAKAO',
      displayName: displayName,
    };
    if (displayName) {
      updateParams['displayName'] = displayName;
    } else {
      updateParams['displayName'] = email;
    }
    if (photoURL) {
      updateParams['photoURL'] = photoURL;
    }
    return admin.auth().updateUser(userId, updateParams)
    .catch((error) => {
      if (error.code === 'auth/user-not-found') {
        updateParams['uid'] = userId;
        if (email) {
          updateParams['email'] = email;
        }
        return admin.auth().createUser(updateParams);
      }
      throw error;
    });
}

const generateToken = (uid) =>{
  const token = jwt.sign({ uid }, process.env.TOKEN_SECRET, {
    expiresIn: '90d',
    issuer: 'sumsum',
  })
  return token
}



export default {
    createFirebaseToken: (req, res) => {
      const kakaoaccesstoken = req.headers['authorization']
      console.log(kakaoaccesstoken);
      console.log('Requesting user profile from Kakao API server.')
      axios.get('https://kapi.kakao.com/v2/user/me?secure_resource=true',{
        headers: {Authorization: 'Bearer ' + kakaoaccesstoken},
      })
      .then((response) => {
        const body = response.data
        console.log('Got Response from kakao user check API.')
        const userId = `kakao:${body.id}`
        let nickname = null
        let profileImage = null
        if (body.properties) {
          nickname = body.properties.nickname
          profileImage = body.properties.profile_image
        }
        return updateOrCreateUser(userId, body.kakao_account.email, nickname,profileImage)
        .then(async (userRecord) => {
          const userId = userRecord.uid

          const doc = await db.collection('users').doc(userId).get()
          let user = null;

          if (!doc.exists) {
            console.log('No such document! Create New User on firestore (signIn)');
            console.log(`creating a user doc on firestore based on uid ${userId}`)
            user = {
              uid : userRecord.uid,
              name : userRecord.displayName,
              nickname : null,
              email : userRecord.email || null,
              isPhoneAuthDone : false,
              isUnivAuthDone : false,
              isNicknameSettingDone : false,
              isPosted : false,
              wishLocation : null,
              xLocation : null,
              yLocation : null,
              posts: [],
            }
          
            db.collection('users').doc(userId).set(user)
              .then((response)=>{
                console.log(`creating a custom firebase token based on uid ${userId}`)
                user['photoURL'] = userRecord.photoURL
                const token = generateToken(userId)
                return resUtil.success(req,res,CODE.OK,MSG.SUCCESS_CREATE_TOKEN, {
                  token,
                  user
                })
              })
              .catch((error) => {
                console.log(error)
                return resUtil.fail(req,res,CODE.BAD_REQUEST,MSG.FAIL_CREATE_USER,error.message)
              })
          } else {
            console.log('Document already exists (login)')
            const userRef = db.collection('users').doc(userId)
            const doc = await userRef.get();
            user = doc.data();
            user['photoURL'] = userRecord.photoURL
            const token = generateToken(userId)
            return resUtil.success(req,res,CODE.OK,MSG.SUCCESS_CREATE_TOKEN, {
              token,
              user
            })
          }
        })
      })
      .catch((error) => {
        console.log(error.message)
        return resUtil.fail(req,res,CODE.BAD_REQUEST, MSG.FAIL_READ_KAKAO_USER_INFO, error.message)
      })
    },
    setIsPhoneAuthDoneTrue: (req,res) => {
      const uid = req.decoded.uid
      const userRef = db.collection('users').doc(uid)
      
      userRef.update({isPhoneAuthDone: true})
        .then((response) => {
          console.log(response)
          return resUtil.success(req,res,CODE.CREATED,MSG.SUCCESS_UPDATE_USER)
        })
        .catch((error) => {
          console.log(error)
          return resUtil.fail(req,res,CODE.NOT_FOUND,MSG.FAIL_UPDATE_USER)
        })
    },
    setIsUnivAuthDoneTrue: (req,res) => {
      const uid = req.decoded.uid
      const userRef = db.collection('users').doc(uid)
      
      userRef.update({isUnivAuthDone: true})
        .then((response) => {
          console.log(response)
          return resUtil.success(req,res,CODE.CREATED,MSG.SUCCESS_UPDATE_USER)
        })
        .catch((error) => {
          console.log(error)
          return resUtil.fail(req,res,CODE.NOT_FOUND,MSG.FAIL_UPDATE_USER)
        })
    },
    kakaoOauth: (req,res) => {
      console.log(req.query['code']);
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>practice</title>
        </head>
        <body height=100%; style="justify-content:center;align-items:center;display:flex;flex-direction:column;">
            <h1 style="text-align:center;">카카오 계정 로그인 중입니다</h1>
        </body>
        </html>
        `;
      res.send(html);
    },
    verifyToken: (req,res) => {
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
      jwt.verify(token, process.env.TOKEN_SECRET, async (err, decoded) => {
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

        const uid = decoded.uid;

        const userRecord = await admin.auth().getUser(uid)
        const userRef = db.collection('users').doc(uid)
        const doc = await userRef.get();
    
        if (!doc.exists) {
          console.log('No such user!');
          return resUtil.fail(req,res,CODE.NOT_FOUND, MSG.FAIL_READ_USER)
        } else {
          let data = doc.data();
          data['photoURL'] = userRecord.photoURL
          return resUtil.success(req,res,CODE.OK, MSG.SUCCESS_VERIFY_TOKEN, {
            data,
            decoded
          })
        }
      })
    }
}