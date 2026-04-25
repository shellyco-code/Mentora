import { useState, useEffect } from 'react'
import DashboardLayout from '../components/layout/DashboardLayout'
import { quizAPI, profileAPI } from '../services/api'

const MAX_CLIENT_RETRIES = 2
const RETRY_DELAY_MS = 1500

const Quiz = () => {
  const [questions, setQuestions] = useState([])
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [career, setCareer] = useState('Full Stack Developer')
  const [retryCount, setRetryCount] = useState(0)
  const [currentDifficulty, setCurrentDifficulty] = useState('intermediate')

  useEffect(() => { fetchQuestions() }, [])

  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

  const fetchQuestions = async (retries = 0) => {
    setLoading(true)
    setError(null)
    setRetryCount(retries)
    setQuestions([])
    setResult(null)
    setCurrent(0)
    setAnswers({})
    try {
      // get career from profile, fall back gracefully
      let targetCareer = 'Full Stack Developer'
      try {
        const profileRes = await profileAPI.get()
        if (profileRes.data?.targetCareer) {
          targetCareer = profileRes.data.targetCareer
        }
      } catch {
        // profile not set — use default career
      }
      setCareer(targetCareer)

      const res = await quizAPI.getQuestions(targetCareer)
      const qs = res.data?.questions
      const diff = res.data?.difficulty || 'intermediate'

      if (!qs || !Array.isArray(qs) || qs.length === 0) {
        throw new Error('No questions returned from server')
      }
      setQuestions(qs)
      setCurrentDifficulty(diff)
    } catch (err) {
      console.error(`Quiz load error (attempt ${retries + 1}):`, err)

      // Auto-retry before showing error
      if (retries < MAX_CLIENT_RETRIES) {
        setRetryCount(retries + 1)
        await delay(RETRY_DELAY_MS)
        return fetchQuestions(retries + 1)
      }

      setError(err.response?.data?.error || err.message || 'Failed to load questions. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleAnswer = (qId, answer) => setAnswers(prev => ({ ...prev, [qId]: answer }))

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      const res = await quizAPI.submit({ answers, questions })
      setResult(res.data)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit quiz. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  // ── Loading ──────────────────────────────────────────────────────
  if (loading) return (
    <DashboardLayout>
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-500">
          {retryCount > 0
            ? `Retrying... (attempt ${retryCount + 1})`
            : `Generating questions for ${career}...`}
        </p>
      </div>
    </DashboardLayout>
  )

  // ── Error (no questions loaded) ──────────────────────────────────
  if (error && questions.length === 0) return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-4">
        <div>
          <h1 className="page-heading">Skill Assessment</h1>
          <p className="page-subheading">Answer all questions to get your personalised roadmap</p>
        </div>
        <div className="card text-center py-12">
          <div className="w-14 h-14 rounded-full bg-red-900/20 border border-red-700/30 flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-white font-medium mb-1">Failed to load questions</p>
          <p className="text-sm text-gray-500 mb-6">{error}</p>
          <button onClick={() => fetchQuestions(0)} className="btn-primary">
            Try Again
          </button>
        </div>
      </div>
    </DashboardLayout>
  )

  // ── Results ──────────────────────────────────────────────────────
  if (result) return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-4">
        <h1 className="page-heading">Quiz Results</h1>

        <div className="card text-center py-8" style={{ background: 'linear-gradient(135deg, rgba(0,255,204,0.05), transparent)' }}>
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full border-4 border-primary/40 mb-4">
            <span className="text-3xl font-bold text-primary">{result.score}%</span>
          </div>
          <p className="text-white font-semibold text-lg">Quiz Complete</p>
          <div className="flex items-center justify-center gap-2 mt-1">
            <p className="text-gray-500 text-sm">{career}</p>
            <span className="w-1 h-1 rounded-full bg-gray-700" />
            <p className="text-primary text-sm font-medium capitalize">{currentDifficulty} Level</p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="card">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">Strengths</h3>
            <ul className="space-y-2">
              {result.strengths?.map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                  <span className="text-primary mt-0.5 flex-shrink-0">✓</span> {s}
                </li>
              ))}
            </ul>
          </div>
          <div className="card">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">Areas to Improve</h3>
            <ul className="space-y-2">
              {result.weaknesses?.map((w, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                  <span className="text-yellow-500 mt-0.5 flex-shrink-0">→</span> {w}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {result.recommendations?.length > 0 && (
          <div className="card">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">Recommendations</h3>
            <ul className="space-y-2">
              {result.recommendations.map((r, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                  <span className="text-primary/60 mt-0.5 flex-shrink-0">•</span> {r}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex gap-3">
          <button onClick={() => fetchQuestions(0)} className="btn-secondary flex-1 text-sm">
            {result.score > 80 ? 'Level Up: Next Challenge 🚀' : 
             result.score > 40 ? 'Improve Your Score 📈' : 'Retry Basics 🔄'}
          </button>
          <a href="/roadmap" className="btn-primary flex-1 text-sm text-center">
            View Roadmap →
          </a>
        </div>
      </div>
    </DashboardLayout>
  )

  // ── Quiz ─────────────────────────────────────────────────────────
  const q = questions[current]
  const progressPct = questions.length > 0 ? ((current + 1) / questions.length) * 100 : 0
  const allAnswered = questions.length > 0 && Object.keys(answers).length === questions.length

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-4">
        <div>
          <h1 className="page-heading">Skill Assessment</h1>
          <p className="page-subheading">Answer all questions to get your personalised roadmap</p>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-900/20 border border-red-700/40 text-red-400 text-sm">{error}</div>
        )}

        <div className="card">
          {/* Progress */}
          <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
            <span>Question {current + 1} of {questions.length}</span>
            <span>{Math.round(progressPct)}% complete</span>
          </div>
          <div className="w-full bg-gray-900 rounded-full h-1 mb-6">
            <div className="h-1 rounded-full bg-primary transition-all duration-300"
              style={{ width: `${progressPct}%` }} />
          </div>

          {/* Topic badge */}
          {q?.topic && (
            <span className="badge bg-primary/10 border border-primary/20 text-primary text-xs mb-3 inline-block">
              {q.topic}
            </span>
          )}

          <h2 className="text-base font-semibold text-white mb-4 leading-relaxed">{q?.question}</h2>

          <div className="space-y-2">
            {q?.options?.map((opt, i) => {
              const selected = answers[q.id] === opt
              return (
                <button key={i} onClick={() => handleAnswer(q.id, opt)}
                  className={`w-full text-left px-4 py-3 rounded-lg border text-sm transition-all ${selected
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-gray-800 text-gray-300 hover:border-gray-700 hover:bg-gray-900'
                    }`}>
                  <span className="font-mono text-xs mr-3 opacity-50">{String.fromCharCode(65 + i)}.</span>
                  {opt}
                </button>
              )
            })}
          </div>

          <div className="flex justify-between mt-6">
            <button onClick={() => setCurrent(c => c - 1)} disabled={current === 0}
              className="btn-secondary disabled:opacity-30 text-sm py-2 px-4">
              ← Previous
            </button>

            {current === questions.length - 1 ? (
              <button onClick={handleSubmit}
                disabled={submitting || !allAnswered}
                className="btn-primary disabled:opacity-50 text-sm flex items-center gap-2">
                {submitting && <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />}
                {submitting ? 'Submitting...' : `Submit Quiz (${Object.keys(answers).length}/${questions.length})`}
              </button>
            ) : (
              <button onClick={() => setCurrent(c => c + 1)} className="btn-primary text-sm py-2 px-4">
                Next →
              </button>
            )}
          </div>
        </div>

        {/* Answer progress dots */}
        <div className="flex flex-wrap gap-1.5 justify-center">
          {questions.map((q, i) => (
            <button key={i} onClick={() => setCurrent(i)}
              className={`w-6 h-6 rounded text-xs font-medium transition-all ${i === current
                ? 'bg-primary text-black'
                : answers[q.id]
                  ? 'bg-primary/20 border border-primary/30 text-primary'
                  : 'bg-gray-900 border border-gray-800 text-gray-600'
                }`}>
              {i + 1}
            </button>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}

export default Quiz
