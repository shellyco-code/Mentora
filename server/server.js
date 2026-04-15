import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import authRoutes from './routes/authRoutes.js'
import profileRoutes from './routes/profileRoutes.js'
import resumeRoutes from './routes/resumeRoutes.js'
import quizRoutes from './routes/quizRoutes.js'
import roadmapRoutes from './routes/roadmapRoutes.js'
import progressRoutes from './routes/progressRoutes.js'
import jobRoutes from './routes/jobRoutes.js'
import { verifyToken } from './middlewares/authMiddleware.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  credentials: true
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Mentora API is running' })
})

app.use('/api/auth', authRoutes)
app.use('/api/profile', verifyToken, profileRoutes)
app.use('/api/resume', verifyToken, resumeRoutes)
app.use('/api/quiz', verifyToken, quizRoutes)
app.use('/api/roadmap', verifyToken, roadmapRoutes)
app.use('/api/progress', verifyToken, progressRoutes)
app.use('/api/jobs', verifyToken, jobRoutes)

app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ error: 'Something went wrong!' })
})

app.listen(PORT, () => {
  console.log(`🚀 Mentora server running on port ${PORT}`)
})
