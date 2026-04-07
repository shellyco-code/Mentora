import { db } from '../config/firebaseConfig.js'
import aiService from '../services/aiService.js'

export const getJobRecommendations = async (req, res) => {
  try {
    const userId = req.user.uid

    const userDoc = await db.collection('users').doc(userId).get()
    
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User profile not found. Please complete your profile first.' })
    }
    
    const userData = userDoc.data()

    if (!userData.targetCareer) {
      return res.status(400).json({ error: 'Please set your target career in profile first.' })
    }

    const skills = userData.skills?.split(',').map(s => s.trim()) || []
    
    const recommendations = await aiService.generateJobRecommendations(userData, skills)

    await db.collection('jobRecommendations').add({
      userId,
      ...recommendations,
      createdAt: new Date().toISOString()
    })

    res.json(recommendations)
  } catch (error) {
    console.error('Get job recommendations error:', error)
    res.status(500).json({ error: 'Failed to get job recommendations' })
  }
}
