import { db } from '../config/firebaseConfig.js'
import aiService from '../services/aiService.js'

export const getProgress = async (req, res) => {
  try {
    const userId = req.user.uid
    const progressDoc = await db.collection('progress').doc(userId).get()

    if (!progressDoc.exists) {
      const initialProgress = {
        userId,
        overallProgress: 0,
        completedTasks: 0,
        totalTasks: 0,
        skillScore: 0,
        streak: 0,
        dailyTasks: [],
        recentActivities: []
      }
      await db.collection('progress').doc(userId).set(initialProgress)
      return res.json(initialProgress)
    }

    // Calculate a "real" streak based on days since account creation
    const userDoc = await db.collection('users').doc(userId).get()
    const userData = userDoc.data()
    let streak = 0
    if (userData && userData.createdAt) {
      const createdDate = new Date(userData.createdAt)
      const diffTime = Math.abs(new Date() - createdDate)
      streak = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    }

    res.json({ ...progressDoc.data(), streak })
  } catch (error) {
    console.error('Get progress error:', error)
    res.status(500).json({ error: 'Failed to get progress' })
  }
}

const MAX_RETRIES = 3

export const generateDailyTasks = async (req, res) => {
  try {
    const userId = req.user.uid

    // Fetch profile
    const userDoc = await db.collection('users').doc(userId).get()
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'Profile not found. Please complete your profile first.' })
    }
    const profile = userDoc.data()

    // Fetch latest quiz result — no orderBy to avoid index requirement
    let quizResults = null
    const quizSnap = await db.collection('quizResults')
      .where('userId', '==', userId)
      .limit(1)
      .get()
    if (!quizSnap.empty) {
      const doc = quizSnap.docs[0].data()
      quizResults = doc.results || doc
    }

    // Fetch roadmap
    let roadmap = null
    const roadmapSnap = await db.collection('roadmaps')
      .where('userId', '==', userId)
      .limit(1)
      .get()
    if (!roadmapSnap.empty) roadmap = roadmapSnap.docs[0].data()

    // Retry Logic: Attempts the request multiple times to handle transient AI failures (Resiliency)
    let lastError = null
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        const result = await aiService.generateDailyTasks(profile, quizResults, roadmap)
        // Debugging: Logging object keys to verify AI response structure
        console.log(`Tasks attempt ${attempt} raw result keys:`, Object.keys(result || {}))
        const tasks = result?.tasks

        if (Array.isArray(tasks) && tasks.length > 0) {
          // Data Normalization: Ensures every task has a consistent structure with default values
          const normalizedTasks = tasks.map((t, i) => ({
            id: t.id || `t${i + 1}`,
            title: t.title || `Task ${i + 1}`,
            description: t.description || '',
            type: t.type || 'Learning',
            duration: t.duration || '30 min',
            priority: t.priority || 'medium',
            completed: t.completed || false
          }))

          // Calculate stats
          const completedCount = normalizedTasks.filter(t => t.completed).length
          const overallProgress = normalizedTasks.length > 0 ? Math.round((completedCount / normalizedTasks.length) * 100) : 0

          // Save to Firestore
          const progressData = {
            userId,
            dailyTasks: normalizedTasks,
            totalTasks: normalizedTasks.length,
            completedTasks: completedCount,
            overallProgress,
            skillScore: quizResults?.score || 0,
            streak: 0,
            generatedAt: new Date().toISOString(),
            recentActivities: []
          }

          await db.collection('progress').doc(userId).set(progressData)
          return res.json(progressData)
        }

        console.warn(`Tasks attempt ${attempt}/${MAX_RETRIES}: AI returned invalid tasks (got ${tasks?.length ?? 'none'})`, JSON.stringify(result)?.slice(0, 300))
        lastError = new Error('AI returned empty or invalid tasks array')
      } catch (err) {
        console.warn(`Tasks attempt ${attempt}/${MAX_RETRIES} failed:`, err?.message)
        lastError = err
      }
    }

    // All retries exhausted
    console.error('Generate daily tasks error: all retries failed')
    res.status(500).json({ error: lastError?.message || 'Failed to generate daily tasks after multiple attempts' })
  } catch (error) {
    console.error('Generate daily tasks error:', error.message || error)
    res.status(500).json({ error: error.message || 'Failed to generate daily tasks' })
  }
}

export const updateTaskProgress = async (req, res) => {
  try {
    const userId = req.user.uid
    const { taskId, completed } = req.body

    const progressDoc = await db.collection('progress').doc(userId).get()
    if (!progressDoc.exists) {
      return res.status(404).json({ error: 'Progress not found' })
    }
    const progressData = progressDoc.data()

    const updatedTasks = progressData.dailyTasks.map(task =>
      task.id === taskId ? { ...task, completed } : task
    )

    const completedCount = updatedTasks.filter(t => t.completed).length
    const overallProgress = updatedTasks.length > 0
      ? Math.round((completedCount / updatedTasks.length) * 100)
      : 0

    await db.collection('progress').doc(userId).update({
      dailyTasks: updatedTasks,
      completedTasks: completedCount,
      overallProgress,
      updatedAt: new Date().toISOString()
    })

    res.json({ message: 'Progress updated successfully' })
  } catch (error) {
    console.error('Update progress error:', error)
    res.status(500).json({ error: 'Failed to update progress' })
  }
}
