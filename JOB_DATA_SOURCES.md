# Free Job Data Sources for Real-Time Job Listings

## 🟢 RECOMMENDED FREE OPTIONS

### 1. **Adzuna API** ⭐ BEST OPTION
- **Website**: https://developer.adzuna.com/
- **Cost**: FREE (up to 1000 calls/month)
- **Coverage**: Global job listings (India, US, UK, etc.)
- **Features**:
  - Real-time job search
  - Salary data
  - Location-based search
  - Category filtering
  - No credit card required
- **How to use**:
  ```javascript
  // Example API call
  const APP_ID = 'your_app_id'
  const APP_KEY = 'your_app_key'
  const url = `https://api.adzuna.com/v1/api/jobs/in/search/1?app_id=${APP_ID}&app_key=${APP_KEY}&results_per_page=20&what=javascript%20developer&where=bangalore`
  ```

### 2. **JSearch API (RapidAPI)** ⭐ GOOD OPTION
- **Website**: https://rapidapi.com/letscrape-6bRBa3QguO5/api/jsearch
- **Cost**: FREE tier (250 requests/month)
- **Coverage**: Google Jobs aggregator (worldwide)
- **Features**:
  - Job search
  - Job details
  - Salary estimates
  - Company info
- **How to use**: Sign up on RapidAPI, subscribe to free tier

### 3. **The Muse API**
- **Website**: https://www.themuse.com/developers/api/v2
- **Cost**: FREE (no rate limit mentioned)
- **Coverage**: US-focused, some international
- **Features**:
  - Job listings
  - Company profiles
  - Career advice content
- **Limitation**: Smaller dataset compared to others

### 4. **GitHub Jobs API** ❌ DEPRECATED
- **Status**: Shut down in May 2021
- **Alternative**: Use Adzuna or JSearch instead

---

## 🟡 SCRAPING OPTIONS (Use with caution)

### 5. **LinkedIn Jobs Scraper**
- **Method**: Web scraping (use libraries like Puppeteer/Playwright)
- **Cost**: FREE but requires server resources
- **Legal**: Check LinkedIn's Terms of Service
- **Limitation**: May get blocked, requires maintenance

### 6. **Indeed Jobs Scraper**
- **Method**: Web scraping
- **Cost**: FREE but requires server resources
- **Legal**: Indeed has anti-scraping measures
- **Limitation**: High chance of getting blocked

---

## 🔴 PAID OPTIONS (For reference)

### 7. **Reed API**
- **Cost**: Paid (£500+/month)
- **Coverage**: UK-focused

### 8. **Careerjet API**
- **Cost**: Paid (pricing on request)
- **Coverage**: Global

### 9. **ZipRecruiter API**
- **Cost**: Paid (enterprise only)
- **Coverage**: US-focused

---

## 💡 IMPLEMENTATION RECOMMENDATION

### Option A: Use Adzuna API (Recommended)
**Pros:**
- Free tier is generous (1000 calls/month)
- No credit card required
- Good coverage for India
- Official API with documentation
- Reliable and legal

**Implementation Steps:**
1. Sign up at https://developer.adzuna.com/
2. Get your APP_ID and APP_KEY
3. Add to `.env` file
4. Create job service to fetch from Adzuna
5. Cache results to reduce API calls

**Example Code:**
```javascript
// server/services/jobService.js
import axios from 'axios'

const ADZUNA_APP_ID = process.env.ADZUNA_APP_ID
const ADZUNA_APP_KEY = process.env.ADZUNA_APP_KEY

export const searchJobs = async (query, location = 'india', page = 1) => {
  try {
    const url = `https://api.adzuna.com/v1/api/jobs/in/search/${page}`
    const response = await axios.get(url, {
      params: {
        app_id: ADZUNA_APP_ID,
        app_key: ADZUNA_APP_KEY,
        results_per_page: 20,
        what: query,
        where: location,
        sort_by: 'date'
      }
    })
    return response.data.results
  } catch (error) {
    console.error('Adzuna API error:', error)
    throw error
  }
}
```

### Option B: Use JSearch API (Alternative)
**Pros:**
- Aggregates from Google Jobs
- Good for global coverage
- Free tier available

**Cons:**
- Requires RapidAPI account
- Lower free tier limit (250 calls/month)

### Option C: Hybrid Approach (Best for Production)
1. Use Adzuna API for real-time data
2. Cache results in Firestore for 24 hours
3. Fall back to AI-generated mock jobs if API fails
4. This way you stay within free tier limits

---

## 📊 COMPARISON TABLE

| API | Free Tier | Coverage | Ease of Use | Recommended |
|-----|-----------|----------|-------------|-------------|
| Adzuna | 1000/month | Global | ⭐⭐⭐⭐⭐ | ✅ YES |
| JSearch | 250/month | Global | ⭐⭐⭐⭐ | ✅ YES |
| The Muse | Unlimited | US-focused | ⭐⭐⭐ | ⚠️ Limited |
| Scraping | Unlimited | Any site | ⭐⭐ | ❌ Risky |

---

## 🚀 QUICK START GUIDE

### Step 1: Sign up for Adzuna
1. Go to https://developer.adzuna.com/
2. Click "Sign Up"
3. Fill in your details
4. Verify email
5. Get your APP_ID and APP_KEY

### Step 2: Add to your project
```bash
# Add to server/.env
ADZUNA_APP_ID=your_app_id_here
ADZUNA_APP_KEY=your_app_key_here
```

### Step 3: Install axios (if not already installed)
```bash
cd server
npm install axios
```

### Step 4: Create job service
Create `server/services/jobService.js` with the code above

### Step 5: Update job controller
```javascript
// server/controllers/jobController.js
import { searchJobs } from '../services/jobService.js'

export const getRecommendations = async (req, res) => {
  try {
    const userId = req.user.uid
    const userDoc = await db.collection('users').doc(userId).get()
    const userData = userDoc.data()
    
    const career = userData?.targetCareer || 'Software Developer'
    const jobs = await searchJobs(career, 'india')
    
    res.json({ jobs })
  } catch (error) {
    console.error('Job fetch error:', error)
    // Fallback to AI-generated jobs
    const mockJobs = await aiService.generateJobRecommendations(userData, userData.skills || [])
    res.json(mockJobs)
  }
}
```

---

## ⚠️ IMPORTANT NOTES

1. **Rate Limiting**: Always cache results to avoid hitting API limits
2. **Error Handling**: Have fallback to AI-generated jobs
3. **Legal**: Always check Terms of Service before using any API
4. **Cost**: Free tiers are sufficient for MVP/demo projects
5. **Production**: Consider paid plans when you have users

---

## 🎯 MY RECOMMENDATION FOR YOUR PROJECT

**Use Adzuna API with caching:**
- Sign up for free Adzuna account (no credit card needed)
- Implement job fetching with 24-hour cache
- Fall back to AI-generated jobs if API fails
- This gives you real job data without any cost
- 1000 calls/month is enough for demo/MVP

**Why not scraping?**
- Legal issues
- High maintenance
- Can get blocked
- Not reliable for demo

**Why not paid APIs?**
- You mentioned no budget
- Free tier is sufficient for your project
- Can upgrade later if needed
