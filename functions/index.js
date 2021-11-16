import functions from "firebase-functions";
import express from "express";
import admin from 'firebase-admin';
import loaders from './src/loaders/index.js';

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//

  //admin.initializeApp();
  const app = loaders();


export const api = functions.https.onRequest(app);