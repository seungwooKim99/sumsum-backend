import {db} from '../loaders/dbInit.js'

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
    createPost: async (req, res) => {
    const post = req.body;
  
    await db.collection('posts').add(post);
  
    res.status(201).send();
  }
}