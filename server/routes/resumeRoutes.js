import express from 'express'
import multer from 'multer'
import { uploadResume, analyzeResume, getAnalysis } from '../controllers/resumeController.js'

const router = express.Router()

// Multer Setup: Using Memory Storage to keep file data in RAM as a Buffer
// This is ideal for cloud deployments (Render/Vercel) where local disk storage is temporary
const upload = multer({ storage: multer.memoryStorage() })

// POST /upload: Middleware 'upload.single' captures the file named 'resume' from the request
router.post('/upload', upload.single('resume'), uploadResume)
router.post('/analyze', analyzeResume)
router.get('/analysis', getAnalysis)

export default router
