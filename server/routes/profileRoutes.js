import express from 'express'
import { createProfile, getProfile, updateProfile } from '../controllers/profileController.js'

const router = express.Router()

router.post('/', createProfile)
router.get('/', getProfile)
router.put('/', updateProfile)

export default router
