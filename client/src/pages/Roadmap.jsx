import { useState, useEffect } from 'react'
import DashboardLayout from '../components/layout/DashboardLayout'
import { roadmapAPI } from '../services/api'

const Roadmap = () => {
  const [roadmap, setRoadmap] = useState(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => { fetchRoadmap() }, [])

  const fetchRoadmap = async () => {
    try {
      const res = await roadmapAPI.get()
      setRoadmap(res.data)
    } catch (err) {
      if (err.response?.status !== 404) console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleGenerate = async () => {
    setGenerating(true)
    setError(null)
    try {
      const res = await roadmapAPI.generate()
      setRoadmap(res.data)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to generate roadmap. Please try again.')
    } finally {
      setGenerating(false)
    }
  }

  if (loading) return (
    <DashboardLayout>
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    </DashboardLayout>
  )

  return (
    <DashboardLayout>
      <div className="max-w-4xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-heading">Career Roadmap</h1>
            <p className="page-subheading">Your personalised step-by-step learning path</p>
          </div>
          <button onClick={handleGenerate} disabled={generating}
            className="btn-primary disabled:opacity-50 flex items-center gap-2 text-sm">
            {generating ? (
              <><div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" /> Generating...</>
            ) : (
              <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg> Regenerate</>
            )}
          </button>
        </div>

        {error && (
          <div className="p-4 rounded-lg bg-red-900/20 border border-red-700/40 text-red-400 text-sm">{error}</div>
        )}

        {!roadmap ? (
          <div className="card text-center py-16">
            <div className="w-16 h-16 rounded-full bg-gray-900 border border-gray-800 flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-white mb-2">No Roadmap Yet</h2>
            <p className="text-gray-600 text-sm mb-6">Generate your personalised career roadmap based on your profile</p>
            <button onClick={handleGenerate} disabled={generating} className="btn-primary disabled:opacity-50">
              {generating ? 'Generating...' : 'Generate Roadmap'}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Title card */}
            <div className="card border-primary/20" style={{ background: 'linear-gradient(135deg, rgba(0,255,204,0.05), transparent)' }}>
              <h2 className="text-xl font-bold text-white mb-1">{roadmap.title}</h2>
              <p className="text-gray-400 text-sm">{roadmap.description}</p>
            </div>

            {/* Phases */}
            {roadmap.phases?.map((phase, pi) => (
              <div key={pi} className="card-glow">
                <div className="flex items-start gap-4">
                  {/* Phase number */}
                  <div className="flex-shrink-0 w-10 h-10 rounded-full border border-primary/40 bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                    {pi + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-base font-semibold text-white">{phase.title}</h3>
                      <span className="badge bg-gray-900 border border-gray-800 text-gray-500 text-xs">{phase.duration}</span>
                    </div>
                    <div className="space-y-2 mt-3">
                      {phase.tasks?.map((task, ti) => (
                        <div key={ti} className="flex items-start gap-3 p-3 rounded-lg bg-black border border-gray-900 hover:border-gray-800 transition-colors">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium text-gray-200">{task.title}</p>
                            <p className="text-xs text-gray-600 mt-0.5">{task.description}</p>
                            {task.resources?.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 mt-2">
                                {task.resources.map((r, ri) => {
                                  // Support both formats: string (old) and object with name+url (new)
                                  const isObj = typeof r === 'object' && r !== null
                                  const label = isObj ? r.name : r
                                  const url = isObj ? r.url : `https://www.google.com/search?q=${encodeURIComponent(r + ' tutorial')}`
                                  return (
                                    <a
                                      key={ri}
                                      href={url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 hover:border-primary/40 transition-all cursor-pointer"
                                    >
                                      <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                      </svg>
                                      {label}
                                    </a>
                                  )
                                })}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

export default Roadmap
