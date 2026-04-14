import { useState, useEffect } from 'react'
import DashboardLayout from '../components/layout/DashboardLayout'
import { profileAPI } from '../services/api'

const ROLES = [
  'Full Stack Developer', 'Frontend Developer', 'Backend Developer',
  'Data Scientist', 'DevOps Engineer', 'Mobile Developer', 'UI/UX Designer',
  'Machine Learning Engineer', 'Cloud Engineer', 'Cybersecurity Analyst'
]
const EXP_OPTIONS = ['< 1 Year', '1 Year', '2 Years', '3 Years', '4 Years', '5+ Years']
const PRONOUNS = ['He / Him', 'She / Her', 'They / Them', 'Prefer not to say']

const Section = ({ label, description, children }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-8 border-b border-gray-900">
    <div>
      <p className="text-sm font-semibold text-gray-300 uppercase tracking-widest">{label}</p>
      {description && <p className="text-xs text-gray-600 mt-1">{description}</p>}
    </div>
    <div className="md:col-span-2 space-y-4">{children}</div>
  </div>
)

const SkillTag = ({ skill, onRemove }) => (
  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-900 border border-gray-800 rounded-full text-sm text-gray-300">
    {skill}
    <button type="button" onClick={() => onRemove(skill)} className="text-gray-600 hover:text-white transition">x</button>
  </span>
)

const EntryCard = ({ children, onEdit, onDelete }) => (
  <div className="bg-gray-950 border border-gray-900 rounded-lg p-4 relative group">
    <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition">
      {onEdit && (
        <button type="button" onClick={onEdit} className="text-gray-500 hover:text-white text-xs px-2 py-1 border border-gray-800 rounded">
          Edit
        </button>
      )}
      {onDelete && (
        <button type="button" onClick={onDelete} className="text-gray-500 hover:text-red-400 text-xs px-2 py-1 border border-gray-800 rounded">
          Delete
        </button>
      )}
    </div>
    {children}
  </div>
)

const AddBtn = ({ label, onClick }) => (
  <button type="button" onClick={onClick} className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition mt-1">
    <span className="text-lg leading-none">+</span> {label}
  </button>
)

const Modal = ({ title, onClose, onSave, children }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
    <div className="bg-gray-950 border border-gray-800 rounded-xl w-full max-w-lg p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-white font-semibold">{title}</h3>
        <button type="button" onClick={onClose} className="text-gray-500 hover:text-white text-xl leading-none">x</button>
      </div>
      {children}
      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onClose} className="btn-secondary text-sm py-2 px-4">Cancel</button>
        <button type="button" onClick={onSave} className="btn-primary text-sm py-2 px-4">Save</button>
      </div>
    </div>
  </div>
)

