import { db } from '../config/firebaseConfig.js'
import aiService from '../services/aiService.js'

export const generateRoadmap = async (req, res) => {
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

    const quizSnap = await db.collection('quizResults')
      .where('userId', '==', userId)
      .limit(1)
      .get()

    let quizData = null
    if (!quizSnap.empty) {
      const doc = quizSnap.docs[0].data()
      quizData = doc.results || doc
    }

    let roadmap;
    try {
      roadmap = await aiService.generateRoadmap(userData, quizData)
    } catch (aiError) {
      console.warn('Roadmap AI generation failed, using emergency mock fallback:', aiError.message)
      roadmap = {
        title: `Career Roadmap for ${userData.targetCareer || 'Software Developer'}`,
        phases: [
          { month: "Month 1-2", focus: "Core Fundamentals", tasks: ["Master JavaScript ES6+", "Deep dive into React Hooks", "Understand basic CSS Flexbox/Grid"] },
          { month: "Month 3-4", focus: "Backend & APIs", tasks: ["Learn Node.js & Express", "Integrate MongoDB/Firebase", "Master REST API principles"] },
          { month: "Month 5-6", focus: "Deployment & Advanced Topics", tasks: ["Learn Docker basics", "Build a production-ready portfolio", "Practice System Design concepts"] }
        ]
      }
    }

    const roadmapDoc = {
      userId,
      ...roadmap,
      createdAt: new Date().toISOString()
    }

    await db.collection('roadmaps').add(roadmapDoc)

    res.json(roadmap)
  } catch (error) {
    console.error('Generate roadmap error:', error.message || error)
    res.status(500).json({ error: error.message || 'Failed to generate roadmap' })
  }
}

export const getRoadmap = async (req, res) => {
  try {
    const userId = req.user.uid

    const roadmapQuery = await db.collection('roadmaps')
      .where('userId', '==', userId)
      .limit(1)
      .get()

    if (roadmapQuery.empty) {
      return res.status(404).json({ error: 'No roadmap found' })
    }

    const roadmap = roadmapQuery.docs[0].data()
    res.json(roadmap)
  } catch (error) {
    console.error('Get roadmap error:', error)
    res.status(500).json({ error: 'Failed to get roadmap' })
  }
}
