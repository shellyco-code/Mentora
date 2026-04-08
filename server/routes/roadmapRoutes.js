import express from 'express'
import { generateRoadmap, getRoadmap } from '../controllers/roadmapController.js'

const router = express.Router()

router.post('/generate', generateRoadmap)
router.get('/', getRoadmap)

export default router