const Profile = () => {
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const [about, setAbout] = useState({
    fullName: '', phone: '', location: '', primaryRole: '',
    yearsOfExperience: '', bio: '', pronouns: '', openRoles: []
  })
  const [openRoleInput, setOpenRoleInput] = useState('')
  const [skills, setSkills] = useState([])
  const [skillInput, setSkillInput] = useState('')
  const [experiences, setExperiences] = useState([])
  const [expModal, setExpModal] = useState(false)
  const [editExpIdx, setEditExpIdx] = useState(null)
  const [expForm, setExpForm] = useState({ company: '', title: '', startDate: '', endDate: '', current: false, description: '' })
  const [educations, setEducations] = useState([])
  const [eduModal, setEduModal] = useState(false)
  const [editEduIdx, setEditEduIdx] = useState(null)
  const [eduForm, setEduForm] = useState({ school: '', degree: '', field: '', startYear: '', endYear: '' })
  const [projects, setProjects] = useState([])
  const [projModal, setProjModal] = useState(false)
  const [editProjIdx, setEditProjIdx] = useState(null)
  const [projForm, setProjForm] = useState({ title: '', link: '', startDate: '', endDate: '', description: '' })
  const [social, setSocial] = useState({ website: '', linkedin: '', github: '', twitter: '' })
  const [accomplishments, setAccomplishments] = useState('')

  useEffect(() => {
    profileAPI.get().then(res => {
      if (!res.data) return
      const d = res.data
      setAbout({
        fullName: d.fullName || '', phone: d.phone || '', location: d.location || '',
        primaryRole: d.targetCareer || '', yearsOfExperience: d.yearsOfExperience || '',
        bio: d.bio || '', pronouns: d.pronouns || '', openRoles: d.openRoles || []
      })
      setSkills(d.skillsList || (d.skills ? d.skills.split(',').map(s => s.trim()).filter(Boolean) : []))
      setExperiences(d.experiences || [])
      setEducations(d.educations || [])
      setProjects(d.projects || [])
      setSocial(d.social || { website: '', linkedin: '', github: '', twitter: '' })
      setAccomplishments(d.accomplishments || '')
    }).catch(() => {})
  }, [])

  const handleSave = async () => {
    setLoading(true)
    setMessage('')
    const payload = {
      fullName: about.fullName, phone: about.phone, location: about.location,
      targetCareer: about.primaryRole, yearsOfExperience: about.yearsOfExperience,
      bio: about.bio, pronouns: about.pronouns, openRoles: about.openRoles,
      skillsList: skills, skills: skills.join(', '),
      experiences, educations, projects, social, accomplishments
    }
    try {
      await profileAPI.create(payload)
      setMessage('Profile saved successfully!')
    } catch {
      setMessage('Error saving profile')
    } finally {
      setLoading(false)
    }
  }

  const addSkill = () => {
    const s = skillInput.trim()
    if (s && !skills.includes(s)) setSkills([...skills, s])
    setSkillInput('')
  }

  const addOpenRole = (role) => {
    if (role && !about.openRoles.includes(role)) {
      setAbout({ ...about, openRoles: [...about.openRoles, role] })
    }
    setOpenRoleInput('')
  }

  const openExpModal = (idx = null) => {
    setEditExpIdx(idx)
    setExpForm(idx !== null ? { ...experiences[idx] } : { company: '', title: '', startDate: '', endDate: '', current: false, description: '' })
    setExpModal(true)
  }
  const saveExp = () => {
    const updated = [...experiences]
    if (editExpIdx !== null) updated[editExpIdx] = expForm
    else updated.push(expForm)
    setExperiences(updated)
    setExpModal(false)
  }

  const openEduModal = (idx = null) => {
    setEditEduIdx(idx)
    setEduForm(idx !== null ? { ...educations[idx] } : { school: '', degree: '', field: '', startYear: '', endYear: '' })
    setEduModal(true)
  }
  const saveEdu = () => {
    const updated = [...educations]
    if (editEduIdx !== null) updated[editEduIdx] = eduForm
    else updated.push(eduForm)
    setEducations(updated)
    setEduModal(false)
  }

  const openProjModal = (idx = null) => {
    setEditProjIdx(idx)
    setProjForm(idx !== null ? { ...projects[idx] } : { title: '', link: '', startDate: '', endDate: '', description: '' })
    setProjModal(true)
  }
  const saveProj = () => {
    const updated = [...projects]
    if (editProjIdx !== null) updated[editProjIdx] = projForm
    else updated.push(projForm)
    setProjects(updated)
    setProjModal(false)
  }

  const inputCls = 'input-field text-sm'
  const labelCls = 'block text-xs font-medium text-gray-500 mb-1'

  return (
    <DashboardLayout>
      <div className="max-w-4xl">
        <h1 className="page-heading">Profile Setup</h1>
        <p className="page-subheading mb-8">Build your career profile — the more complete, the better your recommendations</p>

        {message && (
          <div className={`p-3 rounded-lg mb-6 border text-sm bg-gray-950 ${message.includes('success') ? 'border-gray-700 text-gray-300' : 'border-red-900 text-red-400'}`}>
            {message}
          </div>
        )}

        {/* ABOUT */}
        <Section label="About" description="Tell us about yourself">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Full Name *</label>
              <input className={inputCls} value={about.fullName} onChange={e => setAbout({ ...about, fullName: e.target.value })} placeholder="Your name" />
            </div>
            <div>
              <label className={labelCls}>Phone</label>
              <input className={inputCls} value={about.phone} onChange={e => setAbout({ ...about, phone: e.target.value })} placeholder="+91 XXXXX XXXXX" />
            </div>
          </div>
          <div>
            <label className={labelCls}>Location</label>
            <input className={inputCls} value={about.location} onChange={e => setAbout({ ...about, location: e.target.value })} placeholder="e.g. Bengaluru, Karnataka" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Primary Role *</label>
              <select className={inputCls} value={about.primaryRole} onChange={e => setAbout({ ...about, primaryRole: e.target.value })}>
                <option value="">Select role</option>
                {ROLES.map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Years of Experience</label>
              <select className={inputCls} value={about.yearsOfExperience} onChange={e => setAbout({ ...about, yearsOfExperience: e.target.value })}>
                <option value="">Select</option>
                {EXP_OPTIONS.map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className={labelCls}>Open to Roles</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {about.openRoles.map(r => (
                <SkillTag key={r} skill={r} onRemove={role => setAbout({ ...about, openRoles: about.openRoles.filter(x => x !== role) })} />
              ))}
            </div>
            <select className={inputCls} value={openRoleInput} onChange={e => { setOpenRoleInput(e.target.value); addOpenRole(e.target.value) }}>
              <option value="">+ Add role</option>
              {ROLES.filter(r => !about.openRoles.includes(r)).map(r => <option key={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Bio</label>
            <textarea className={inputCls} rows={4} value={about.bio} onChange={e => setAbout({ ...about, bio: e.target.value })} placeholder="Tell recruiters and startups about yourself..." />
          </div>
          <div>
            <label className={labelCls}>Pronouns</label>
            <select className={inputCls} value={about.pronouns} onChange={e => setAbout({ ...about, pronouns: e.target.value })}>
              <option value="">Select</option>
              {PRONOUNS.map(p => <option key={p}>{p}</option>)}
            </select>
          </div>
        </Section>

        {/* SKILLS */}
        <Section label="Skills" description="Add skills to help match you with the right opportunities">
          <div className="flex flex-wrap gap-2 mb-3">
            {skills.map(s => <SkillTag key={s} skill={s} onRemove={sk => setSkills(skills.filter(x => x !== sk))} />)}
          </div>
          <div className="flex gap-2">
            <input
              className={inputCls}
              value={skillInput}
              onChange={e => setSkillInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill() } }}
              placeholder="e.g. Python, React"
            />
            <button type="button" onClick={addSkill} className="btn-secondary text-sm py-2 px-4 whitespace-nowrap">Add</button>
          </div>
        </Section>

        {/* WORK EXPERIENCE */}
        <Section label="Work Experience" description="What positions have you held?">
          <div className="space-y-3">
            {experiences.map((exp, i) => (
              <EntryCard key={i} onEdit={() => openExpModal(i)} onDelete={() => setExperiences(experiences.filter((_, j) => j !== i))}>
                <p className="text-white font-medium text-sm">{exp.title}</p>
                <p className="text-gray-400 text-xs">{exp.company}</p>
                <p className="text-gray-600 text-xs mt-0.5">{exp.startDate} – {exp.current ? 'Present' : exp.endDate}</p>
                {exp.description && <p className="text-gray-500 text-xs mt-1 line-clamp-2">{exp.description}</p>}
              </EntryCard>
            ))}
          </div>
          <AddBtn label="Add work experience" onClick={() => openExpModal()} />
        </Section>

        {/* EDUCATION */}
        <Section label="Education" description="What schools have you studied at?">
          <div className="space-y-3">
            {educations.map((edu, i) => (
              <EntryCard key={i} onEdit={() => openEduModal(i)} onDelete={() => setEducations(educations.filter((_, j) => j !== i))}>
                <p className="text-white font-medium text-sm">{edu.school}</p>
                <p className="text-gray-400 text-xs">{edu.degree}{edu.field ? `, ${edu.field}` : ''}</p>
                <p className="text-gray-600 text-xs mt-0.5">{edu.startYear} – {edu.endYear}</p>
              </EntryCard>
            ))}
          </div>
          <AddBtn label="Add education" onClick={() => openEduModal()} />
        </Section>

        {/* PROJECTS */}
        <Section label="Academics / Personal Projects" description="Showcase what you have built">
          <div className="space-y-3">
            {projects.map((proj, i) => (
              <EntryCard key={i} onEdit={() => openProjModal(i)} onDelete={() => setProjects(projects.filter((_, j) => j !== i))}>
                <p className="text-white font-medium text-sm">{proj.title}</p>
                <p className="text-gray-600 text-xs mt-0.5">{proj.startDate} – {proj.endDate}</p>
                {proj.link && <a href={proj.link} target="_blank" rel="noreferrer" className="text-blue-500 text-xs hover:underline">{proj.link}</a>}
                {proj.description && <p className="text-gray-500 text-xs mt-1 line-clamp-2">{proj.description}</p>}
              </EntryCard>
            ))}
          </div>
          <AddBtn label="Add academic / personal project" onClick={() => openProjModal()} />
        </Section>

        {/* SOCIAL */}
        <Section label="Social Profiles" description="Where can people find you online?">
          {[
            { key: 'website', label: 'Website', placeholder: 'https://yourportfolio.com' },
            { key: 'linkedin', label: 'LinkedIn', placeholder: 'https://linkedin.com/in/username' },
            { key: 'github', label: 'GitHub', placeholder: 'https://github.com/username' },
            { key: 'twitter', label: 'Twitter / X', placeholder: 'https://twitter.com/username' },
          ].map(({ key, label, placeholder }) => (
            <div key={key}>
              <label className={labelCls}>{label}</label>
              <input className={inputCls} value={social[key]} onChange={e => setSocial({ ...social, [key]: e.target.value })} placeholder={placeholder} />
            </div>
          ))}
        </Section>

        {/* ACCOMPLISHMENTS */}
        <Section label="Accomplishments / Additional Details" description="Certifications, awards, extra-curriculars">
          <textarea
            className={inputCls}
            rows={5}
            value={accomplishments}
            onChange={e => setAccomplishments(e.target.value)}
            placeholder="Completed XYZ certification, Won hackathon at ABC, Open source contributor..."
          />
        </Section>

        {/* SAVE */}
        <div className="py-8 text-center">
          <p className="text-gray-600 text-xs mb-4">Save profile to confirm changes. Sections with missing required fields will not be used for recommendations.</p>
          <button type="button" onClick={handleSave} disabled={loading} className="btn-primary px-10 disabled:opacity-50">
            {loading ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </div>

      {/* EXPERIENCE MODAL */}
      {expModal && (
        <Modal title={editExpIdx !== null ? 'Edit Experience' : 'Add Experience'} onClose={() => setExpModal(false)} onSave={saveExp}>
          <div className="space-y-3">
            <div>
              <label className={labelCls}>Company *</label>
              <input className={inputCls} value={expForm.company} onChange={e => setExpForm({ ...expForm, company: e.target.value })} placeholder="Company name" />
            </div>
            <div>
              <label className={labelCls}>Title *</label>
              <input className={inputCls} value={expForm.title} onChange={e => setExpForm({ ...expForm, title: e.target.value })} placeholder="e.g. Software Engineer Intern" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Start Date</label>
                <input className={inputCls} type="month" value={expForm.startDate} onChange={e => setExpForm({ ...expForm, startDate: e.target.value })} />
              </div>
              <div>
                <label className={labelCls}>End Date</label>
                <input className={inputCls} type="month" value={expForm.endDate} onChange={e => setExpForm({ ...expForm, endDate: e.target.value })} disabled={expForm.current} />
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer">
              <input type="checkbox" checked={expForm.current} onChange={e => setExpForm({ ...expForm, current: e.target.checked })} className="accent-white" />
              Currently working here
            </label>
            <div>
              <label className={labelCls}>Description</label>
              <textarea className={inputCls} rows={3} value={expForm.description} onChange={e => setExpForm({ ...expForm, description: e.target.value })} placeholder="What did you do?" />
            </div>
          </div>
        </Modal>
      )}

      {/* EDUCATION MODAL */}
      {eduModal && (
        <Modal title={editEduIdx !== null ? 'Edit Education' : 'Add Education'} onClose={() => setEduModal(false)} onSave={saveEdu}>
          <div className="space-y-3">
            <div>
              <label className={labelCls}>School / University *</label>
              <input className={inputCls} value={eduForm.school} onChange={e => setEduForm({ ...eduForm, school: e.target.value })} placeholder="e.g. IIT Delhi" />
            </div>
            <div>
              <label className={labelCls}>Degree</label>
              <input className={inputCls} value={eduForm.degree} onChange={e => setEduForm({ ...eduForm, degree: e.target.value })} placeholder="e.g. B.Tech, BCA" />
            </div>
            <div>
              <label className={labelCls}>Field of Study</label>
              <input className={inputCls} value={eduForm.field} onChange={e => setEduForm({ ...eduForm, field: e.target.value })} placeholder="e.g. Computer Science" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Start Year</label>
                <input className={inputCls} type="number" min="1990" max="2030" value={eduForm.startYear} onChange={e => setEduForm({ ...eduForm, startYear: e.target.value })} placeholder="2021" />
              </div>
              <div>
                <label className={labelCls}>End Year</label>
                <input className={inputCls} type="number" min="1990" max="2030" value={eduForm.endYear} onChange={e => setEduForm({ ...eduForm, endYear: e.target.value })} placeholder="2025" />
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* PROJECT MODAL */}
      {projModal && (
        <Modal title={editProjIdx !== null ? 'Edit Project' : 'Add Project'} onClose={() => setProjModal(false)} onSave={saveProj}>
          <div className="space-y-3">
            <div>
              <label className={labelCls}>Project Title *</label>
              <input className={inputCls} value={projForm.title} onChange={e => setProjForm({ ...projForm, title: e.target.value })} placeholder="e.g. AI Career Coach" />
            </div>
            <div>
              <label className={labelCls}>Project Link</label>
              <input className={inputCls} value={projForm.link} onChange={e => setProjForm({ ...projForm, link: e.target.value })} placeholder="https://..." />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Start Date</label>
                <input className={inputCls} type="month" value={projForm.startDate} onChange={e => setProjForm({ ...projForm, startDate: e.target.value })} />
              </div>
              <div>
                <label className={labelCls}>End Date</label>
                <input className={inputCls} type="month" value={projForm.endDate} onChange={e => setProjForm({ ...projForm, endDate: e.target.value })} />
              </div>
            </div>
            <div>
              <label className={labelCls}>Description</label>
              <textarea className={inputCls} rows={3} value={projForm.description} onChange={e => setProjForm({ ...projForm, description: e.target.value })} placeholder="What did you build and why?" />
            </div>
          </div>
        </Modal>
      )}
    </DashboardLayout>
  )
}

export default Profile
