import { GoogleGenerativeAI } from '@google/generative-ai'
import dotenv from 'dotenv'
dotenv.config()

const API_KEY = process.env.GEMINI_API_KEY

if (!API_KEY) {
  console.error('❌ GEMINI_API_KEY is missing from .env')
}

const genAI = new GoogleGenerativeAI(API_KEY)

export const getGeminiModel = () => {
  return genAI.getGenerativeModel({ 
    model: 'gemma-3-4b-it',
    generationConfig: {
      temperature: 0.9,
      topP: 0.95,
      topK: 40,
      maxOutputTokens: 2048,
    }
  })
}

export default genAI
