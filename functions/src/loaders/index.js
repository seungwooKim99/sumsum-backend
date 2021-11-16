import expressLoader from './expressLoader.js'
import express from 'express';
const loaders = () => {
  const app = express();
  return expressLoader(app)
}

export default loaders
