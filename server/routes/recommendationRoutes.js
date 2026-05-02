import express from 'express'
import { getLearningRecommendations } from '../controllers/recommendationController.js'
import { verifyToken } from '../middlewares/authMiddleware.js'

const router = express.Router()

router.get('/', verifyToken, getLearningRecommendations)

export default router
