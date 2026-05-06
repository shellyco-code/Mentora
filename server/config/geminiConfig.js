import { GoogleGenerativeAI } from '@google/generative-ai'
import dotenv from 'dotenv'
dotenv.config()

const API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyDKJj5ioGAr0cwrN4LSTA6jyu5z_yTKXrA'

if (!API_KEY) {
  console.error('❌ GEMINI_API_KEY is missing from .env')
}

const genAI = new GoogleGenerativeAI(API_KEY)

export const getGeminiModel = () => {
  return genAI.getGenerativeModel({ 
    model: 'gemini-2.0-flash',
    generationConfig: {
      temperature: 0.9,
      topP: 0.95,
      topK: 40,
      maxOutputTokens: 2048,
    }
  })
}

export default genAI
