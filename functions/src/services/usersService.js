import {db} from '../loaders/dbInit.js'
import constants from '../utils/constants.js'
import resUtil from '../utils/resUtil.js'
import admin from 'firebase-admin'

const { CODE, MSG } = constants

export default {
  getUser: async (req, res) => {
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

        // 컨택한 게시글 정보도 추가하기
        let posts = [];
        if(data.posts.length != 0){
          let postArr = data.posts;

          for (let postId of postArr) {
            let postData = {};
            let postRef = db.collection('posts').doc(postId)
            let doc = await postRef.get();
            let post = doc.data();
            postData["id"] = postId;
            postData["title"] = post.title;
            postData["name"] = post.name;
            postData["nickname"] = post.nickname;
            posts.push(postData);
          }
          data['posts'] = posts;
          return resUtil.success(req,res,CODE.OK, MSG.SUCCESS_READ_USER, data)
        }
        else{
          return resUtil.success(req,res,CODE.OK, MSG.SUCCESS_READ_USER, data)
        }
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
  makeContact: async (req,res) => {
    const uid = req.decoded.uid
    const userRef = db.collection('users').doc(uid)
    const { post } = req.body

    const doc = await userRef.get();
    let data = doc.data();

    let posts = data.posts || [];
    let pushFlag = true;
    posts.forEach((data) => {
      if(data == post){
        pushFlag = false;
      }
    })
    if (pushFlag){
      posts.push(post);
    }
    
    userRef.update({
      posts,
    })
      .then((response) => {
        console.log(response)
        return resUtil.success(req,res,CODE.CREATED,MSG.SUCCESS_UPDATE_USER)
      })
      .catch((error) => {
        console.log(error)
        return resUtil.fail(req,res,CODE.NOT_FOUND,MSG.FAIL_UPDATE_USER)
      })
  }
}