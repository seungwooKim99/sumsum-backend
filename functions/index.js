const functions = require('firebase-functions');
const express = require('express');
const cors = require("cors");
const admin = require('firebase-admin');

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
admin.initializeApp();

const app = express();

app.get('/oauth', (req,res) => {
  console.log("get");
  console.log(req.query['code']);
  res.send("access code 지급 완료");
});

app.get('/', async (req, res) => {
  const snapshot = await admin.firestore().collection('users').get();

  const users = [];
  snapshot.forEach((doc) => {
    const id = doc.id;
    const data = doc.data();

    users.push({id, ...data});
  });

  res.status(200).send(JSON.stringify(users));
});


app.post('/', async (req, res) => {
  const user = req.body;

  await admin.firestore().collection('users').add(user);

  res.status(201).send();
});

exports.users = functions.https.onRequest(app);


exports.helloWorld = functions.https.onRequest((request, response) => {
  functions.logger.info('Hello logs!', {structuredData: true});
  response.send('Hello from Firebase!');
});
