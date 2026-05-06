import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import DashboardLayout from '../components/layout/DashboardLayout'
import { profileAPI, progressAPI } from '../services/api'

const Dashboard = () => {
  const [profile, setProfile] = useState(null)
  const [progress, setProgress] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedPath, setSelectedPath] = useState(null)

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    try {
      const [profileRes, progressRes] = await Promise.all([profileAPI.get(), progressAPI.get()])
      setProfile(profileRes.data)
      setProgress(progressRes.data)
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

  const careerPaths = [
    { 
      title: 'Frontend Developer', 
      match: 85, 
      skills: ['React', 'TypeScript', 'CSS', 'Git'],
      desc: 'Build modern user interfaces',
      details: {
        overview: 'Frontend developers create the visual and interactive elements of websites and web applications that users engage with directly.',
        responsibilities: [
          'Build responsive and accessible user interfaces',
          'Implement designs using HTML, CSS, and JavaScript',
          'Optimize application performance and user experience',
          'Collaborate with designers and backend developers'
        ],
        salary: '$70k - $120k per year',
        demand: 'High',
        learningPath: ['HTML/CSS Basics', 'JavaScript ES6+', 'React/Vue', 'TypeScript', 'Testing & Deployment']
      }
    },
    { 
      title: 'Full Stack Developer', 
      match: 72, 
      skills: ['Node.js', 'MongoDB', 'React', 'APIs'],
      desc: 'End-to-end web development',
      details: {
        overview: 'Full stack developers work on both frontend and backend, handling everything from databases to user interfaces.',
        responsibilities: [
          'Design and develop complete web applications',
          'Build RESTful APIs and microservices',
          'Manage databases and server infrastructure',
          'Implement authentication and security measures'
        ],
        salary: '$80k - $140k per year',
        demand: 'Very High',
        learningPath: ['Frontend Basics', 'Backend with Node.js', 'Database Design', 'API Development', 'DevOps Basics']
      }
    },
    { 
      title: 'UI/UX Designer', 
      match: 68, 
      skills: ['Figma', 'Design Systems', 'Prototyping'],
      desc: 'Create beautiful experiences',
      details: {
        overview: 'UI/UX designers focus on creating intuitive and visually appealing user experiences through research and design.',
        responsibilities: [
          'Conduct user research and usability testing',
          'Create wireframes, prototypes, and mockups',
          'Design user interfaces and interaction patterns',
          'Maintain design systems and style guides'
        ],
        salary: '$65k - $110k per year',
        demand: 'High',
        learningPath: ['Design Principles', 'Figma/Sketch', 'User Research', 'Prototyping', 'Design Systems']
      }
    },
  ]

  const skillGaps = [
    { skill: 'React', current: 85, target: 90, status: 'strong' },
    { skill: 'TypeScript', current: 70, target: 85, status: 'learning' },
    { skill: 'Node.js', current: 45, target: 80, status: 'gap' },
    { skill: 'System Design', current: 30, target: 75, status: 'gap' },
  ]

  const learningPath = [
    { phase: 'Beginner', title: 'HTML, CSS, JavaScript Basics', status: 'completed', progress: 100 },
    { phase: 'Intermediate', title: 'React & Modern Frontend', status: 'in-progress', progress: 65 },
    { phase: 'Advanced', title: 'TypeScript & State Management', status: 'locked', progress: 0 },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">
              Welcome back, {profile?.fullName?.split(' ')[0] || 'User'}!
            </h1>
            <p className="text-sm text-gray-500 flex items-center gap-2">
              <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              You're {progress?.overallProgress || 60}% ready for {profile?.targetCareer || 'Frontend Developer'} role
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-600 uppercase tracking-widest mb-1">Current Streak</p>
            <p className="text-3xl font-bold text-primary">{progress?.streak || 0} days</p>
          </div>
        </div>

        {/* Recommended Career Paths */}
        <div>
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-3">Recommended Career Paths</h2>
          <div className="grid lg:grid-cols-3 gap-4">
            {careerPaths.map((path, i) => (
              <div key={i} className="card-glow group relative overflow-hidden">
                <div className="absolute top-3 right-3">
                  <div className="w-12 h-12 rounded-full border-2 border-primary/30 flex items-center justify-center">
                    <span className="text-sm font-bold text-primary">{path.match}%</span>
                  </div>
                </div>
                <h3 className="text-base font-semibold text-white mb-1 pr-16">{path.title}</h3>
                <p className="text-xs text-gray-600 mb-3">{path.desc}</p>
                <div className="mb-4">
                  <p className="text-xs text-gray-600 mb-2">Key Skills Required:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {path.skills.map((s, si) => (
                      <span key={si} className="badge bg-gray-900 border border-gray-800 text-gray-400 text-xs">{s}</span>
                    ))}
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedPath(path)}
                  className="w-full py-2 px-4 rounded-lg border border-gray-800 text-gray-400 text-sm font-medium hover:border-primary/30 hover:text-primary transition-colors group-hover:border-primary/30">
                  View Details →
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid lg:grid-cols-3 gap-4">
          {/* Skill Gap Analysis - 2 cols */}
          <div className="lg:col-span-2 card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest">Skill Gap Analysis</h2>
              <span className="text-xs text-gray-600">Current skills vs. {profile?.targetCareer || 'Frontend Developer'} requirements</span>
            </div>
            <div className="space-y-4">
              {skillGaps.map((item, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-300">{item.skill}</span>
                      {item.status === 'strong' && (
                        <span className="badge bg-primary/10 border border-primary/20 text-primary text-xs">Strong</span>
                      )}
                      {item.status === 'learning' && (
                        <span className="badge bg-blue-900/20 border border-blue-700/30 text-blue-400 text-xs">Learning</span>
                      )}
                      {item.status === 'gap' && (
                        <span className="badge bg-yellow-900/20 border border-yellow-700/30 text-yellow-400 text-xs">Gap</span>
                      )}
                    </div>
                    <span className="text-xs text-gray-600">{item.current}% / {item.target}%</span>
                  </div>
                  <div className="relative w-full bg-gray-900 rounded-full h-2">
                    <div className="absolute h-2 rounded-full bg-gray-800" style={{ width: `${item.target}%` }} />
                    <div 
                      className={`absolute h-2 rounded-full transition-all duration-700 ${
                        item.status === 'strong' ? 'bg-primary' : item.status === 'learning' ? 'bg-blue-500' : 'bg-yellow-500'
                      }`}
                      style={{ width: `${item.current}%` }}
                    />
                  </div>
                  {item.status === 'gap' && (
                    <p className="text-xs text-gray-600 mt-1.5">
                      <span className="text-yellow-500">→</span> Suggested: Complete {item.skill} fundamentals course
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Personalized Roadmap - 1 col */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest">Personalized Roadmap</h2>
              <Link to="/roadmap" className="text-xs text-primary hover:underline">View All</Link>
            </div>
            <p className="text-xs text-gray-600 mb-4">Your path to {profile?.targetCareer || 'Frontend Developer'}</p>
            <div className="space-y-3">
              {learningPath.map((item, i) => (
                <div key={i} className="relative">
                  {i < learningPath.length - 1 && (
                    <div className="absolute left-4 top-10 w-0.5 h-full bg-gray-900" />
                  )}
                  <div className="flex items-start gap-3">
                    <div className={`relative z-10 w-8 h-8 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      item.status === 'completed' 
                        ? 'bg-primary/10 border-primary/40' 
                        : item.status === 'in-progress'
                        ? 'bg-blue-900/20 border-blue-700/40'
                        : 'bg-gray-900 border-gray-800'
                    }`}>
                      {item.status === 'completed' ? (
                        <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : item.status === 'in-progress' ? (
                        <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                      ) : (
                        <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="badge bg-gray-900 border border-gray-800 text-gray-500 text-xs">{item.phase}</span>
                        {item.status === 'in-progress' && (
                          <span className="text-xs text-blue-400">{item.progress}%</span>
                        )}
                      </div>
                      <p className={`text-sm font-medium ${
                        item.status === 'completed' ? 'text-gray-500 line-through' : 'text-gray-300'
                      }`}>
                        {item.title}
                      </p>
                      {item.status === 'in-progress' && (
                        <div className="w-full bg-gray-900 rounded-full h-1 mt-2">
                          <div className="h-1 rounded-full bg-blue-500 transition-all duration-700" style={{ width: `${item.progress}%` }} />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Link to="/roadmap" className="mt-4 w-full btn-secondary text-sm py-2 flex items-center justify-center gap-2">
              Continue Learning
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Bottom Grid */}
        <div className="grid lg:grid-cols-2 gap-4">
          {/* Quick Actions */}
          <div className="card">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                { to: '/resume', label: 'Upload Resume', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
                { to: '/quiz', label: 'Take Quiz', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
                { to: '/roadmap', label: 'View Roadmap', icon: 'M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7' },
                { to: '/jobs', label: 'Find Jobs', icon: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
              ].map((action, i) => (
                <Link key={i} to={action.to} className="flex flex-col items-center justify-center p-4 rounded-lg border border-gray-900 hover:border-primary/30 hover:bg-primary/5 transition-all group">
                  <div className="w-10 h-10 rounded-lg bg-gray-900 border border-gray-800 flex items-center justify-center mb-2 group-hover:border-primary/30 transition-colors">
                    <svg className="w-5 h-5 text-gray-500 group-hover:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={action.icon} />
                    </svg>
                  </div>
                  <span className="text-xs font-medium text-gray-400 group-hover:text-primary transition-colors text-center">{action.label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Progress Stats */}
          <div className="card">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-4">Your Progress</h2>
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Skill Score', value: `${progress?.skillScore || 75}%`, color: 'primary' },
                { label: 'Tasks Done', value: `${progress?.completedTasks || 12}/${progress?.totalTasks || 20}`, color: 'blue' },
                { label: 'Hours Learned', value: '48h', color: 'purple' },
              ].map((stat, i) => (
                <div key={i} className="text-center p-3 rounded-lg bg-black border border-gray-900">
                  <p className={`text-2xl font-bold ${stat.color === 'primary' ? 'text-primary' : stat.color === 'blue' ? 'text-blue-500' : 'text-purple-500'}`}>
                    {stat.value}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 rounded-lg bg-primary/5 border border-primary/20">
              <div className="flex items-start gap-2">
                <svg className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-xs font-medium text-primary mb-0.5">AI Insight</p>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    You're making great progress! Focus on TypeScript and System Design to reach your goal faster.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Career Path Detail Modal */}
        {selectedPath && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/70 backdrop-blur-sm"
            onClick={() => setSelectedPath(null)}>
            <div className="bg-gray-950 border border-gray-800 rounded-xl w-full max-w-lg p-6 space-y-5"
              onClick={e => e.stopPropagation()}>

              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h2 className="text-lg font-bold text-white">{selectedPath.title}</h2>
                    <span className="badge bg-primary/10 border border-primary/20 text-primary text-xs font-semibold">
                      {selectedPath.match}% match
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">{selectedPath.desc}</p>
                </div>
                <button onClick={() => setSelectedPath(null)}
                  className="text-gray-600 hover:text-white transition-colors p-1">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Overview */}
              <div className="p-3 rounded-lg bg-black border border-gray-900">
                <p className="text-xs text-gray-500 leading-relaxed">{selectedPath.details.overview}</p>
              </div>

              {/* Meta */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-black border border-gray-900">
                  <p className="text-xs text-gray-600 mb-1">Avg. Salary</p>
                  <p className="text-sm font-semibold text-primary">{selectedPath.details.salary}</p>
                </div>
                <div className="p-3 rounded-lg bg-black border border-gray-900">
                  <p className="text-xs text-gray-600 mb-1">Market Demand</p>
                  <p className="text-sm font-semibold text-white">{selectedPath.details.demand}</p>
                </div>
              </div>

              {/* Responsibilities */}
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">Key Responsibilities</p>
                <ul className="space-y-1.5">
                  {selectedPath.details.responsibilities.map((r, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-400">
                      <span className="text-primary mt-0.5 flex-shrink-0">→</span> {r}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Learning Path */}
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">Learning Path</p>
                <div className="flex flex-wrap gap-2">
                  {selectedPath.details.learningPath.map((step, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <span className="badge bg-gray-900 border border-gray-800 text-gray-400">{step}</span>
                      {i < selectedPath.details.learningPath.length - 1 && (
                        <span className="text-gray-700 text-xs">→</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-1">
                <Link to="/roadmap" onClick={() => setSelectedPath(null)}
                  className="flex-1 btn-primary text-sm py-2.5 text-center">
                  Generate Roadmap
                </Link>
                <button onClick={() => setSelectedPath(null)}
                  className="flex-1 btn-secondary text-sm py-2.5">
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

export default Dashboard
