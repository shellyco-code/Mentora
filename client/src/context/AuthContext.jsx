import { createContext, useContext, useState, useEffect } from 'react'
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth'
import { auth } from '../config/firebase'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [demoMode, setDemoMode] = useState(false)

  // Check if Firebase is configured
  useEffect(() => {
    if (!auth) {
      setDemoMode(true)
      setLoading(false)
      return
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user)
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const signup = async (email, password) => {
    if (demoMode) {
      // Demo mode - simulate signup
      const demoUser = { uid: 'demo-user', email }
      setCurrentUser(demoUser)
      localStorage.setItem('demoUser', JSON.stringify(demoUser))
      return Promise.resolve(demoUser)
    }
    return createUserWithEmailAndPassword(auth, email, password)
  }

  const login = async (email, password) => {
    if (demoMode) {
      // Demo mode - simulate login
      const demoUser = { uid: 'demo-user', email }
      setCurrentUser(demoUser)
      localStorage.setItem('demoUser', JSON.stringify(demoUser))
      return Promise.resolve(demoUser)
    }
    return signInWithEmailAndPassword(auth, email, password)
  }

  const loginWithGoogle = async () => {
    if (demoMode) {
      const demoUser = { uid: 'demo-user', email: 'demo@google.com' }
      setCurrentUser(demoUser)
      localStorage.setItem('demoUser', JSON.stringify(demoUser))
      return Promise.resolve(demoUser)
    }
    const provider = new GoogleAuthProvider()
    return signInWithPopup(auth, provider)
  }

  const logout = () => {
    if (demoMode) {
      setCurrentUser(null)
      localStorage.removeItem('demoUser')
      return Promise.resolve()
    }
    return signOut(auth)
  }

  const value = {
    currentUser,
    loading,
    signup,
    login,
    loginWithGoogle,
    logout,
    demoMode
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
