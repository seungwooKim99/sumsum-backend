import functions from "firebase-functions";
import loaders from './src/loaders/index.js';
import dotenv from 'dotenv'

dotenv.config()
const app = loaders();

export const api = functions.https.onRequest(app);