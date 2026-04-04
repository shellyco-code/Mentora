import admin from 'firebase-admin'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || './serviceAccountKey.json'
const fullPath = join(__dirname, '..', serviceAccountPath)

const serviceAccount = JSON.parse(
  readFileSync(fullPath, 'utf8')
)

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET
})

export const db = admin.firestore()
export const auth = admin.auth()
export const storage = admin.storage()

export default admin
