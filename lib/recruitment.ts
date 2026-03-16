export const APPLICATION_STATUS_ORDER = [
  'applied',
  'under_review',
  'shortlisted',
  'interview_scheduled',
  'accepted',
  'rejected',
] as const

export const APPLICATION_STATUS_OPTIONS = [
  { value: 'applied', label: 'Applied', description: 'The application has been submitted.' },
  { value: 'under_review', label: 'Under Review', description: 'The recruiter is reviewing the profile.' },
  { value: 'shortlisted', label: 'Shortlisted', description: 'The candidate is moving forward.' },
  { value: 'interview_scheduled', label: 'Interview Scheduled', description: 'An interview round is planned.' },
  { value: 'accepted', label: 'Accepted', description: 'The candidate has been selected.' },
  { value: 'rejected', label: 'Rejected', description: 'The application is no longer progressing.' },
] as const

export const JOB_STATUS_OPTIONS = [
  { value: 'open', label: 'Open' },
  { value: 'closed', label: 'Closed' },
  { value: 'filled', label: 'Filled' },
] as const

export const JOB_TYPE_OPTIONS = ['Full-time', 'Part-time', 'Contract', 'Internship', 'Remote'] as const

export type RecruitmentApplicationStatus = (typeof APPLICATION_STATUS_ORDER)[number]

export function normalizeApplicationStatus(status: string): RecruitmentApplicationStatus {
  const normalized = status?.toLowerCase?.() || 'applied'

  if (normalized === 'applied' || normalized === 'pending') {
    return 'applied'
  }

  if (normalized === 'under_review' || normalized === 'reviewing' || normalized === 'reviewed') {
    return 'under_review'
  }

  if (normalized === 'shortlisted') {
    return 'shortlisted'
  }

  if (normalized === 'interview_scheduled') {
    return 'interview_scheduled'
  }

  if (normalized === 'accepted' || normalized === 'offer_extended') {
    return 'accepted'
  }

  if (normalized === 'rejected') {
    return 'rejected'
  }

  return 'applied'
}

export function getStatusLabel(status: string) {
  return APPLICATION_STATUS_OPTIONS.find((option) => option.value === normalizeApplicationStatus(status))?.label || 'Applied'
}

export function getApplicationProgressValue(status: string) {
  const normalized = normalizeApplicationStatus(status)
  const index = APPLICATION_STATUS_ORDER.findIndex((item) => item === normalized)

  if (normalized === 'rejected') {
    return 100
  }

  return Math.max(10, Math.round(((index + 1) / (APPLICATION_STATUS_ORDER.length - 1)) * 100))
}

export function formatSalaryRange(min?: number | null, max?: number | null) {
  if (!min && !max) {
    return 'Compensation not listed'
  }

  if (min && max) {
    return `INR ${min.toLocaleString()} - INR ${max.toLocaleString()}`
  }

  if (min) {
    return `From INR ${min.toLocaleString()}`
  }

  return `Up to INR ${max?.toLocaleString()}`
}

export function splitCommaSeparated(value: string) {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

export function splitLineSeparated(value: string) {
  return value
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean)
}

export function countJobMatchScore(studentSkills: string[] = [], jobRequirements: string[] = []) {
  if (!studentSkills.length || !jobRequirements.length) {
    return 0
  }

  const normalizedStudentSkills = new Set(studentSkills.map((skill) => skill.toLowerCase()))
  const matches = jobRequirements.filter((requirement) =>
    normalizedStudentSkills.has(requirement.toLowerCase())
  ).length

  return Math.round((matches / jobRequirements.length) * 100)
}

export const FALLBACK_SUCCESS_STORIES = [
  {
    name: 'Asha R',
    role: 'Frontend Engineer',
    company: 'Freshworks',
    story:
      'I stopped sending generic resumes, rebuilt my portfolio around shipped projects, and tailored each application to the job description.',
    advice: 'Rewrite one project as a case study with clear business outcomes.',
  },
  {
    name: 'Karthik M',
    role: 'Backend Developer',
    company: 'Chargebee',
    story:
      'The biggest difference was documenting impact. I turned course projects into case studies with metrics, architecture notes, and tradeoffs.',
    advice: 'Show proof of ownership, not just a list of technologies.',
  },
  {
    name: 'Niveditha P',
    role: 'Product Analyst Intern',
    company: 'Razorpay',
    story:
      'I focused on one domain, published small product breakdowns every week, and used each interview to improve my narrative.',
    advice: 'Use every interview as feedback for the next one.',
  },
]

export const FALLBACK_HIRING_INSIGHTS = [
  {
    category: 'Portfolio',
    title: 'Recruiters skim for evidence, not volume',
    summary:
      'Two or three strong projects with context, metrics, and tradeoffs are more convincing than a long list of unfinished experiments.',
    takeaway: 'Turn one project into a recruiter-friendly case study this week.',
  },
  {
    category: 'Applications',
    title: 'Tailored applications outperform generic submissions',
    summary:
      'Candidates who mirror role requirements in their profile headline, skills, and project descriptions tend to progress faster.',
    takeaway: 'Match your profile summary to the role you are applying for.',
  },
  {
    category: 'Interviews',
    title: 'Clear communication is a hiring differentiator',
    summary:
      'Students who explain decisions, tradeoffs, and debugging steps consistently leave a stronger impression than those who only share final answers.',
    takeaway: 'Practice explaining one solved problem out loud each day.',
  },
]
