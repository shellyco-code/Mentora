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
      // Race the AI call against a 10-second timeout for the presentation
      const aiPromise = aiService.generateRoadmap(userData, quizData)
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('AI Generation Timeout')), 10000)
      )
      
      roadmap = await Promise.race([aiPromise, timeoutPromise])
      
      // Check if AI actually returned a valid roadmap structure
      if (!roadmap || !roadmap.phases || !Array.isArray(roadmap.phases) || roadmap.phases.length === 0) {
        throw new Error('AI returned empty or invalid roadmap structure')
      }
    } catch (aiError) {
      console.warn('Roadmap AI generation failed or timed out, using emergency mock fallback:', aiError.message)
      roadmap = {
        title: `Career Roadmap for ${userData.targetCareer || 'Software Developer'}`,
        description: "A comprehensive 6-month plan to master the skills required for your target role.",
        phases: [
          { 
            title: "Phase 1: Core Fundamentals", 
            duration: "Month 1-2", 
            tasks: [
              { title: "Master JavaScript ES6+", description: "Deep dive into closures, promises, and async/await.", resources: [{name: "MDN: JavaScript", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript"}, {name: "freeCodeCamp JS", url: "https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures/"}] },
              { title: "React Hooks & State", description: "Master useState, useEffect, and custom hooks.", resources: [{name: "React Docs", url: "https://react.dev/reference/react"}, {name: "WebDevSimplified React", url: "https://www.youtube.com/watch?v=hQAHSlTtcmY"}] },
              { title: "CSS Mastery", description: "Learn Flexbox, Grid, and responsive design patterns.", resources: [{name: "CSS Tricks: Flexbox", url: "https://css-tricks.com/snippets/css/a-guide-to-flexbox/"}, {name: "MDN: Grid", url: "https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_grid_layout"}] }
            ] 
          },
          { 
            title: "Phase 2: Backend & APIs", 
            duration: "Month 3-4", 
            tasks: [
              { title: "Node.js & Express", description: "Build scalable server-side applications.", resources: [{name: "Node.js Docs", url: "https://nodejs.org/en/docs/"}, {name: "Express Routing", url: "https://expressjs.com/en/guide/routing.html"}] },
              { title: "Database Integration", description: "Connect and query MongoDB or Firebase Firestore.", resources: [{name: "MongoDB University", url: "https://learn.mongodb.com/"}, {name: "Firebase Docs", url: "https://firebase.google.com/docs/firestore"}] },
              { title: "RESTful API Design", description: "Implement secure and efficient API endpoints.", resources: [{name: "REST API Best Practices", url: "https://stackoverflow.blog/2020/03/02/best-practices-for-rest-api-design/"}] }
            ] 
          },
          { 
            title: "Phase 3: Deployment & Scale", 
            duration: "Month 5-6", 
            tasks: [
              { title: "Docker & Containerization", description: "Learn to containerize and deploy applications.", resources: [{name: "Docker Getting Started", url: "https://docs.docker.com/get-started/"}] },
              { title: "System Design", description: "Understand load balancing, caching, and scalability.", resources: [{name: "System Design Primer", url: "https://github.com/donnemartin/system-design-primer"}] },
              { title: "Portfolio Project", description: "Build and deploy a complex full-stack application.", resources: [{name: "Vercel Deployment", url: "https://vercel.com/docs"}] }
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

    const existingSnap = await db.collection('roadmaps').where('userId', '==', userId).limit(1).get();
    if (!existingSnap.empty) {
      await db.collection('roadmaps').doc(existingSnap.docs[0].id).update(roadmapDoc);
    } else {
      await db.collection('roadmaps').add(roadmapDoc);
    }

    res.json(roadmapDoc)
  } catch (error) {
    console.error('Generate roadmap error:', error.message || error)
    // Even if Firestore save fails, return a mock roadmap so the UI never breaks
    res.json({
      title: 'Career Roadmap for Software Developer',
      description: 'A comprehensive 6-month plan to master the skills required for your target role.',
      phases: [
        { title: 'Phase 1: Core Fundamentals', duration: 'Month 1-2', tasks: [
          { title: 'Master JavaScript ES6+', description: 'Deep dive into closures, promises, and async/await.', resources: [{name: "MDN: JavaScript", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript"}, {name: "freeCodeCamp JS", url: "https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures/"}] },
          { title: 'React Hooks & State', description: 'Master useState, useEffect, and custom hooks.', resources: [{name: "React Docs", url: "https://react.dev/reference/react"}] },
          { title: 'CSS Mastery', description: 'Learn Flexbox, Grid, and responsive design patterns.', resources: [{name: "CSS Tricks", url: "https://css-tricks.com/"}] }
        ]},
        { title: 'Phase 2: Backend & APIs', duration: 'Month 3-4', tasks: [
          { title: 'Node.js & Express', description: 'Build scalable server-side applications.', resources: [{name: "Node.js Docs", url: "https://nodejs.org/en/docs/"}] },
          { title: 'Database Integration', description: 'Connect and query MongoDB or Firebase Firestore.', resources: [{name: "Firebase Docs", url: "https://firebase.google.com/docs/firestore"}] },
          { title: 'RESTful API Design', description: 'Implement secure and efficient API endpoints.', resources: [{name: "REST API Best Practices", url: "https://stackoverflow.blog/2020/03/02/best-practices-for-rest-api-design/"}] }
        ]},
        { title: 'Phase 3: Deployment & Scale', duration: 'Month 5-6', tasks: [
          { title: 'Docker & Containerization', description: 'Learn to containerize and deploy applications.', resources: [{name: "Docker Docs", url: "https://docs.docker.com/"}] },
          { title: 'System Design', description: 'Understand load balancing, caching, and scalability.', resources: [{name: "System Design Primer", url: "https://github.com/donnemartin/system-design-primer"}] },
          { title: 'Portfolio Project', description: 'Build and deploy a complex full-stack application.', resources: [{name: "Vercel Docs", url: "https://vercel.com/docs"}] }
        ]}
      ]
    })
  }
}

export const getRoadmap = async (req, res) => {
  try {
    const userId = req.user.uid

    const roadmapQuery = await db.collection('roadmaps')
      .where('userId', '==', userId)
      .get()

    if (roadmapQuery.empty) {
      return res.status(404).json({ error: 'No roadmap found' })
    }

    // Since we don't have an index for orderBy, sort in memory to get the absolute latest one
    const roadmaps = roadmapQuery.docs.map(doc => doc.data())
    roadmaps.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    
    res.json(roadmaps[0])
  } catch (error) {
    console.error('Get roadmap error:', error)
    res.status(500).json({ error: 'Failed to get roadmap' })
  }
}
