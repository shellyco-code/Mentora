import { useState, useEffect } from 'react'
import DashboardLayout from '../components/layout/DashboardLayout'
import { jobsAPI } from '../services/api'

const Jobs = () => {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchJobs() }, [])

  const fetchJobs = async () => {
    try {
      const res = await jobsAPI.getRecommendations()
      setJobs(res.data.jobs || [])
    } catch {}
    finally { setLoading(false) }
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
        <div>
          <h1 className="page-heading">Job Recommendations</h1>
          <p className="page-subheading">AI-matched roles based on your profile and skills</p>
        </div>

        {jobs.length > 0 ? (
          <div className="space-y-4">
            {jobs.map((job, i) => (
              <div key={i} className="card-glow group">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <h2 className="text-base font-semibold text-white group-hover:text-primary transition-colors">{job.title}</h2>
                    <p className="text-sm text-gray-500 mt-0.5">{job.company}</p>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold">
                      {job.matchScore}% match
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 text-xs text-gray-500 mb-3">
                  <span className="flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    {job.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                    {job.type}
                  </span>
                  <span className="flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    {job.salary}
                  </span>
                </div>

                <p className="text-sm text-gray-500 mb-3 leading-relaxed">{job.description}</p>

                <div className="flex flex-wrap gap-1.5 mb-4">
                  {job.skills?.map((skill, si) => (
                    <span key={si} className="badge bg-gray-900 border border-gray-800 text-gray-400">{skill}</span>
                  ))}
                </div>

                <a 
                  href={job.link || `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent((job.title || 'developer') + ' ' + (job.company || ''))}`} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="btn-primary text-sm py-2 px-5 inline-block text-center"
                >
                  Apply Now
                </a>
              </div>
            ))}
          </div>
        ) : (
          <div className="card text-center py-16">
            <div className="w-16 h-16 rounded-full bg-gray-900 border border-gray-800 flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-white mb-2">No Recommendations Yet</h2>
            <p className="text-gray-600 text-sm">Complete your profile and take the quiz to get personalised job matches</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

export default Jobs
