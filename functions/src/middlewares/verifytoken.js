import jwt from 'jsonwebtoken'

const verifyTokenMiddleware = (req, res, next) => {
  // 클라이언트는 header 내부에 'Authorization' : 'Bearer <token...>' 형태로 토큰을 전달한다. ('key': 'value' 쌍)
  const authHeader = req.headers.authorization

  // authHeader는 'Bearer <token...>'이다.
  if (!authHeader) {
    console.log('not logged in!!')
    return res.status(403).json({
      success: false,
      statusCode: 403,
      message: 'not logged in',
    })
  }

  // 'Bearer', '<token...>'중 '<token...>'만 받아서 저장한다.
  const token = authHeader.split(' ')[1]
  jwt.verify(token, process.env.TOKEN_SECRET, (err, decoded) => {
    if (err) {
      console.log('Wrong token!')
      return res.status(403).json({
        success: false,
        statusCode: 403,
        message: err.message,
      })
    }
    // req.decoded에 토큰을 decode한 내용을 저장해 넘겨준다.
    // req.decoded 내부에는 trainerid, _id, expiresIn 등 토큰에 대한 정보다 담겨있다.
    req.decoded = decoded

    next()
  })
}

export default verifyTokenMiddleware
