import express from 'express'

const router = express.Router()

router.post('/register', async (req, res) => {
  res.json({ message: 'Registration handled by Firebase client SDK' })
})

router.post('/login', async (req, res) => {
  res.json({ message: 'Login handled by Firebase client SDK' })
})

export default router
