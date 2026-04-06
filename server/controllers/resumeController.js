import { storage, db } from '../config/firebaseConfig.js'
import aiService from '../services/aiService.js'
import pdfParse from 'pdf-parse'

export const uploadResume = async (req, res) => {
  try {
    const userId = req.user.uid
    const file = req.file

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' })
    }

    // Parse PDF text first so we can store it regardless of Storage availability
    let resumeText = ''
    try {
      const pdfData = await pdfParse(file.buffer)
      resumeText = pdfData.text
    } catch (pdfErr) {
      console.warn('PDF parse warning:', pdfErr.message)
    }

    let url = null
    let fileName = null

    // Try Firebase Storage — gracefully skip if not configured
    try {
      const bucket = storage.bucket()
      fileName = `resumes/${userId}/${Date.now()}_${file.originalname}`
      const fileUpload = bucket.file(fileName)

      await fileUpload.save(file.buffer, {
        metadata: { contentType: file.mimetype }
      })

      const [signedUrl] = await fileUpload.getSignedUrl({
        action: 'read',
        expires: '03-01-2500'
      })
      url = signedUrl
    } catch (storageErr) {
      console.warn('Storage upload skipped (check FIREBASE_STORAGE_BUCKET):', storageErr.message)
    }

    // Always save to Firestore
    await db.collection('users').doc(userId).set({
      resumeUrl: url || '',
      resumePath: fileName || '',
      resumeText,
      resumeFileName: file.originalname,
      resumeUploadedAt: new Date().toISOString()
    }, { merge: true })

    res.json({
      message: 'Resume uploaded successfully',
      url,
      fileName: file.originalname
    })
  } catch (error) {
    console.error('Upload resume error:', error)
    res.status(500).json({ error: error.message || 'Failed to upload resume' })
  }
}

export const analyzeResume = async (req, res) => {
  try {
    const userId = req.user.uid

    const userDoc = await db.collection('users').doc(userId).get()
    const userData = userDoc.data()

    if (!userData) {
      return res.status(400).json({ error: 'User not found' })
    }

    let resumeText = userData.resumeText || ''

    // If no cached text but we have a storage path, try downloading
    if (!resumeText && userData.resumePath) {
      try {
        const bucket = storage.bucket()
        const file = bucket.file(userData.resumePath)
        const [buffer] = await file.download()
        const pdfData = await pdfParse(buffer)
        resumeText = pdfData.text
      } catch (storageErr) {
        console.warn('Could not download from storage:', storageErr.message)
      }
    }

    if (!resumeText) {
      return res.status(400).json({ error: 'No resume text found. Please upload your resume first.' })
    }

    const analysis = await aiService.analyzeResume(resumeText, userData)

    await db.collection('users').doc(userId).set({
      resumeAnalysis: analysis,
      analyzedAt: new Date().toISOString()
    }, { merge: true })

    res.json(analysis)
  } catch (error) {
    console.error('Analyze resume error:', error)
    res.status(500).json({ error: error.message || 'Failed to analyze resume' })
  }
}

export const getAnalysis = async (req, res) => {
  try {
    const userId = req.user.uid

    const userDoc = await db.collection('users').doc(userId).get()
    const userData = userDoc.data()

    if (!userData) {
      return res.status(404).json({ error: 'User not found' })
    }

    if (!userData.resumeAnalysis) {
      return res.status(404).json({ error: 'No analysis found' })
    }

    res.json({
      analysis: userData.resumeAnalysis,
      fileName: userData.resumeFileName || 'Resume',
      uploadedAt: userData.resumeUploadedAt,
      analyzedAt: userData.analyzedAt
    })
  } catch (error) {
    console.error('Get analysis error:', error)
    res.status(500).json({ error: error.message || 'Failed to get analysis' })
  }
}
