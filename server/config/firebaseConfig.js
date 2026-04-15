import admin from 'firebase-admin'
import { readFileSync, existsSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

let serviceAccount

// Production: load from environment variable (Render, Railway, etc.)
if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
} else {
  // Local development: load from file
  const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || './serviceAccountKey.json'
  const fullPath = join(__dirname, '..', serviceAccountPath)
  if (!existsSync(fullPath)) {
    console.error('❌ Firebase service account key not found!')
    console.error('Set FIREBASE_SERVICE_ACCOUNT env var or place serviceAccountKey.json in server/')
    process.exit(1)
  }
  serviceAccount = JSON.parse(readFileSync(fullPath, 'utf8'))
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET
})

export const db = admin.firestore()
export const auth = admin.auth()
export const storage = admin.storage()

export default admin
