import {db} from '../loaders/dbInit.js'
import constants from '../utils/constants.js'
import resUtil from '../utils/resUtil.js'
import admin from 'firebase-admin'

const { CODE, MSG } = constants

export default {
  getUsers: async (req, res) => {
    const uid = req.decoded.uid
    try{
      const userRecord = await admin.auth().getUser(uid)
      const userRef = db.collection('users').doc(uid)
      const doc = await userRef.get();
  
      if (!doc.exists) {
        console.log('No such user!');
        return resUtil.fail(req,res,CODE.NOT_FOUND, MSG.FAIL_READ_USER)
      } else {
        let data = doc.data();
        data['photoURL'] = userRecord.photoURL
        return resUtil.success(req,res,CODE.OK, MSG.SUCCESS_READ_USER, data)
      }
    }
    catch (error) {
      return resUtil.fail(req,res,CODE.NOT_FOUND, MSG.FAIL_READ_USER, error.message)
    }
  },
  setNicknameAndIsNickNameSettingDoneTrue: (req,res) => {
    const uid = req.decoded.uid
    const userRef = db.collection('users').doc(uid)
    const { nickname } = req.body
    
    userRef.update({nickname, isNicknameSettingDone: true})
      .then((response) => {
        console.log(response)
        return resUtil.success(req,res,CODE.CREATED,MSG.SUCCESS_UPDATE_USER)
      })
      .catch((error) => {
        console.log(error)
        return resUtil.fail(req,res,CODE.NOT_FOUND,MSG.FAIL_UPDATE_USER)
      })
  },
  setIsPostedTrue: (req,res) => {
    const uid = req.decoded.uid
    const userRef = db.collection('users').doc(uid)
    
    userRef.update({isPosted: true})
      .then((response) => {
        console.log(response)
        return resUtil.success(req,res,CODE.CREATED,MSG.SUCCESS_UPDATE_USER)
      })
      .catch((error) => {
        console.log(error)
        return resUtil.fail(req,res,CODE.NOT_FOUND,MSG.FAIL_UPDATE_USER)
      })
  },
  patchLocation: (req,res) => {
    const uid = req.decoded.uid
    const userRef = db.collection('users').doc(uid)
    const { xLocation, yLocation, wishLocation } = req.body
    
    userRef.update({
      xLocation,
      yLocation,
      wishLocation
    })
      .then((response) => {
        console.log(response)
        return resUtil.success(req,res,CODE.CREATED,MSG.SUCCESS_UPDATE_USER)
      })
      .catch((error) => {
        console.log(error)
        return resUtil.fail(req,res,CODE.NOT_FOUND,MSG.FAIL_UPDATE_USER)
      })
  },
}