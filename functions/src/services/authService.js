import { db } from '../loaders/dbInit.js'
import axios from 'axios'
import admin from 'firebase-admin'
import resUtil from '../utils/resUtil.js'
import constants from '../utils/constants.js'

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

export default {
    createFirebaseToken: (req, res) => {
      const kakaoaccesstoken = req.headers['authorization']

      console.log('Requesting user profile from Kakao API server.')
      axios.get('https://kapi.kakao.com/v2/user/me?secure_resource=true',{
        headers: {Authorization: 'Bearer ' + kakaoaccesstoken},
      })
      .then((response) => {
        const body = response.data
        //

        console.log('Got Response from kakao user check API.')
        const userId = `kakao:${body.id}`
        //const userId = body.id
        if (!userId) {
          return res.status(404)
          .send({message: 'There was no user with the given access token.'})
        }
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

          if (!doc.exists) {
            console.log('No such document! Create New User on firestore (signIn)');
            console.log(`creating a user doc on firestore based on uid ${userId}`)
            const user = {
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
            }
          
            db.collection('users').doc(userId).set(user)
              .then((response)=>{
                console.log(`creating a custom firebase token based on uid ${userId}`)
                admin.auth().createCustomToken(userId)
                  .then((customToken) => {
                    console.log(customToken)
                    res.status(200).send(customToken);
                  })
                  .catch((error) => {
                    console.log(error)
                  })
              })
              .catch((error) => {
                console.log(error)
              })
          } else {
            console.log('Document already exists (login)')
            admin.auth().createCustomToken(userId)
                  .then((customToken) => {
                    console.log(customToken)
                    res.status(200).send(customToken);
                  })
                  .catch((error) => {
                    console.log(error)
                  })
          }
        })
      })
      .catch((error) => {
        console.log(error.message)
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
      res.send("카카오 로그인에 성공했습니다!");
    },
}