import {db} from '../loaders/dbInit.js'
import getDistance from '../utils/calcDistance.js';
import constants from '../utils/constants.js';
import resUtil from '../utils/resUtil.js';

const { CODE, MSG } = constants

export default {
    getPosts: async (req, res) => {
      const snapshot = await db.collection('posts').get();
      let postsData = [];
      let data = {};
      snapshot.forEach((doc) => {
        const id = doc.id;
        data = doc.data();
        data['id'] = id;
        postsData.push(data);
      });
      return resUtil.success(req,res,CODE.OK,MSG.SUCCESS_READ_POST,postsData)
    },
    getPostsByDistance: async (req, res) => {
      const {xLocation, yLocation} = req.body;
      const snapshot = await db.collection('posts').get();
      let postsData = [];
      let data = {};
      snapshot.forEach((doc) => {
        data = doc.data();
        let distance = getDistance(data.xLocation, data.yLocation, xLocation, yLocation);
        distance = distance * 1000;
        distance = distance.toFixed(0);
        data["distance"] = distance;
        if(distance <= 2000){ //2km 이하만 조회 가능
          postsData.push(data);
        }
      });

      let sortedPosts = [];
      sortedPosts = postsData.sort((a,b) => {
        //const distanceA = getDistance(a.xLocation, a.yLocation, xLocation, yLocation)
        //const distanceB = getDistance(b.xLocation, b.yLocation, xLocation, yLocation)
        return a.distance - b.distance;
      })
      return resUtil.success(req,res,CODE.OK,MSG.SUCCESS_READ_POST,sortedPosts)
    },
    getPostsByCreated: async (req, res) => {
      const {xLocation, yLocation} = req.body;
      const snapshot = await db.collection('posts').get();
      let postsData = [];
      let data = {};
      snapshot.forEach((doc) => {
        data = doc.data();
        let distance = getDistance(data.xLocation, data.yLocation, xLocation, yLocation);
        distance = distance * 1000;
        distance = distance.toFixed(0);
        data["distance"] = distance;
        if(distance <= 2000){ //2km 이하만 조회 가능
          postsData.push(data);
        }
      });

      let sortedPosts = [];
      sortedPosts = postsData.sort((a,b) => {
        let createdAtA = Number(a.createdAt)
        let createdAtB = Number(b.createdAt)
        return createdAtB - createdAtA;
      })
      return resUtil.success(req,res,CODE.OK,MSG.SUCCESS_READ_POST,sortedPosts)
    },
    getPostByUid: async (req,res) => {
      const {post_uid} = req.params
      console.log(req.params)
      const postRef = db.collection('posts').doc(post_uid)
      const postDoc = await postRef.get()

      if (!postDoc.exists) {
        console.log('No such post!');
        return resUtil.fail(req,res,CODE.NOT_FOUND, MSG.FAIL_READ_POST)
      } else {
        let data = postDoc.data();
        data['id'] = post_uid;
        const userDoc = await data.userRef.get()
        if (!userDoc.exists){
          console.log("No such user!")
          return resUtil.fail(req,res,CODE.NOT_FOUND, MSG.FAIL_READ_USER)
        }
        else {
          const userData = userDoc.data()
          console.log(userData)
          data['name'] = userData.name
          data['nickname'] = userData.nickname
          return resUtil.success(req,res,CODE.OK, MSG.SUCCESS_READ_POST, data)
        }
      }
    }
    ,
    createPost: async (req, res) => {
      const uid = req.decoded.uid
      let data = req.body;
      data['userRef'] = db.doc(`users/${uid}`)
      const userRef = db.collection('users').doc(uid)

      await userRef.update({isPosted: true})

      const userDoc = await userRef.get()
      const userData = userDoc.data()
      data['name'] = userData.name
      data['nickname'] = userData.nickname
      const createdAtDate = new Date();
      data['createdAt'] = String(createdAtDate.getTime());
      data['isDealt'] = false;

      db.collection('posts').doc(uid).set(data)
        .then((response) => {
          console.log(response)
          return resUtil.success(req,res,CODE.CREATED,MSG.SUCCESS_CREATE_POST)
        })
        .catch((error) => {
          console.log(error)
          return resUtil.fail(req,res,CODE.BAD_REQUEST,MSG.FAIL_CREATE_POST)
        })
    },
    setIsDealtDone: (req, res) => {
      const uid = req.decoded.uid
      db.collection('posts').doc(uid).update({isDealt: true})
        .then((response) => {
          return resUtil.success(req,res,CODE.OK,MSG.SUCCESS_UPDATE_POST)
        })
        .catch((error) => {
          console.log(error)
          return resUtil.fail(req,res,CODE.BAD_REQUEST,MSG.FAIL_UPDATE_POST, error.message)
        })
    }
}