'use client'

import { CheckCircle2, Loader2, TriangleAlert } from 'lucide-react'

const pipelineCards = [
  {
    title: 'Frontend Engineer Intern',
    company: 'Orbit Labs',
    details: 'React, TypeScript, Design systems',
  },
  {
    title: 'Backend Engineer',
    company: 'Nova Stack',
    details: 'Node.js, PostgreSQL, API performance',
  },
  {
    title: 'Product Designer',
    company: 'Lumen Studio',
    details: 'Figma, UX research, prototyping',
  },
]

export default function Home() {
  return (
    <main className="ui-shell">
      <section className="ui-main-content fade-in-up">
        <header className="ui-header">
          <p className="ui-kicker">LaunchPad workspace</p>
          <h1>Modern recruitment dashboard</h1>
          <p>
            A clean interface with responsive cards, motion-rich interactions, and clear feedback states for hiring workflows.
          </p>
        </header>

        <div className="ui-card-grid">
          {pipelineCards.map((card, index) => (
            <article key={card.title} className={`ui-node-card ${index === 1 ? 'is-selected' : ''}`}>
              <h2>{card.title}</h2>
              <p className="ui-label">{card.company}</p>
              <p className="ui-secondary">{card.details}</p>
            </article>
          ))}
        </div>

        <div className="ui-actions">
          <button className="btn-primary" type="button">
            Create job post
          </button>
          <button className="btn-primary" type="button">
            Review applications
          </button>
        </div>

        <button className="btn-action pulse-animation" type="button">
          Launch matching workflow
        </button>

        <div className="ui-feedback-stack">
          <div className="feedback-message feedback-success" role="status" aria-live="polite">
            <CheckCircle2 size={18} />
            Candidate shortlist synced successfully.
          </div>
          <div className="feedback-message feedback-error" role="alert">
            <TriangleAlert size={18} />
            Failed to send invite. Please retry.
          </div>
        </div>
      </section>

      <aside className="ui-sidebar">
        <h3>Activity</h3>
        <div className="ui-sidebar-card fade-in-up">
          <p className="ui-label">Today</p>
          <p className="ui-secondary">12 applications screened</p>
        </div>
        <div className="ui-sidebar-card fade-in-up">
          <p className="ui-label">Interviews</p>
          <p className="ui-secondary">3 sessions scheduled</p>
        </div>
        <div className="ui-sidebar-card fade-in-up">
          <p className="ui-label">Syncing pipeline</p>
          <Loader2 size={16} className="loading-spin" />
        </div>
      </aside>
    </main>
  )
}
