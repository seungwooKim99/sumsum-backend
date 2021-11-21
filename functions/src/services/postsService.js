import {db} from '../loaders/dbInit.js'
import constants from '../utils/constants.js';
import resUtil from '../utils/resUtil.js';

const { CODE, MSG } = constants

export default {
    getPosts: async (req, res) => {
      const snapshot = await db.collection('posts').get();
    
      const posts = [];
      snapshot.forEach((doc) => {
        const id = doc.id;
        const data = doc.data();
        posts.push({id, ...data});
      });
    
      res.status(200).send(JSON.stringify(posts));
    },
  getPostByUid: async (req,res) => {
    const post_uid = req.params.id
    console.log(req.params)
    const postRef = db.collection('posts').doc(post_uid)
    const postDoc = await postRef.get()

    if (!postDoc.exists) {
      console.log('No such post!');
      return resUtil.fail(req,res,CODE.NOT_FOUND, MSG.FAIL_READ_POST)
    } else {
      let data = postDoc.data();
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

      db.collection('posts').doc(uid).set(data)
        .then((response) => {
          console.log(response)
          return resUtil.success(req,res,CODE.CREATED,MSG.SUCCESS_CREATE_POST)
        })
        .catch((error) => {
          console.log(error)
          return resUtil.fail(req,res,CODE.BAD_REQUEST,MSG.FAIL_CREATE_POST)
        })

      //await db.collection('posts').add(post);
    }
}