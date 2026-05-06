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
    
    // Check if Adzuna API keys are configured
    const appId = process.env.ADZUNA_APP_ID || '20a31ead'
    const appKey = process.env.ADZUNA_APP_KEY || 'c135b8df0f7843dfe01976e855cf86ef'
    
    let recommendations;

    if (appId && appKey) {
      try {
        console.log('Fetching real jobs from Adzuna...')
        const query = userData.targetCareer
        const country = 'in' // Default to India, can be made dynamic
        
        const adzunaUrl = `https://api.adzuna.com/v1/api/jobs/${country}/search/1?app_id=${appId}&app_key=${appKey}&results_per_page=10&what=${encodeURIComponent(query)}&content-type=application/json`
        
        const response = await fetch(adzunaUrl)
        const data = await response.json()
        
        if (data.results && data.results.length > 0) {
          recommendations = {
            jobs: data.results.map(job => ({
              title: job.title.replace(/<\/?[^>]+(>|$)/g, ""), // Clean HTML tags
              company: job.company.display_name,
              location: job.location.display_name,
              type: job.contract_type || 'Full-time',
              salary: job.salary_min ? `₹${job.salary_min} - ₹${job.salary_max}` : 'Not disclosed',
              description: job.description.replace(/<\/?[^>]+(>|$)/g, "").slice(0, 200) + '...',
              skills: job.category.label.split(' '),
              matchScore: Math.floor(Math.random() * (95 - 75 + 1)) + 75, // Simulated match score
              link: job.redirect_url || `https://www.google.com/search?q=${encodeURIComponent(job.title + ' ' + job.company + ' job')}`
            }))
          }
          console.log(`✅ Found ${recommendations.jobs.length} jobs from Adzuna`)
        } else {
          console.log('⚠️ Adzuna returned 0 results for query:', query)
        }
      } catch (apiErr) {
        console.error('Adzuna API Error, falling back to AI:', apiErr.message)
      }
    }

    // Fallback to AI if real API failed or was not configured
    if (!recommendations) {
      console.log('Using AI Fallback for job recommendations')
      recommendations = await aiService.generateJobRecommendations(userData, skills)
    }

    // Save to Firestore for history
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
