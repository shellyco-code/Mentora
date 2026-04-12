import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import LandingPage from './pages/LandingPage'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import Profile from './pages/Profile'
import ResumeUpload from './pages/ResumeUpload'
import Quiz from './pages/Quiz'
import Roadmap from './pages/Roadmap'
import Progress from './pages/Progress'
import Jobs from './pages/Jobs'

const PrivateRoute = ({ children }) => {
  const { currentUser, loading } = useAuth()
  
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  }
  
  return currentUser ? children : <Navigate to="/login" />
}

const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      
      <Route path="/dashboard" element={
        <PrivateRoute><Dashboard /></PrivateRoute>
      } />
      <Route path="/profile" element={
        <PrivateRoute><Profile /></PrivateRoute>
      } />
      <Route path="/resume" element={
        <PrivateRoute><ResumeUpload /></PrivateRoute>
      } />
      <Route path="/quiz" element={
        <PrivateRoute><Quiz /></PrivateRoute>
      } />
      <Route path="/roadmap" element={
        <PrivateRoute><Roadmap /></PrivateRoute>
      } />
      <Route path="/progress" element={
        <PrivateRoute><Progress /></PrivateRoute>
      } />
      <Route path="/jobs" element={
        <PrivateRoute><Jobs /></PrivateRoute>
      } />
    </Routes>
  )
}

export default AppRouter
