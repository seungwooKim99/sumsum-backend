import {db} from '../loaders/dbInit.js'
import constants from '../utils/constants.js'
import resUtil from '../utils/resUtil.js'

const { CODE, MSG } = constants

export default {
  getUsers: async (req, res) => {
    const snapshot = await db.collection('users').get();
  
    const users = [];
    snapshot.forEach((doc) => {
      const id = doc.id;
      const data = doc.data();
  
      users.push({id, ...data});
    });
  
    res.status(200).send(JSON.stringify(users));
  },
  createUser: async (req, res) => {
    const user = req.body;
  
    await db.collection('users').add(user);
  
    res.status(201).send();
  },
  setNicknameAndIsNickNameSettingDoneTrue: (req,res) => {
    const uid = req.decoded.uid
    const userRef = db.collection('users').doc(uid)
    const { nickname } = req.body
    
    userRef.update({nickname, isNickNameSettingDone: true})
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