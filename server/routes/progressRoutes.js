import express from 'express'
import { getProgress, generateDailyTasks, updateTaskProgress } from '../controllers/progressController.js'

const router = express.Router()

router.get('/', getProgress)
router.post('/generate', generateDailyTasks)
router.put('/task', updateTaskProgress)

export default router
