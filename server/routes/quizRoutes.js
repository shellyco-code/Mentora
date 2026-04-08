import express from 'express'
import { getQuestions, submitQuiz } from '../controllers/quizController.js'

const router = express.Router()

router.get('/questions', getQuestions)
router.post('/submit', submitQuiz)

export default router
