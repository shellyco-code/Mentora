import { db } from '../config/firebaseConfig.js'

export const getLearningRecommendations = async (req, res) => {
  try {
    const userId = req.user.uid
    const apiKey = process.env.YOUTUBE_API_KEY || 'YOUTUBE_API_KEY_REMOVED'

    // Fetch user profile for context
    const userDoc = await db.collection('users').doc(userId).get()
    const userData = userDoc.data()
    
    if (!userData) {
      return res.status(400).json({ error: 'User profile not found.' })
    }

    // Determine target skills for recommendations
    let targetSkills = []
    
    // Priority 1: Skill gaps from resume analysis
    if (userData.resumeAnalysis?.skillGaps?.length > 0) {
      targetSkills = userData.resumeAnalysis.skillGaps.slice(0, 3)
    } 
    // Priority 2: Skills listed in profile
    else if (userData.skills) {
      targetSkills = userData.skills.split(',').map(s => s.trim()).slice(0, 3)
    }
    // Priority 3: Target career
    else if (userData.targetCareer) {
      targetSkills = [userData.targetCareer]
    }
    // Final fallback
    else {
      targetSkills = ['Full Stack Development', 'Data Structures', 'System Design']
    }
    
    let allCourses = []

    if (apiKey) {
      try {
        console.log(`Fetching real courses from YouTube for: ${targetSkills.join(', ')}`)
        for (const skill of targetSkills) {
          const response = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=2&q=${encodeURIComponent(skill + ' full course for beginners')}&type=video&key=${apiKey}`)
          const data = await response.json()
          
          if (data.items) {
            const courses = data.items.map(item => ({
              title: item.snippet.title,
              provider: item.snippet.channelTitle,
              thumbnail: item.snippet.thumbnails.medium.url,
              link: `https://www.youtube.com/watch?v=${item.id.videoId}`,
              type: 'Video Course',
              skill: skill
            }))
            allCourses = [...allCourses, ...courses]
          }
        }
      } catch (err) {
        console.error('YouTube API Error:', err.message)
      }
    }

    // Fallback/Default if no API key or no results
    if (allCourses.length === 0) {
      allCourses = targetSkills.map(skill => ({
        title: `${skill} Mastery Guide`,
        provider: 'Community Resources',
        link: `https://www.google.com/search?q=${encodeURIComponent(skill + ' tutorials')}`,
        type: 'Learning Path',
        skill: skill
      }))
    }

    res.json({ courses: allCourses })
  } catch (error) {
    console.error('Get recommendations error:', error)
    res.status(500).json({ error: 'Failed to fetch recommendations' })
  }
}
