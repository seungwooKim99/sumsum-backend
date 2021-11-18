import { db } from '../loaders/dbInit.js'
import axios from 'axios'
import admin from 'firebase-admin'

const requestMe = (kakaoAccessToken) => {
    console.log('Requesting user profile from Kakao API server.')
    axios.get('https://kapi.kakao.com/v2/user/me?secure_resource=true',{
      headers: {Authorization: 'Bearer ' + kakaoAccessToken},
    })
    .then((response) => {
      console.log(response.data)
      const res = response.data
      return res
    })
    .catch((error) => {
      console.log(error.message)
    })
}

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
    console.log(updateParams);
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
      console.log("token : " + kakaoaccesstoken)

      console.log('Requesting user profile from Kakao API server.')
      axios.get('https://kapi.kakao.com/v2/user/me?secure_resource=true',{
        headers: {Authorization: 'Bearer ' + kakaoaccesstoken},
      })
      .then((response) => {
        const body = response.data
        //

        console.log('Got Response from kakao user check API. and the response is…')
        console.log(body)
        const userId = `kakao:${body.id}`
        if (!userId) {
          return res.status(404)
          .send({message: 'There was no user with the given access token.'})
        }
        //let nickname = null
        let nickname = 'seungwookim'
        let profileImage = null
        if (body.properties) {
          nickname = body.properties.nickname
          profileImage = body.properties.profile_image
        }
        return updateOrCreateUser(userId, body.kaccount_email, nickname,profileImage)
        .then((userRecord) => {
          const userId = userRecord.uid
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


        //
      })
      .catch((error) => {
        console.log(error.message)
      })
    }
}