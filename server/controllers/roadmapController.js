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
        description: "A comprehensive 6-month plan to master the skills required for your target role.",
        phases: [
          { 
            title: "Phase 1: Core Fundamentals", 
            duration: "Month 1-2", 
            tasks: [
              { title: "Master JavaScript ES6+", description: "Deep dive into closures, promises, and async/await." },
              { title: "React Hooks & State", description: "Master useState, useEffect, and custom hooks." },
              { title: "CSS Mastery", description: "Learn Flexbox, Grid, and responsive design patterns." }
            ] 
          },
          { 
            title: "Phase 2: Backend & APIs", 
            duration: "Month 3-4", 
            tasks: [
              { title: "Node.js & Express", description: "Build scalable server-side applications." },
              { title: "Database Integration", description: "Connect and query MongoDB or Firebase Firestore." },
              { title: "RESTful API Design", description: "Implement secure and efficient API endpoints." }
            ] 
          },
          { 
            title: "Phase 3: Deployment & Scale", 
            duration: "Month 5-6", 
            tasks: [
              { title: "Docker & Containerization", description: "Learn to containerize and deploy applications." },
              { title: "System Design", description: "Understand load balancing, caching, and scalability." },
              { title: "Portfolio Project", description: "Build and deploy a complex full-stack application." }
            ] 
          }
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
