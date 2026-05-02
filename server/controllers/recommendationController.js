import { db } from '../config/firebaseConfig.js'

export const getLearningRecommendations = async (req, res) => {
  try {
    const userId = req.user.uid
    const apiKey = process.env.YOUTUBE_API_KEY

    // Fetch user profile for context
    const userDoc = await db.collection('users').doc(userId).get()
    const userData = userDoc.data()
    
    if (!userData || !userData.resumeAnalysis) {
      return res.status(400).json({ error: 'Please upload and analyze your resume first to get targeted recommendations.' })
    }

    const skillGaps = userData.resumeAnalysis.skillGaps || []
    
    if (skillGaps.length === 0) {
      return res.json({ courses: [] })
    }

    // Use only the first 2-3 skill gaps to keep API calls efficient
    const targetSkills = skillGaps.slice(0, 3)
    let allCourses = []

    if (apiKey) {
      try {
        console.log('Fetching real courses from YouTube API...')
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
