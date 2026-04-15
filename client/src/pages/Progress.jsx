import { useState, useEffect } from 'react'
import DashboardLayout from '../components/layout/DashboardLayout'
import { progressAPI } from '../services/api'

const FILTERS = ['All Tasks', 'Today', 'Pending', 'Completed', 'Learning', 'Practice', 'Project']

const priorityStyle = {
  high:   'bg-red-900/30 border border-red-700/40 text-red-400',
  medium: 'bg-yellow-900/30 border border-yellow-700/40 text-yellow-400',
  low:    'bg-gray-900 border border-gray-800 text-gray-500',
}

const typeIcon = {
  Learning: (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  ),
  Practice: (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
    </svg>
  ),
  Project: (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
    </svg>
  ),
  Reading: (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
}

const Progress = () => {
  const [progress, setProgress] = useState(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState(null)
  const [activeFilter, setActiveFilter] = useState('All Tasks')

  useEffect(() => { fetchProgress() }, [])

  const fetchProgress = async () => {
    try {
      const res = await progressAPI.get()
      setProgress(res.data)
    } catch {}
    finally { setLoading(false) }
  }

  const handleGenerate = async () => {
    setGenerating(true)
    setError(null)
    try {
      const res = await progressAPI.generate()
      setProgress(res.data)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to generate tasks. Please try again.')
    } finally {
      setGenerating(false)
    }
  }

  const handleToggle = async (taskId, completed) => {
    // Optimistic update
    setProgress(prev => {
      const updatedTasks = prev.dailyTasks.map(t => t.id === taskId ? { ...t, completed } : t)
      const completedCount = updatedTasks.filter(t => t.completed).length
      return {
        ...prev,
        dailyTasks: updatedTasks,
        completedTasks: completedCount,
        overallProgress: Math.round((completedCount / updatedTasks.length) * 100)
      }
    })
    try {
      await progressAPI.update(taskId, completed)
    } catch {
      fetchProgress() // revert on failure
    }
  }

  const tasks = progress?.dailyTasks || []

  const filteredTasks = tasks.filter(t => {
    if (activeFilter === 'All Tasks') return true
    if (activeFilter === 'Completed') return t.completed
    if (activeFilter === 'Pending') return !t.completed
    if (activeFilter === 'Today') return true
    return t.type === activeFilter
  })

  const completedToday = tasks.filter(t => t.completed).length
  const todayProgress = tasks.length > 0 ? Math.round((completedToday / tasks.length) * 100) : 0

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
        <div className="flex items-start justify-between">
          <div>
            <h1 className="page-heading">Daily Tasks</h1>
            <p className="page-subheading">Manage your daily learning and practice tasks</p>
          </div>
          <button onClick={handleGenerate} disabled={generating}
            className="btn-primary disabled:opacity-50 flex items-center gap-2 text-sm">
            {generating
              ? <><div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" /> Generating...</>
              : <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg> Generate Tasks</>
            }
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-900/20 border border-red-700/40 text-red-400 text-sm">{error}</div>
        )}

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="card">
            <p className="text-xs text-gray-600 mb-1">Today's Progress</p>
            <p className="text-2xl font-bold text-white">{todayProgress}%</p>
            <div className="w-full bg-gray-900 rounded-full h-1 mt-2">
              <div className="h-1 rounded-full bg-primary transition-all duration-700"
                style={{ width: `${todayProgress}%` }} />
            </div>
          </div>
          <div className="card">
            <p className="text-xs text-gray-600 mb-1">Tasks Completed</p>
            <p className="text-2xl font-bold text-white">{completedToday} <span className="text-base text-gray-600">/ {tasks.length}</span></p>
            <p className="text-xs text-gray-600 mt-1">Overall completion</p>
          </div>
          <div className="card">
            <p className="text-xs text-gray-600 mb-1">Today's Tasks</p>
            <p className="text-2xl font-bold text-white">{tasks.length}</p>
            {completedToday > 0 && (
              <p className="text-xs text-primary mt-1">{completedToday} completed</p>
            )}
          </div>
          <div className="card">
            <p className="text-xs text-gray-600 mb-1">Current Streak</p>
            <p className="text-2xl font-bold text-white">{progress?.streak || 0}</p>
            <p className="text-xs text-gray-600 mt-1">days</p>
          </div>
        </div>

        {/* Tasks Card */}
        <div className="card">
          {/* Filter tabs */}
          <div className="flex flex-wrap gap-1.5 mb-5">
            {FILTERS.map(f => (
              <button key={f} onClick={() => setActiveFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeFilter === f
                    ? 'bg-primary text-black'
                    : 'bg-gray-900 border border-gray-800 text-gray-400 hover:border-gray-700 hover:text-gray-300'
                }`}>
                {f}
              </button>
            ))}
          </div>

          {/* Task list */}
          {filteredTasks.length > 0 ? (
            <div className="space-y-2">
              {filteredTasks.map(task => (
                <div key={task.id}
                  className={`flex items-center gap-4 p-4 rounded-lg border transition-all cursor-pointer group ${
                    task.completed
                      ? 'border-gray-900 bg-black/40'
                      : 'border-gray-900 hover:border-gray-700 bg-black/20'
                  }`}
                  onClick={() => handleToggle(task.id, !task.completed)}
                >
                  {/* Checkbox */}
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                    task.completed
                      ? 'bg-primary border-primary'
                      : 'border-gray-700 group-hover:border-primary/50'
                  }`}>
                    {task.completed && (
                      <svg className="w-3 h-3 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${task.completed ? 'line-through text-gray-600' : 'text-gray-200'}`}>
                      {task.title}
                    </p>
                    {task.description && (
                      <p className="text-xs text-gray-600 mt-0.5 truncate">{task.description}</p>
                    )}
                    <div className="flex items-center gap-3 mt-1.5">
                      {/* Type */}
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        {typeIcon[task.type] || typeIcon.Learning}
                        {task.type}
                      </span>
                      {/* Duration */}
                      {task.duration && (
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {task.duration}
                        </span>
                      )}
                      {/* Date */}
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Today
                      </span>
                    </div>
                  </div>

                  {/* Priority badge */}
                  {task.priority && (
                    <span className={`badge text-xs px-2 py-0.5 flex-shrink-0 ${priorityStyle[task.priority] || priorityStyle.low}`}>
                      {task.priority}
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : tasks.length === 0 ? (
            /* No tasks generated yet */
            <div className="text-center py-14">
              <div className="w-14 h-14 rounded-full bg-gray-900 border border-gray-800 flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <p className="text-white font-medium mb-1">No tasks yet</p>
              <p className="text-sm text-gray-600 mb-5">
                Generate AI-powered daily tasks based on your profile and quiz results
              </p>
              <button onClick={handleGenerate} disabled={generating} className="btn-primary disabled:opacity-50">
                {generating ? 'Generating...' : 'Generate Daily Tasks'}
              </button>
            </div>
          ) : (
            /* Filter returned nothing */
            <div className="text-center py-10">
              <p className="text-sm text-gray-600">No tasks match this filter</p>
            </div>
          )}
        </div>

      </div>
    </DashboardLayout>
  )
}

export default Progress
