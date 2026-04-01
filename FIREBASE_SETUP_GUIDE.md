# Firebase Setup Guide for Mentora

## Step 1: Create Firebase Project

1. Go to: https://console.firebase.google.com
2. Click "Add Project" or "Create a project"
3. Enter project name: **Mentora** (or any name you want)
4. Click Continue
5. Disable Google Analytics (optional, not needed for now)
6. Click "Create Project"
7. Wait for project to be created
8. Click "Continue"

## Step 2: Register Web App

1. In Firebase Console, click the **Web icon** (</>) to add a web app
2. Enter app nickname: **Mentora Web**
3. Check "Also set up Firebase Hosting" (optional)
4. Click "Register app"
5. You'll see Firebase configuration code - COPY THIS!

It will look like:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "mentora-xxxxx.firebaseapp.com",
  projectId: "mentora-xxxxx",
  storageBucket: "mentora-xxxxx.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456"
};
```

## Step 3: Enable Authentication

1. In left sidebar, click **"Build"** → **"Authentication"**
2. Click **"Get Started"**
3. Click on **"Email/Password"** provider
4. Toggle **"Enable"** switch ON
5. Click **"Save"**

## Step 4: Create Firestore Database

1. In left sidebar, click **"Build"** → **"Firestore Database"**
2. Click **"Create database"**
3. Select **"Start in test mode"** (for development)
4. Click **"Next"**
5. Choose location: **us-central** (or closest to you)
6. Click **"Enable"**

## Step 5: Enable Firebase Storage

1. In left sidebar, click **"Build"** → **"Storage"**
2. Click **"Get Started"**
3. Click **"Next"** (keep default rules for now)
4. Choose same location as Firestore
5. Click **"Done"**

## Step 6: Get Service Account Key (for Backend)

1. Click the **gear icon** ⚙️ next to "Project Overview"
2. Click **"Project settings"**
3. Go to **"Service accounts"** tab
4. Click **"Generate new private key"**
5. Click **"Generate key"**
6. A JSON file will download - SAVE THIS FILE!
7. Rename it to: **serviceAccountKey.json**
8. Move it to: **server/** folder

## Step 7: Update Environment Variables

### Frontend (.env file in client/ folder)

Copy the config from Step 2 and update `client/.env`:

```env
VITE_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
VITE_FIREBASE_AUTH_DOMAIN=mentora-xxxxx.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=mentora-xxxxx
VITE_FIREBASE_STORAGE_BUCKET=mentora-xxxxx.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
VITE_API_URL=http://localhost:5000/api
```

### Backend (.env file in server/ folder)

Update `server/.env`:

```env
PORT=5000
FIREBASE_SERVICE_ACCOUNT_PATH=./serviceAccountKey.json
FIREBASE_STORAGE_BUCKET=mentora-xxxxx.appspot.com
GEMINI_API_KEY=your_gemini_api_key_here
```

## Step 8: Get Gemini API Key

1. Go to: https://makersuite.google.com/app/apikey
2. Click **"Create API Key"**
3. Select your Google Cloud project (or create new)
4. Copy the API key
5. Add it to `server/.env` as `GEMINI_API_KEY`

## Step 9: Restart Servers

After updating .env files:

1. Stop both servers (Ctrl+C)
2. Restart frontend: `cd client && npm run dev`
3. Restart backend: `cd server && npm run dev`

## Step 10: Test

1. Go to http://localhost:3000
2. Click "Get Started"
3. Create account with email/password
4. Login should work!

---

## Troubleshooting

### Error: "Firebase: Error (auth/invalid-api-key)"
- Check if VITE_FIREBASE_API_KEY is correct in client/.env
- Make sure there are no extra spaces

### Error: "Firebase: Error (auth/project-not-found)"
- Check if VITE_FIREBASE_PROJECT_ID matches your Firebase project

### Backend errors
- Make sure serviceAccountKey.json is in server/ folder
- Check if FIREBASE_STORAGE_BUCKET matches your project

---

## Security Rules (Optional - for Production)

### Firestore Rules
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /roadmaps/{roadmapId} {
      allow read, write: if request.auth != null;
    }
    match /quizResults/{resultId} {
      allow read, write: if request.auth != null;
    }
    match /progress/{progressId} {
      allow read, write: if request.auth != null;
    }
    match /jobRecommendations/{jobId} {
      allow read: if request.auth != null;
    }
  }
}
```

### Storage Rules
```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /resumes/{userId}/{fileName} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

---

## Done! 🎉

Your Mentora app is now fully configured with Firebase!
