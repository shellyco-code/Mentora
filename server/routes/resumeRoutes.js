import express from 'express'
import multer from 'multer'
import { uploadResume, analyzeResume, getAnalysis } from '../controllers/resumeController.js'

const router = express.Router()
const upload = multer({ storage: multer.memoryStorage() })

router.post('/upload', upload.single('resume'), uploadResume)
router.post('/analyze', analyzeResume)
router.get('/analysis', getAnalysis)

export default router
