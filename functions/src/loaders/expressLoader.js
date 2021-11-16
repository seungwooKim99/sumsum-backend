import express from 'express'
//import cookieParser from 'cookie-parser'
import cors from 'cors'
//import morgan from 'morgan'
//import api from '../api/routes'
import api from '../routes/index.js'

const expressLoader = (app) => {
  const corsOption = {
    origin: '*',
    methods: 'GET, PUT, PATCH, POST, DELETE',
    exposedHeaders: '*',
  }

  app.use(cors(corsOption))
  //app.use(cookieParser())
  app.use(express.json())
  app.use(express.urlencoded({ extended: true }))
  //app.use(morgan('dev'))
  //app.use(cors())

  app.use('/', api)
  return app;
}

export default expressLoader
