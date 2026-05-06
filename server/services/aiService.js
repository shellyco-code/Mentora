import OpenAI from 'openai'

const GROQ_KEY = process.env.GROQ_API_KEY

const groq = new OpenAI({
  apiKey: GROQ_KEY,
  baseURL: 'https://api.groq.com/openai/v1'
})

// AI Service: Central class for orchestrating calls to Groq AI (Llama 3.3 70B)
class AIService {

  // chat: Low-level utility to send a raw prompt and receive a string response from AI
  async chat(prompt) {
    try {
      const result = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.9,
        max_tokens: 4096
      })
      return result.choices[0].message.content
    } catch (err) {
      console.error('Groq AI error:', err?.message)
      throw err
    }
  }

  async analyzeResume(resumeText, profile) {
    const prompt = `
You are an expert career coach. Analyze this resume and provide insights.

Resume Content:
${resumeText}

User Profile:
- Target Career: ${profile.targetCareer}
- Current Skills: ${profile.skills}
- Experience: ${profile.experience}

Provide a JSON response with:
1. summary: Brief overview of the resume
2. skills: Array of identified technical skills
3. skillGaps: Array of missing skills for target career
4. recommendations: Array of actionable recommendations

Format as valid JSON only.
`
    const text = await this.chat(prompt)
    const parsed = this.parseJSON(text) || {}
    
    // Normalize to ensure skillGaps always exists properly
    return {
      summary: parsed.summary || parsed.overview || "Analysis complete.",
      skills: Array.isArray(parsed.skills) ? parsed.skills : [],
      skillGaps: Array.isArray(parsed.skillGaps) ? parsed.skillGaps : (Array.isArray(parsed.skill_gaps) ? parsed.skill_gaps : []),
      recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : []
    }
  }

  async generateQuizQuestions(career, difficulty = 'intermediate') {
    const seed = Math.floor(Math.random() * 1000000)
    const prompt = `Generate 10 unique technical quiz questions for a ${career} position at ${difficulty} level.
    
    Context Seed: ${seed}
    
    Return ONLY valid JSON. No markdown. No explanation. No extra text. Just the JSON object below:
    {"questions":[{"id":"q1","question":"Question text here","options":["Option A","Option B","Option C","Option D"],"correctAnswer":"Option A","topic":"Topic name"}]}
    
    Rules:
    - Exactly 10 questions
    - Each question has exactly 4 options
    - correctAnswer must exactly match one of the options
    - Focus on diverse, real-world practical scenarios (avoid generic definitions)
    - Ensure questions are unique and varied. Do not repeat common basic questions.
    - Return ONLY the JSON, nothing else`
    const text = await this.chat(prompt)
    const parsed = this.parseJSON(text)
    return this.normalizeQuizResponse(parsed)
  }

  /**
   * Normalize quiz response from AI into { questions: [...] } format.
   * Handles: bare arrays, objects with wrong keys, numbered object properties, etc.
   */
  normalizeQuizResponse(parsed) {
    // Already correct format
    if (parsed?.questions && Array.isArray(parsed.questions) && parsed.questions.length > 0) {
      return parsed
    }

    // Check for common alternative keys the AI might use
    const altKeys = ['quiz', 'quizQuestions', 'quiz_questions', 'data', 'items', 'results']
    for (const key of altKeys) {
      if (parsed?.[key] && Array.isArray(parsed[key]) && parsed[key].length > 0) {
        console.log(`Quiz: found questions under alternative key "${key}"`)
        return { questions: parsed[key] }
      }
    }

    // If parsed is itself an array of question objects
    if (Array.isArray(parsed) && parsed.length > 0 && parsed[0]?.question) {
      console.log('Quiz: response was a bare array, wrapping in { questions }')
      return { questions: parsed }
    }

    // If parsed is an object with numbered keys like { "1": {...}, "2": {...} }
    // or keys like "q1", "q2", etc.
    const values = Object.values(parsed || {})
    if (values.length >= 5 && values.every(v => v && typeof v === 'object' && (v.question || v.text))) {
      console.log('Quiz: response was an object with numbered/named keys, extracting values')
      const questions = values.map((v, i) => ({
        id: v.id || `q${i + 1}`,
        question: v.question || v.text,
        options: v.options || v.choices || [],
        correctAnswer: v.correctAnswer || v.correct_answer || v.answer || '',
        topic: v.topic || v.category || ''
      }))
      return { questions }
    }

    // Check if there's any array value inside the object that looks like questions
    for (const key of Object.keys(parsed || {})) {
      const val = parsed[key]
      if (Array.isArray(val) && val.length > 0 && val[0]?.question) {
        console.log(`Quiz: found question-like array under key "${key}"`)
        return { questions: val }
      }
    }

    // Give up — return as-is, the controller will retry
    console.warn('Quiz: could not normalize response, keys:', Object.keys(parsed || {}))
    return parsed
  }

  async evaluateQuizResults(questions, answers) {
    const prompt = `
Evaluate quiz performance and provide feedback.

Questions and User Answers:
${JSON.stringify({ questions, answers })}

Provide JSON response with:
1. score: Percentage score (number)
2. strengths: Array of strong areas
3. weaknesses: Array of areas to improve
4. recommendations: Array of learning suggestions

Format as valid JSON only.
`
    const text = await this.chat(prompt)
    const parsed = this.parseJSON(text)
    return this.normalizeEvaluationResponse(parsed)
  }

  normalizeEvaluationResponse(parsed) {
    if (typeof parsed?.score === 'number' && parsed.strengths && parsed.weaknesses) {
      return parsed
    }

    // Try to extract if wrapped differently
    const result = {
      score: parsed?.score || parsed?.results?.score || 0,
      strengths: Array.isArray(parsed?.strengths) ? parsed.strengths : (Array.isArray(parsed?.results?.strengths) ? parsed.results.strengths : []),
      weaknesses: Array.isArray(parsed?.weaknesses) ? parsed.weaknesses : (Array.isArray(parsed?.results?.weaknesses) ? parsed.results.weaknesses : []),
      recommendations: Array.isArray(parsed?.recommendations) ? parsed.recommendations : (Array.isArray(parsed?.results?.recommendations) ? parsed.results.recommendations : [])
    }

    // Fallback parsing for score if it's a string like "80%"
    if (typeof result.score === 'string') {
      result.score = parseInt(result.score.replace(/\D/g, ''), 10) || 0
    }

    return result
  }

  async generateRoadmap(profile, quizResults) {
    const prompt = `Create a 6-month career roadmap for a ${profile.targetCareer || 'Software Developer'}.
Skills: ${profile.skills || 'beginner'}, Experience: ${profile.experience || 'fresher'}, Quiz Score: ${quizResults?.score || 'not taken'}.

Return ONLY valid JSON. No markdown. No explanation:
{"title":"Roadmap title","description":"Overview","phases":[{"title":"Phase name","duration":"Month 1-2","tasks":[{"title":"Task name","description":"What to do","resources":[{"name":"freeCodeCamp - HTML Basics","url":"https://www.freecodecamp.org/learn/responsive-web-design/"}]}]}]}

Rules:
- 4 to 6 phases
- 3 to 5 tasks per phase
- Each task MUST have 1 to 3 resources
- Each resource MUST be a JSON object with "name" (human readable label) and "url" (real working URL)
- Use REAL URLs from these platforms: freeCodeCamp (freecodecamp.org), MDN Web Docs (developer.mozilla.org), YouTube tutorials (youtube.com), W3Schools (w3schools.com), JavaScript.info (javascript.info), React docs (react.dev), Node.js docs (nodejs.org), MongoDB University (learn.mongodb.com), Codecademy (codecademy.com), GeeksforGeeks (geeksforgeeks.org)
- URLs must be real, working links to actual pages on these websites
- Return ONLY the JSON, nothing else`
    const text = await this.chat(prompt)
    const parsed = this.parseJSON(text)
    return this.normalizeRoadmapResponse(parsed)
  }

  async generateDailyTasks(profile, quizResults, roadmap) {
    const prompt = `Generate 7 personalized daily learning tasks for a ${profile.targetCareer || 'Software Developer'} learner.
Skills: ${profile.skills || 'beginner'}, Experience: ${profile.experience || 'fresher'}, Quiz Score: ${quizResults?.score || 'not taken'}.

Return ONLY valid JSON. No markdown. No explanation:
{"tasks":[{"id":"t1","title":"Task title","description":"What to do","type":"Learning","duration":"45 min","priority":"high","completed":false}]}

Rules:
- Exactly 7 tasks
- type must be one of: Learning, Practice, Project, Reading
- priority must be one of: high, medium, low
- Return ONLY the JSON, nothing else`
    const text = await this.chat(prompt)
    const parsed = this.parseJSON(text)
    return this.normalizeTasksResponse(parsed)
  }

  /**
   * Normalize daily tasks response into { tasks: [...] }
   */
  normalizeTasksResponse(parsed) {
    // Already correct
    if (parsed?.tasks && Array.isArray(parsed.tasks) && parsed.tasks.length > 0) {
      return parsed
    }

    // Check alternative keys
    const altKeys = ['dailyTasks', 'daily_tasks', 'data', 'items', 'results', 'todo', 'assignments']
    for (const key of altKeys) {
      if (parsed?.[key] && Array.isArray(parsed[key]) && parsed[key].length > 0) {
        console.log(`Tasks: found tasks under alternative key "${key}"`)
        return { tasks: parsed[key] }
      }
    }

    // Bare array of task objects
    if (Array.isArray(parsed) && parsed.length > 0 && (parsed[0]?.title || parsed[0]?.description)) {
      console.log('Tasks: response was a bare array, wrapping in { tasks }')
      return { tasks: parsed.map((t, i) => ({ id: t.id || `t${i + 1}`, completed: false, ...t })) }
    }

    // Object with numbered/named keys
    const values = Object.values(parsed || {})
    if (values.length >= 3 && values.every(v => v && typeof v === 'object' && (v.title || v.description))) {
      console.log('Tasks: response was an object with numbered keys, extracting values')
      return { tasks: values.map((t, i) => ({ id: t.id || `t${i + 1}`, completed: false, ...t })) }
    }

    // Check any array inside the object that looks like tasks
    for (const key of Object.keys(parsed || {})) {
      const val = parsed[key]
      if (Array.isArray(val) && val.length > 0 && (val[0]?.title || val[0]?.description)) {
        console.log(`Tasks: found task-like array under key "${key}"`)
        return { tasks: val }
      }
    }

    console.warn('Tasks: could not normalize response, keys:', Object.keys(parsed || {}))
    return parsed
  }

  /**
   * Normalize roadmap response into { title, phases: [...] }
   */
  normalizeRoadmapResponse(parsed) {
    // Already has phases
    if (parsed?.phases && Array.isArray(parsed.phases) && parsed.phases.length > 0) {
      return parsed
    }

    // Check alternative keys
    const altKeys = ['roadmap', 'plan', 'milestones', 'steps', 'data', 'items']
    for (const key of altKeys) {
      if (parsed?.[key] && Array.isArray(parsed[key]) && parsed[key].length > 0) {
        console.log(`Roadmap: found phases under alternative key "${key}"`)
        return { ...parsed, phases: parsed[key] }
      }
    }

    // Bare array
    if (Array.isArray(parsed) && parsed.length > 0 && (parsed[0]?.title || parsed[0]?.duration)) {
      console.log('Roadmap: response was a bare array, wrapping as phases')
      return { title: 'Your Career Roadmap', description: 'Personalized learning path', phases: parsed }
    }

    console.warn('Roadmap: could not normalize response, keys:', Object.keys(parsed || {}))
    return parsed
  }

  async generateJobRecommendations(profile, skills) {
    const prompt = `
Recommend job opportunities for:
- Target Career: ${profile.targetCareer}
- Skills: ${skills.join(', ')}
- Experience: ${profile.experience}

Generate JSON with realistic job listings:
{
  "jobs": [
    {
      "title": "Job title",
      "company": "Company name",
      "location": "Location",
      "type": "Full-time/Remote",
      "salary": "Salary range",
      "description": "Job description",
      "skills": ["Required skills"],
      "matchScore": 85,
      "link": "https://www.linkedin.com/jobs/search/?keywords=JobTitle"
    }
  ]
}

Create 5-8 relevant job listings. Format as valid JSON only.
`
    const text = await this.chat(prompt)
    return this.parseJSON(text)
  }

  // parseJSON: Crucial utility to clean and extract valid JSON from messy AI text responses
  parseJSON(text) {
    try {
      // Sanitization: Remove Markdown code fences (```json) that AI often adds
      let stripped = text
        .replace(/```json\s*/gi, '')
        .replace(/```\s*/g, '')
        .trim()

      // Regex Fix: Remove illegal trailing commas before closing braces/brackets
      stripped = stripped.replace(/,\s*([}\]])/g, '$1')
      // Flattening: Convert multi-line responses into a single string for parsing
      stripped = stripped.replace(/\n/g, ' ')

      // Attempt 1: Direct parsing of the cleaned string
      try {
        return JSON.parse(stripped)
      } catch { }

      // Find outermost JSON object {
      const objStart = stripped.indexOf('{')
      // Find outermost JSON array [
      const arrStart = stripped.indexOf('[')

      let jsonStr = null

      if (objStart !== -1 && (arrStart === -1 || objStart < arrStart)) {
        // Object comes first
        let depth = 0, end = -1
        for (let i = objStart; i < stripped.length; i++) {
          if (stripped[i] === '{') depth++
          else if (stripped[i] === '}') { depth--; if (depth === 0) { end = i; break } }
        }
        if (end !== -1) jsonStr = stripped.slice(objStart, end + 1)
      } else if (arrStart !== -1) {
        // Array comes first — wrap it in an object based on context
        let depth = 0, end = -1
        for (let i = arrStart; i < stripped.length; i++) {
          if (stripped[i] === '[') depth++
          else if (stripped[i] === ']') { depth--; if (depth === 0) { end = i; break } }
        }
        if (end !== -1) {
          const arr = stripped.slice(arrStart, end + 1)
          // Detect what kind of array it is and wrap accordingly
          if (arr.includes('"question"')) jsonStr = `{"questions":${arr}}`
          else if (arr.includes('"title"') && arr.includes('"duration"')) jsonStr = `{"phases":${arr}}`
          else if (arr.includes('"title"') && arr.includes('"priority"')) jsonStr = `{"tasks":${arr}}`
          else if (arr.includes('"title"') && arr.includes('"company"')) jsonStr = `{"jobs":${arr}}`
          else jsonStr = `{"items":${arr}}`
        }
      }

      if (!jsonStr) throw new Error('No JSON found in response')
      return JSON.parse(jsonStr)
    } catch (error) {
      console.error('JSON parse error:', error.message)
      console.error('Raw AI text (first 800):', text?.slice(0, 800))
      throw new Error('Failed to parse AI response: ' + error.message)
    }
  }
}

export default new AIService()
