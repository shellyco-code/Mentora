import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import DashboardLayout from '../components/layout/DashboardLayout'
import { profileAPI, progressAPI, resumeAPI, roadmapAPI, jobsAPI, recommendationsAPI } from '../services/api'

const Dashboard = () => {
  const [profile, setProfile] = useState(null)
  const [progress, setProgress] = useState(null)
  const [resumeAnalysis, setResumeAnalysis] = useState(null)
  const [roadmap, setRoadmap] = useState(null)
  const [jobs, setJobs] = useState([])
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    try {
      const [profileRes, progressRes, jobsRes, coursesRes] = await Promise.all([
        profileAPI.get().catch(() => null),
        progressAPI.get().catch(() => null),
        jobsAPI.getRecommendations().catch(() => ({ data: { jobs: [] } })),
        recommendationsAPI.getLearning().catch(() => ({ data: { courses: [] } }))
      ])

      if (profileRes?.data) setProfile(profileRes.data)
      if (progressRes?.data) setProgress(progressRes.data)
      if (jobsRes?.data?.jobs) setJobs(jobsRes.data.jobs.slice(0, 3))
      if (coursesRes?.data?.courses) setCourses(coursesRes.data.courses.slice(0, 4))

      // Fetch resume analysis (only if user has one)
      try {
        const analysisRes = await resumeAPI.getAnalysis()
        if (analysisRes?.data?.analysis) setResumeAnalysis(analysisRes.data.analysis)
      } catch (e) {
        console.log("Resume analysis fetch skipped or failed", e.message)
      }

      // Fetch roadmap
      try {
        const roadmapRes = await roadmapAPI.get()
        if (roadmapRes?.data?.phases) setRoadmap(roadmapRes.data)
      } catch (e) {
        console.log("Roadmap fetch skipped or failed", e.message)
      }
    } catch (err) {
      console.error("Dashboard fetch error:", err)
    } finally {
      setLoading(false)
    }
  }

  const hasProfile = profile && profile.fullName && profile.targetCareer
  const hasResume = resumeAnalysis && resumeAnalysis.skills && resumeAnalysis.skills.length > 0
  const hasRoadmap = roadmap && roadmap.phases && roadmap.phases.length > 0
  const hasProgress = progress && (progress.totalTasks > 0 || progress.skillScore > 0)
  const quizScore = progress?.skillScore || profile?.lastQuizScore || 0

  if (loading) return (
    <DashboardLayout>
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    </DashboardLayout>
  )

  // Build skill gaps from REAL resume analysis
  const skillGaps = hasResume ? [
    ...(resumeAnalysis.skills || []).slice(0, 2).map((s, i) => ({
      skill: s, current: Math.min(95, (quizScore || 70) + 10 - i * 5), target: 95, status: 'strong'
    })),
    ...(resumeAnalysis.skillGaps || []).slice(0, 3).map((s, i) => ({
      skill: s, current: Math.max(10, (quizScore || 40) - 30 - i * 10), target: 85, status: 'gap'
    }))
  ] : []

  // Build learning path from REAL roadmap phases
  const learningPath = hasRoadmap ? roadmap.phases.slice(0, 3).map((phase, i) => {
    // Determine status based on progress
    let status = 'locked';
    let phaseProgress = 0;
    
    if (i === 0) {
      status = (progress?.overallProgress || 0) >= 100 ? 'completed' : 'in-progress';
      phaseProgress = Math.min(100, progress?.overallProgress || 0);
    } else if (i === 1 && (progress?.overallProgress || 0) >= 100) {
      status = 'in-progress';
      phaseProgress = 0;
    }

    return {
      phase: `Phase ${i + 1}`,
      title: phase.title?.replace(/^Phase \d+:\s*/, '') || phase.title,
      status: status,
      progress: phaseProgress
    };
  }) : []

  // Empty state card component
  const EmptyCard = ({ icon, title, desc, linkTo, linkLabel }) => (
    <div className="card flex flex-col items-center justify-center text-center py-10 px-6 h-full">
      <div className="w-14 h-14 rounded-full bg-gray-900 border border-gray-800 flex items-center justify-center mb-4">
        <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={icon} />
        </svg>
      </div>
      <h3 className="text-sm font-semibold text-gray-400 mb-1">{title}</h3>
      <p className="text-xs text-gray-600 mb-4 max-w-xs">{desc}</p>
      <Link to={linkTo} className="btn-primary text-sm py-2 px-6">{linkLabel}</Link>
    </div>
  )

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              Welcome back, {profile?.fullName?.split(' ')[0] || 'User'}!
            </h1>
            {hasProfile ? (
              <p className="text-sm text-gray-400 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                Tracking your journey to becoming a <span className="text-primary font-medium">{profile.targetCareer}</span>
              </p>
            ) : (
              <p className="text-sm text-gray-500">Complete your profile to unlock personalized career insights</p>
            )}
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center px-4 py-2 bg-gray-900/50 rounded-xl border border-gray-800">
              <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Skill Score</p>
              <p className="text-xl font-bold text-primary">{quizScore}%</p>
            </div>
            <div className="text-center px-4 py-2 bg-gray-900/50 rounded-xl border border-gray-800">
              <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Streak</p>
              <p className="text-xl font-bold text-blue-500">{progress?.streak || 0}d</p>
            </div>
          </div>
        </div>

        {/* Action Needed Banner */}
        {!hasProfile && (
          <div className="card-glow p-6 border border-primary/20 bg-primary/5">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h2 className="text-base font-semibold text-white mb-1">Setup your Career Profile</h2>
                <p className="text-sm text-gray-400 mb-4">We need a few details to build your personalized dashboard and roadmap.</p>
                <div className="flex flex-wrap gap-3">
                  <Link to="/profile" className="btn-primary text-xs py-2 px-4">Complete Profile</Link>
                  <Link to="/resume" className="btn-secondary text-xs py-2 px-4">Upload Resume</Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Top Recommendations Row (Jobs & Courses) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Job Recommendations - 2 cols */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest">Top Job Matches</h2>
              <Link to="/jobs" className="text-xs text-primary hover:underline flex items-center gap-1">
                View All <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </Link>
            </div>
            
            {jobs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {jobs.map((job, i) => (
                  <div key={i} className="card hover:border-primary/30 transition-all group">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-sm font-bold text-white group-hover:text-primary transition-colors truncate pr-2">{job.title}</h3>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">{job.matchScore}% match</span>
                    </div>
                    <p className="text-xs text-gray-500 mb-3">{job.company} • {job.location}</p>
                    <div className="flex flex-wrap gap-1 mb-4">
                      {job.skills?.slice(0, 3).map((s, si) => (
                        <span key={si} className="text-[9px] px-1.5 py-0.5 bg-gray-900 text-gray-400 rounded border border-gray-800">{s}</span>
                      ))}
                    </div>
                    <a href={job.link} target="_blank" rel="noopener noreferrer" className="text-xs text-white font-medium hover:text-primary flex items-center gap-1">
                      Apply Now <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <div className="card py-10 text-center">
                <p className="text-xs text-gray-500">No job matches found yet. Try updating your profile or target career.</p>
              </div>
            )}
          </div>

          {/* Quick Stats/Actions - 1 col */}
          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest">Next Steps</h2>
            <div className="grid grid-cols-1 gap-3">
              {!hasResume && (
                <Link to="/resume" className="flex items-center gap-3 p-3 rounded-xl border border-dashed border-gray-800 hover:border-primary/50 hover:bg-primary/5 transition-all">
                  <div className="w-10 h-10 rounded-lg bg-gray-900 flex items-center justify-center text-primary">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Upload Resume</p>
                    <p className="text-[10px] text-gray-500">Unlock detailed skill gap analysis</p>
                  </div>
                </Link>
              )}
              {quizScore === 0 && (
                <Link to="/quiz" className="flex items-center gap-3 p-3 rounded-xl border border-dashed border-gray-800 hover:border-primary/50 hover:bg-primary/5 transition-all">
                  <div className="w-10 h-10 rounded-lg bg-gray-900 flex items-center justify-center text-primary">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Take Skill Quiz</p>
                    <p className="text-[10px] text-gray-500">Benchmark your technical level</p>
                  </div>
                </Link>
              )}
              <Link to="/roadmap" className="flex items-center gap-3 p-3 rounded-xl border border-gray-900 bg-gray-900/30 hover:border-primary/50 transition-all">
                <div className="w-10 h-10 rounded-lg bg-black flex items-center justify-center text-blue-500">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Daily Learning</p>
                  <p className="text-[10px] text-gray-500">Continue your curated roadmap</p>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Skill Gap Analysis & Learning Resources Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Skill Gap Analysis */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest">Skill Gap Analysis</h2>
              {hasResume && <span className="text-[10px] text-gray-600">Based on REAL Resume data</span>}
            </div>
            {hasResume ? (
              <div className="card space-y-5">
                {skillGaps.map((item, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-300">{item.skill}</span>
                        {item.status === 'strong' ? (
                          <span className="text-[10px] px-1.5 py-0.5 bg-primary/10 text-primary rounded border border-primary/20">Strong</span>
                        ) : (
                          <span className="text-[10px] px-1.5 py-0.5 bg-yellow-900/20 text-yellow-500 rounded border border-yellow-700/30">Gap</span>
                        )}
                      </div>
                      <span className="text-xs text-gray-600">{item.current}% / {item.target}%</span>
                    </div>
                    <div className="relative w-full bg-gray-900 rounded-full h-1.5 overflow-hidden">
                      <div className="absolute h-full bg-gray-800 rounded-full" style={{ width: `${item.target}%` }} />
                      <div
                        className={`absolute h-full rounded-full transition-all duration-1000 ${
                          item.status === 'strong' ? 'bg-primary' : 'bg-yellow-500'
                        }`}
                        style={{ width: `${item.current}%` }}
                      />
                    </div>
                  </div>
                ))}
                <div className="pt-2">
                  <Link to="/resume" className="text-xs text-primary hover:underline flex items-center gap-1">
                    Re-analyze Resume <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                  </Link>
                </div>
              </div>
            ) : (
              <EmptyCard
                icon="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                title="No Analysis Found"
                desc="Upload your resume to see your real skill gaps compared to industry standards."
                linkTo="/resume"
                linkLabel="Upload Resume"
              />
            )}
          </div>

          {/* Recommended Courses */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest">Learning Resources</h2>
              <span className="text-[10px] text-gray-600">Personalized for YOU</span>
            </div>
            {courses.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {courses.map((course, i) => (
                  <a key={i} href={course.link} target="_blank" rel="noopener noreferrer" className="card p-3 hover:border-primary/30 transition-all group flex flex-col">
                    <div className="aspect-video w-full rounded-lg overflow-hidden mb-3 bg-gray-900 relative">
                      {course.thumbnail ? (
                        <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-700 italic text-[10px]">No Thumbnail</div>
                      )}
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-8 h-8 rounded-full bg-primary/80 flex items-center justify-center">
                          <svg className="w-4 h-4 text-black ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                        </div>
                      </div>
                    </div>
                    <h3 className="text-xs font-bold text-gray-200 line-clamp-2 mb-1 group-hover:text-primary transition-colors">{course.title}</h3>
                    <p className="text-[10px] text-gray-500 mt-auto">{course.provider} • {course.skill}</p>
                  </a>
                ))}
              </div>
            ) : (
              <div className="card py-16 text-center">
                <p className="text-xs text-gray-600">Complete a skill test to get course recommendations.</p>
                <Link to="/quiz" className="mt-4 inline-block btn-secondary text-[10px] py-1.5 px-4">Take Quiz</Link>
              </div>
            )}
          </div>
        </div>

        {/* Roadmap Progress Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest">Roadmap Status</h2>
            <Link to="/roadmap" className="text-xs text-primary hover:underline">Full Roadmap</Link>
          </div>
          {hasRoadmap ? (
            <div className="card">
              <div className="flex flex-col md:flex-row gap-6">
                {learningPath.map((item, i) => (
                  <div key={i} className="flex-1 relative">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        item.status === 'completed' ? 'bg-primary/20 border-primary/40 text-primary' :
                        item.status === 'in-progress' ? 'bg-blue-500/20 border-blue-500/40 text-blue-400' :
                        'bg-gray-900 border-gray-800 text-gray-600'
                      }`}>
                        {item.status === 'completed' ? (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        ) : (
                          <span className="text-[10px] font-bold">{i + 1}</span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] text-gray-600 uppercase tracking-wider">{item.phase}</p>
                        <h3 className="text-sm font-semibold text-white truncate">{item.title}</h3>
                      </div>
                    </div>
                    {item.status === 'in-progress' && (
                      <div className="w-full bg-gray-900 rounded-full h-1 mt-1">
                        <div className="h-full bg-blue-500 rounded-full transition-all duration-1000" style={{ width: `${item.progress}%` }} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <EmptyCard
              icon="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
              title="No Roadmap Yet"
              desc="Generate a personalized learning roadmap based on your current level and goals."
              linkTo="/roadmap"
              linkLabel="Generate Roadmap"
            />
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}

export default Dashboard
