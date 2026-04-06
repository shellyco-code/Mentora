import { db } from '../config/firebaseConfig.js'

export const createProfile = async (req, res) => {
  try {
    const userId = req.user.uid
    const profileData = {
      ...req.body,
      userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    await db.collection('users').doc(userId).set(profileData, { merge: true })
    
    res.status(201).json({
      message: 'Profile created successfully',
      profile: profileData
    })
  } catch (error) {
    console.error('Create profile error:', error)
    res.status(500).json({ error: 'Failed to create profile' })
  }
}

export const getProfile = async (req, res) => {
  try {
    const userId = req.user.uid
    const doc = await db.collection('users').doc(userId).get()

    if (!doc.exists) {
      return res.status(404).json({ error: 'Profile not found' })
    }

    res.json(doc.data())
  } catch (error) {
    console.error('Get profile error:', error)
    res.status(500).json({ error: 'Failed to get profile' })
  }
}

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.uid
    const updates = {
      ...req.body,
      updatedAt: new Date().toISOString()
    }

    await db.collection('users').doc(userId).update(updates)
    
    res.json({
      message: 'Profile updated successfully',
      profile: updates
    })
  } catch (error) {
    console.error('Update profile error:', error)
    res.status(500).json({ error: 'Failed to update profile' })
  }
}
