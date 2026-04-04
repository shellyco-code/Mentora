import { GoogleGenerativeAI } from '@google/generative-ai'
import dotenv from 'dotenv'
dotenv.config()

const API_KEY = process.env.GEMINI_API_KEY

if (!API_KEY) {
  console.error('❌ GEMINI_API_KEY is missing from .env')
}

const genAI = new GoogleGenerativeAI(API_KEY)

export const getGeminiModel = () => {
  return genAI.getGenerativeModel({ model: 'gemma-3-4b-it' })
}

export default genAI
