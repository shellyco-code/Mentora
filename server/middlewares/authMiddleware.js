import { auth } from '../config/firebaseConfig.js'

export const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split('Bearer ')[1]
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' })
    }

    // Token Verification: Decoding the Firebase JWT (JSON Web Token) to identify the user
    const decodedToken = await auth.verifyIdToken(token)
    // Request Attachment: Injecting the verified user object into the request for controllers to use
    req.user = decodedToken
    next()
  } catch (error) {
    console.error('Token verification error:', error)
    res.status(401).json({ error: 'Invalid token' })
  }
}
