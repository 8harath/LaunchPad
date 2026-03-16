'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  Bell,
  Bookmark,
  BriefcaseBusiness,
  CheckCircle2,
  Clock3,
  Moon,
  Search,
  SlidersHorizontal,
  Sparkles,
  Sun,
  XCircle,
} from 'lucide-react'

type MessageType = 'success' | 'error' | null

const jobs = [
  {
    company: 'Internshala',
    role: 'Product Design Intern',
    mode: 'Hybrid · Gurgaon',
    stipend: '₹35k/month',
    tags: ['Figma', 'UX Research', 'Portfolio'],
  },
  {
    company: 'Razorpay',
    role: 'Frontend Developer Intern',
    mode: 'Remote',
    stipend: '₹50k/month',
    tags: ['React', 'TypeScript', 'Performance'],
  },
  {
    company: 'Freshworks',
    role: 'Software Engineer I',
    mode: 'Chennai',
    stipend: '₹14 LPA',
    tags: ['Node.js', 'System Design', 'API'],
  },
  {
    company: 'CRED',
    role: 'Growth Analyst Intern',
    mode: 'Bengaluru',
    stipend: '₹40k/month',
    tags: ['SQL', 'Experimentation', 'Analytics'],
  },
]

export default function Home() {
  const [selectedJob, setSelectedJob] = useState(0)
  const [message, setMessage] = useState<MessageType>(null)
  const [darkMode, setDarkMode] = useState(false)

  useEffect(() => {
    const savedTheme = localStorage.getItem('launchpad-theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const shouldDark = savedTheme ? savedTheme === 'dark' : prefersDark
    setDarkMode(shouldDark)
    document.documentElement.classList.toggle('dark', shouldDark)
  }, [])

  const activeJob = useMemo(() => jobs[selectedJob], [selectedJob])

  const toggleTheme = () => {
    const nextMode = !darkMode
    setDarkMode(nextMode)
    document.documentElement.classList.toggle('dark', nextMode)
    localStorage.setItem('launchpad-theme', nextMode ? 'dark' : 'light')
  }

  const triggerMessage = (kind: MessageType) => {
    setMessage(kind)
    window.setTimeout(() => setMessage(null), 2200)
  }

  return (
    <main className="lp-shell">
      <div className="lp-main-content">
        <header className="lp-topbar fade-in-up">
          <div>
            <p className="lp-eyebrow">LaunchPad Pro</p>
            <h1>Find internships & jobs with smarter discovery.</h1>
          </div>
          <div className="lp-topbar-actions">
            <button type="button" className="lp-icon-btn pulse-animation" aria-label="Notifications">
              <Bell size={16} />
            </button>
            <button type="button" className="lp-icon-btn" onClick={toggleTheme} aria-label="Toggle theme">
              {darkMode ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>
        </header>

        <section className="lp-search-card fade-in-up">
          <div className="lp-search-wrap">
            <Search size={18} />
            <input type="text" placeholder="Search roles, companies, skills..." />
          </div>
          <button type="button" className="lp-filter-chip">
            <SlidersHorizontal size={14} />
            Advanced filters
          </button>
        </section>

        <section className="lp-kpi-grid fade-in-up">
          {[
            ['2,500+', 'Live internships'],
            ['87%', 'Response rate'],
            ['24h', 'Avg first callback'],
          ].map(([value, label]) => (
            <article key={label} className="lp-card">
              <h3>{value}</h3>
              <p>{label}</p>
            </article>
          ))}
        </section>

        {message === 'success' ? (
          <div className="lp-message lp-success">
            <CheckCircle2 size={16} /> Job saved to your shortlist successfully.
          </div>
        ) : null}
        {message === 'error' ? (
          <div className="lp-message lp-error">
            <XCircle size={16} /> Couldn't submit right now. Please retry.
          </div>
        ) : null}

        <section className="lp-listings">
          {jobs.map((job, idx) => (
            <article
              key={`${job.company}-${job.role}`}
              className={`lp-card lp-job-card fade-in-up ${idx === selectedJob ? 'is-active' : ''}`}
              onClick={() => setSelectedJob(idx)}
            >
              <div className="lp-job-head">
                <div>
                  <p className="lp-company">{job.company}</p>
                  <h2>{job.role}</h2>
                </div>
                <span className="lp-badge">{idx % 2 === 0 ? 'Internship' : 'Full-time'}</span>
              </div>
              <div className="lp-meta">
                <span>
                  <Clock3 size={14} /> {job.mode}
                </span>
                <span>
                  <BriefcaseBusiness size={14} /> {job.stipend}
                </span>
              </div>
              <div className="lp-tags">
                {job.tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
              <div className="lp-actions">
                <button type="button" className="lp-primary-btn" onClick={() => triggerMessage('success')}>
                  Save role <Bookmark size={14} />
                </button>
                <button type="button" className="lp-action-btn" onClick={() => triggerMessage('error')}>
                  Quick apply now
                </button>
              </div>
            </article>
          ))}
        </section>
      </div>

      <aside className="lp-sidebar">
        <div className="lp-side-card fade-in-up">
          <p className="lp-side-title">Selected role</p>
          <h3>{activeJob.role}</h3>
          <p>{activeJob.company}</p>
          <ul>
            <li>ATS-friendly profile score: 92%</li>
            <li>Required skills matched: 4/5</li>
            <li>Interview prep tips unlocked</li>
          </ul>
          <button type="button" className="lp-action-btn">
            <Sparkles size={16} /> Boost profile match
          </button>
        </div>

        <div className="lp-side-card fade-in-up">
          <p className="lp-side-title">Productivity mode</p>
          <div className="lp-progress-track">
            <div className="lp-progress-fill loading-spin" />
          </div>
          <p className="lp-side-note">Complete 2 more applications to unlock recruiter priority visibility.</p>
          <Link href="/browse" className="lp-link">
            Explore all openings →
          </Link>
        </div>
      </aside>
    </main>
  )
}
