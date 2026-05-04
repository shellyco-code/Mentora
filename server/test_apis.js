import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: '.env' })

const testAdzuna = async () => {
  console.log('--- Testing Adzuna API ---')
  const appId = process.env.ADZUNA_APP_ID
  const appKey = process.env.ADZUNA_APP_KEY
  const country = 'in'
  const query = 'developer'
  
  const url = `https://api.adzuna.com/v1/api/jobs/${country}/search/1?app_id=${appId}&app_key=${appKey}&results_per_page=1&what=${encodeURIComponent(query)}&content-type=application/json`
  
  try {
    const res = await fetch(url)
    console.log('Status:', res.status)
    const data = await res.json()
    if (data.results && data.results.length > 0) {
      console.log('✅ Adzuna working! Found job:', data.results[0].title)
    } else {
      console.log('⚠️ Adzuna returned no results, but API call succeeded.')
    }
  } catch (err) {
    console.error('❌ Adzuna Failed:', err.message)
  }
}

const testYouTube = async () => {
  console.log('\n--- Testing YouTube API ---')
  const apiKey = process.env.YOUTUBE_API_KEY
  const query = 'React full course'
  
  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=1&q=${encodeURIComponent(query)}&type=video&key=${apiKey}`
  
  try {
    const res = await fetch(url)
    console.log('Status:', res.status)
    const data = await res.json()
    if (data.items && data.items.length > 0) {
      console.log('✅ YouTube working! Found video:', data.items[0].snippet.title)
    } else {
      console.log('⚠️ YouTube returned no items, but API call succeeded.')
    }
  } catch (err) {
    console.error('❌ YouTube Failed:', err.message)
  }
}

const runTests = async () => {
  await testAdzuna()
  await testYouTube()
}

runTests()
