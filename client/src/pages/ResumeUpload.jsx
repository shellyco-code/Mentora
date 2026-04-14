import { useState, useEffect, useCallback } from 'react'
import DashboardLayout from '../components/layout/DashboardLayout'
import { resumeAPI } from '../services/api'

const CACHE_KEYS = {
  analysis: 'mentora_resume_analysis',
  savedInfo: 'mentora_resume_savedInfo'
}

const getCache = (key) => {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

const setCache = (key, value) => {
  try {
    if (value) localStorage.setItem(key, JSON.stringify(value))
    else localStorage.removeItem(key)
  } catch { /* storage full / unavailable */ }
}

const ResumeUpload = () => {
  // Hydrate from localStorage first for instant display
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState(() => getCache(CACHE_KEYS.analysis))
  const [savedInfo, setSavedInfo] = useState(() => getCache(CACHE_KEYS.savedInfo))
  const [loading, setLoading] = useState(() => {
    // If we already have cached data, skip the loading spinner
    return !getCache(CACHE_KEYS.analysis)
  })
  const [message, setMessage] = useState({ text: '', type: '' })
  const [dragOver, setDragOver] = useState(false)

  // Persist analysis & savedInfo to localStorage whenever they change
  useEffect(() => { setCache(CACHE_KEYS.analysis, analysis) }, [analysis])
  useEffect(() => { setCache(CACHE_KEYS.savedInfo, savedInfo) }, [savedInfo])

  const loadSavedAnalysis = useCallback(async () => {
    try {
      const res = await resumeAPI.getAnalysis()
      setAnalysis(res.data.analysis)
      setSavedInfo({
        fileName: res.data.fileName,
        uploadedAt: res.data.uploadedAt,
        analyzedAt: res.data.analyzedAt
      })
    } catch (err) {
      // No saved analysis found on server — keep local cache if present
      console.log('No saved analysis found on server')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // Always refresh from server on mount (updates cache in the background)
    loadSavedAnalysis()
  }, [loadSavedAnalysis])

  const handleFile = (f) => {
    if (f?.type === 'application/pdf') {
      setFile(f)
      setMessage({ text: '', type: '' })
    } else {
      setMessage({ text: 'Please select a PDF file', type: 'error' })
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    handleFile(e.dataTransfer.files[0])
  }

  const handleUpload = async () => {
    if (!file) return
    setUploading(true)
    setMessage({ text: '', type: '' })
    try {
      const formData = new FormData()
      formData.append('resume', file)
      await resumeAPI.upload(formData)
      setMessage({ text: 'Resume uploaded! Analysing...', type: 'success' })
      setAnalyzing(true)
      const res = await resumeAPI.analyze()
      setAnalysis(res.data)
      setSavedInfo({
        fileName: file.name,
        uploadedAt: new Date().toISOString(),
        analyzedAt: new Date().toISOString()
      })
      setFile(null)
      setMessage({ text: 'Analysis complete!', type: 'success' })
    } catch (err) {
      setMessage({ text: err?.response?.data?.error || 'Upload failed. Please try again.', type: 'error' })
    } finally {
      setUploading(false)
      setAnalyzing(false)
    }
  }

  const handleReanalyze = async () => {
    setAnalyzing(true)
    setMessage({ text: '', type: '' })
    try {
      const res = await resumeAPI.analyze()
      setAnalysis(res.data)
      setSavedInfo(prev => ({ ...prev, analyzedAt: new Date().toISOString() }))
      setMessage({ text: 'Re-analysis complete!', type: 'success' })
    } catch (err) {
      setMessage({ text: err?.response?.data?.error || 'Re-analysis failed. Please try again.', type: 'error' })
    } finally {
      setAnalyzing(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="max-w-3xl space-y-6">
        <div>
          <h1 className="page-heading">Resume Analysis</h1>
          <p className="page-subheading">Upload your resume for AI-powered insights and skill gap analysis</p>
        </div>

        {message.text && (
          <div className={`p-3 rounded-lg border text-sm ${
            message.type === 'success'
              ? 'bg-primary/10 border-primary/30 text-primary'
              : 'bg-red-900/20 border-red-700/40 text-red-400'
          }`}>
            {message.text}
          </div>
        )}

        {/* Saved Resume Info */}
        {savedInfo && analysis && (
          <div className="card border border-primary/20 bg-primary/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-white font-medium text-sm">{savedInfo.fileName}</p>
                  <p className="text-gray-500 text-xs">
                    Uploaded {new Date(savedInfo.uploadedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <button onClick={handleReanalyze} disabled={analyzing}
                className="btn-secondary text-sm py-2 px-4 disabled:opacity-50 flex items-center gap-2">
                {analyzing && <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />}
                {analyzing ? 'Re-analyzing...' : 'Re-analyze'}
              </button>
            </div>
          </div>
        )}

        {/* Drop zone - only show if no saved analysis */}
        {!analysis && <div
          onDragOver={e => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`card border-2 border-dashed transition-colors ${
            dragOver ? 'border-primary/60 bg-primary/5' : 'border-gray-800 hover:border-gray-700'
          }`}
        >
          <div className="text-center py-8">
            <div className="w-14 h-14 rounded-full bg-gray-900 border border-gray-800 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-white font-medium mb-1">Drop your resume here</p>
            <p className="text-gray-600 text-sm mb-4">PDF format only · Max 10MB</p>

            <input type="file" accept=".pdf" onChange={e => handleFile(e.target.files[0])}
              className="hidden" id="resume-upload" />
            <label htmlFor="resume-upload" className="btn-secondary cursor-pointer inline-block text-sm py-2 px-5">
              Browse File
            </label>

            {file && (
              <div className="mt-4 flex items-center justify-center gap-2 text-sm text-primary">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {file.name}
              </div>
            )}
          </div>
        </div>}

        {file && !analysis && (
          <button onClick={handleUpload} disabled={uploading || analyzing}
            className="btn-primary w-full disabled:opacity-50 flex items-center justify-center gap-2">
            {(uploading || analyzing) && <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />}
            {uploading ? 'Uploading...' : analyzing ? 'Analysing with AI...' : 'Upload & Analyse'}
          </button>
        )}

        {/* Upload New Resume Button - show if analysis exists */}
        {analysis && !file && (
          <button onClick={() => document.getElementById('resume-upload-new').click()}
            className="btn-secondary w-full flex items-center justify-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Upload New Resume
          </button>
        )}
        <input type="file" accept=".pdf" onChange={e => handleFile(e.target.files[0])}
          className="hidden" id="resume-upload-new" />

        {/* Analysis Results */}
        {analysis && (
          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest">Analysis Results</h2>

            <div className="card" style={{ background: 'linear-gradient(135deg, rgba(0,255,204,0.04), transparent)' }}>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">Summary</h3>
              <p className="text-gray-300 text-sm leading-relaxed">{analysis.summary}</p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="card">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">Identified Skills</h3>
                <div className="flex flex-wrap gap-1.5">
                  {analysis.skills?.map((s, i) => (
                    <span key={i} className="badge bg-primary/10 border border-primary/20 text-primary">{s}</span>
                  ))}
                </div>
              </div>
              <div className="card">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">Skill Gaps</h3>
                <ul className="space-y-1.5">
                  {analysis.skillGaps?.map((g, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-400">
                      <span className="text-yellow-500 mt-0.5 flex-shrink-0">→</span> {g}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="card">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">Recommendations</h3>
              <ul className="space-y-2">
                {analysis.recommendations?.map((r, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                    <span className="text-primary mt-0.5 flex-shrink-0">✓</span> {r}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

export default ResumeUpload
