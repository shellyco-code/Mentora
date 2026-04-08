import express from 'express'
import { getJobRecommendations } from '../controllers/jobController.js'

const router = express.Router()

router.get('/recommendations', getJobRecommendations)

export default router
