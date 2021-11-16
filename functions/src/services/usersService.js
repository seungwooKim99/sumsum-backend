import {db} from '../loaders/dbInit.js'

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
  kakaoOauth: (req,res) => {
    console.log(req.query['code']);
    res.send("access code 지급 완료");
  }
}