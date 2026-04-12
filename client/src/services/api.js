import axios from 'axios'
import { auth } from '../config/firebase'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

api.interceptors.request.use(async (config) => {
  const user = auth.currentUser
  if (user) {
    const token = await user.getIdToken()
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const profileAPI = {
  create: (data) => api.post('/profile', data),
  get: () => api.get('/profile'),
  update: (data) => api.put('/profile', data)
}

export const resumeAPI = {
  upload: (formData) => api.post('/resume/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  analyze: () => api.post('/resume/analyze'),
  getAnalysis: () => api.get('/resume/analysis')
}

export const quizAPI = {
  getQuestions: (career) => api.get(`/quiz/questions?career=${career}`),
  submit: (payload) => api.post('/quiz/submit', payload)
}

export const roadmapAPI = {
  generate: () => api.post('/roadmap/generate'),
  get: () => api.get('/roadmap')
}

export const progressAPI = {
  get: () => api.get('/progress'),
  generate: () => api.post('/progress/generate'),
  update: (taskId, completed) => api.put('/progress/task', { taskId, completed })
}

export const jobsAPI = {
  getRecommendations: () => api.get('/jobs/recommendations')
}

export default api
