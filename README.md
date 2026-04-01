# Mentora - AI Powered Career Development Platform

A production-ready full-stack application that provides personalized career guidance, skill assessments, and AI-powered roadmaps.

## Tech Stack

### Frontend
- React.js (Vite)
- React Router
- Axios
- Context API
- Tailwind CSS
- Firebase Auth

### Backend
- Node.js
- Express.js
- Firebase Admin SDK
- Firestore
- Firebase Storage
- Gemini API (Google Generative AI)

## Features

- 🔐 Authentication (Firebase Auth)
- 👤 Profile Setup
- 📄 Resume Upload & AI Analysis
- ✍️ Skill Assessment Quiz
- 🎯 Career Path Suggestions
- 🗺️ Timeline-based Roadmap Generation
- 📊 Progress Dashboard
- 💼 Job Recommendations

## Project Structure

```
Mentora/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   ├── context/       # React Context
│   │   ├── config/        # Firebase config
│   │   └── App.jsx
│   └── package.json
│
├── server/                # Express backend
│   ├── config/           # Configuration files
│   ├── controllers/      # Route controllers
│   ├── routes/           # API routes
│   ├── services/         # Business logic
│   ├── middlewares/      # Custom middlewares
│   └── server.js
│
└── README.md
```

## Setup Instructions

### Prerequisites

- Node.js (v18 or higher)
- Firebase Project
- Gemini API Key

### Firebase Setup

1. Create a Firebase project at https://console.firebase.google.com
2. Enable Authentication (Email/Password)
3. Create a Firestore database
4. Enable Firebase Storage
5. Download service account key:
   - Go to Project Settings > Service Accounts
   - Click "Generate New Private Key"
   - Save as `serviceAccountKey.json` in `server/` directory

### Backend Setup

```bash
cd server
npm install
```

Create `.env` file in `server/` directory:

```env
PORT=5000
FIREBASE_SERVICE_ACCOUNT_PATH=./serviceAccountKey.json
FIREBASE_STORAGE_BUCKET=your-project.appspot.com
GEMINI_API_KEY=your_gemini_api_key_here
```

Start the server:

```bash
npm run dev
```

### Frontend Setup

```bash
cd client
npm install
```

Create `.env` file in `client/` directory:

```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_API_URL=http://localhost:5000/api
```

Start the development server:

```bash
npm run dev
```

The app will be available at http://localhost:3000

## API Endpoints

### Authentication
- Handled by Firebase Client SDK

### Profile
- `POST /api/profile` - Create profile
- `GET /api/profile` - Get profile
- `PUT /api/profile` - Update profile

### Resume
- `POST /api/resume/upload` - Upload resume
- `POST /api/resume/analyze` - Analyze resume with AI

### Quiz
- `GET /api/quiz/questions?career=<career>` - Get quiz questions
- `POST /api/quiz/submit` - Submit quiz answers

### Roadmap
- `POST /api/roadmap/generate` - Generate AI roadmap
- `GET /api/roadmap` - Get user roadmap

### Progress
- `GET /api/progress` - Get progress data
- `PUT /api/progress/task` - Update task completion

### Jobs
- `GET /api/jobs/recommendations` - Get job recommendations

## Firestore Collections

- `users/` - User profiles and data
- `roadmaps/` - Generated career roadmaps
- `quizResults/` - Quiz submissions and scores
- `progress/` - User progress tracking
- `jobRecommendations/` - AI-generated job listings

## Environment Variables

### Client
- `VITE_FIREBASE_*` - Firebase configuration
- `VITE_API_URL` - Backend API URL

### Server
- `PORT` - Server port
- `FIREBASE_SERVICE_ACCOUNT_PATH` - Path to service account key
- `FIREBASE_STORAGE_BUCKET` - Firebase storage bucket
- `GEMINI_API_KEY` - Google Gemini API key

## Development

### Run Both Servers

Terminal 1 (Backend):
```bash
cd server
npm run dev
```

Terminal 2 (Frontend):
```bash
cd client
npm run dev
```

## Production Build

### Frontend
```bash
cd client
npm run build
```

### Backend
```bash
cd server
npm start
```

## Security

- JWT token validation on all protected routes
- Firebase Admin SDK for server-side auth
- Secure file uploads to Firebase Storage
- Environment variables for sensitive data

## License

MIT

## Support

For issues and questions, please open an issue on GitHub.
