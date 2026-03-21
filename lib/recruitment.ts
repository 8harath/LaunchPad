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

  const normalizedStudentSkills = new Set(
    studentSkills
      .map((skill) => canonicalizeSkill(skill) || normalizeForComparison(skill))
      .filter(Boolean)
  )
  const normalizedRequirements = jobRequirements.flatMap((requirement) => {
    const extractedSkills = extractKnownSkills(requirement)

    if (extractedSkills.length > 0) {
      return extractedSkills
    }

    const normalizedRequirement = canonicalizeSkill(requirement) || normalizeForComparison(requirement)
    return normalizedRequirement ? [normalizedRequirement] : []
  })
  const matches = normalizedRequirements.filter((requirement) =>
    normalizedStudentSkills.has(requirement)
  ).length

  return normalizedRequirements.length
    ? Math.round((matches / normalizedRequirements.length) * 100)
    : 0
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

export type CareerGuidanceInput = {
  fullName?: string | null
  bio?: string | null
  headline?: string | null
  location?: string | null
  currentTitle?: string | null
  currentCompany?: string | null
  yearsOfExperience?: number | null
  experienceSummary?: string | null
  projectHighlights?: string | null
  certifications?: string[]
  preferredJobTypes?: string[]
  skills?: string[]
  githubUrl?: string | null
  linkedinUrl?: string | null
  portfolioUrl?: string | null
  resumeUrl?: string | null
  resumeText?: string | null
  targetRole?: string | null
  jobs: Array<{
    id: string
    title: string
    description: string
    requirements: string[]
    location: string | null
    jobType: string | null
    salaryMin: number | null
    salaryMax: number | null
    deadline: string | null
    company: {
      id: string
      name: string
      industry: string | null
    }
  }>
}

export type CareerRecommendation = {
  title: string
  fitScore: number
  summary: string
  reasons: string[]
  matchedSkills: string[]
  missingSkills: string[]
  matchedJobCount: number
}

export type CareerMatchedJob = {
  id: string
  title: string
  company: string
  industry: string | null
  location: string | null
  jobType: string | null
  salaryMin: number | null
  salaryMax: number | null
  deadline: string | null
  matchScore: number
  matchedSkills: string[]
  missingSkills: string[]
}

export type CareerSkillGap = {
  role: string
  priority: 'High' | 'Medium' | 'Explore'
  missingSkills: string[]
  rationale: string
}

export type CareerLearningResource = {
  title: string
  url: string
  type: 'Guide' | 'Docs' | 'Course' | 'Practice'
  note: string
}

export type CareerLearningStep = {
  skill: string
  stage: 'Now' | 'Next' | 'Later'
  reason: string
  resources: CareerLearningResource[]
}

export type ResumeFeedback = {
  score: number
  strengths: string[]
  improvements: string[]
  missingSections: string[]
  rewriteExamples: string[]
}

export type CareerGuidanceResponse = {
  source: 'deterministic'
  profileSnapshot: {
    fullName?: string | null
    headline?: string | null
    location?: string | null
    skillCount: number
    skills: string[]
    preferredJobTypes: string[]
    resumeIncluded: boolean
    signalsUsed: string[]
  }
  recommendedRoles: CareerRecommendation[]
  matchedJobs: CareerMatchedJob[]
  skillGaps: CareerSkillGap[]
  learningPath: CareerLearningStep[]
  resumeFeedback: ResumeFeedback
}

type SkillDefinition = {
  key: string
  label: string
  aliases: string[]
}

type RoleBlueprint = {
  title: string
  summary: string
  keywords: string[]
  coreSkills: string[]
  adjacentSkills: string[]
  jobTypeHints?: string[]
}

const SKILL_TAXONOMY: SkillDefinition[] = [
  { key: 'html', label: 'HTML', aliases: ['html'] },
  { key: 'css', label: 'CSS', aliases: ['css', 'tailwind', 'tailwindcss'] },
  { key: 'javascript', label: 'JavaScript', aliases: ['javascript', 'js', 'ecmascript'] },
  { key: 'typescript', label: 'TypeScript', aliases: ['typescript', 'ts'] },
  { key: 'react', label: 'React', aliases: ['react', 'reactjs', 'react.js'] },
  { key: 'nextjs', label: 'Next.js', aliases: ['next', 'nextjs', 'next.js', 'next js'] },
  { key: 'nodejs', label: 'Node.js', aliases: ['node', 'nodejs', 'node.js'] },
  { key: 'python', label: 'Python', aliases: ['python'] },
  { key: 'java', label: 'Java', aliases: ['java'] },
  { key: 'cplusplus', label: 'C++', aliases: ['c++', 'cpp', 'cplusplus'] },
  { key: 'sql', label: 'SQL', aliases: ['sql'] },
  { key: 'mysql', label: 'MySQL', aliases: ['mysql'] },
  { key: 'postgresql', label: 'PostgreSQL', aliases: ['postgresql', 'postgres', 'postgre'] },
  { key: 'mongodb', label: 'MongoDB', aliases: ['mongodb', 'mongo db', 'mongo'] },
  { key: 'supabase', label: 'Supabase', aliases: ['supabase'] },
  { key: 'git', label: 'Git', aliases: ['git', 'github'] },
  { key: 'docker', label: 'Docker', aliases: ['docker', 'containerization'] },
  { key: 'kubernetes', label: 'Kubernetes', aliases: ['kubernetes', 'k8s'] },
  { key: 'aws', label: 'AWS', aliases: ['aws', 'amazon web services'] },
  { key: 'restapis', label: 'REST APIs', aliases: ['rest api', 'rest apis', 'restful api', 'api design', 'apis'] },
  { key: 'graphql', label: 'GraphQL', aliases: ['graphql'] },
  { key: 'excel', label: 'Excel', aliases: ['excel', 'spreadsheets'] },
  { key: 'powerbi', label: 'Power BI', aliases: ['power bi', 'powerbi'] },
  { key: 'tableau', label: 'Tableau', aliases: ['tableau'] },
  { key: 'dataanalysis', label: 'Data Analysis', aliases: ['data analysis', 'analytics', 'analysis'] },
  { key: 'machinelearning', label: 'Machine Learning', aliases: ['machine learning', 'ml'] },
  { key: 'pandas', label: 'Pandas', aliases: ['pandas'] },
  { key: 'numpy', label: 'NumPy', aliases: ['numpy'] },
  { key: 'scikitlearn', label: 'scikit-learn', aliases: ['scikit learn', 'scikit-learn', 'sklearn'] },
  { key: 'figma', label: 'Figma', aliases: ['figma'] },
  { key: 'uxdesign', label: 'UX Design', aliases: ['ux', 'ui', 'ui ux', 'ui/ux', 'ux design', 'user experience', 'user interface'] },
  { key: 'testing', label: 'Testing', aliases: ['testing', 'unit testing', 'integration testing', 'qa'] },
  { key: 'automation', label: 'Automation', aliases: ['automation', 'test automation'] },
  { key: 'communication', label: 'Communication', aliases: ['communication', 'presentation', 'writing'] },
]

const ROLE_BLUEPRINTS: RoleBlueprint[] = [
  {
    title: 'Frontend Developer',
    summary: 'Strong fit for building polished web interfaces and interactive product experiences.',
    keywords: ['frontend', 'front-end', 'web', 'ui', 'react', 'next'],
    coreSkills: ['html', 'css', 'javascript', 'typescript', 'react'],
    adjacentSkills: ['nextjs', 'git', 'uxdesign', 'restapis'],
    jobTypeHints: ['Full-time', 'Internship', 'Remote'],
  },
  {
    title: 'Backend Developer',
    summary: 'Best for API design, databases, and server-side systems ownership.',
    keywords: ['backend', 'back-end', 'api', 'server'],
    coreSkills: ['nodejs', 'python', 'sql', 'postgresql', 'restapis'],
    adjacentSkills: ['docker', 'aws', 'git', 'mongodb'],
    jobTypeHints: ['Full-time', 'Internship'],
  },
  {
    title: 'Full Stack Developer',
    summary: 'Good path if you already blend interface work with APIs and database thinking.',
    keywords: ['full stack', 'full-stack', 'product engineer', 'software engineer'],
    coreSkills: ['react', 'javascript', 'typescript', 'nodejs', 'sql'],
    adjacentSkills: ['nextjs', 'postgresql', 'restapis', 'git'],
    jobTypeHints: ['Full-time', 'Remote', 'Internship'],
  },
  {
    title: 'Data Analyst',
    summary: 'Useful for students who enjoy turning messy data into decisions and dashboards.',
    keywords: ['data analyst', 'analytics', 'business analyst', 'analyst'],
    coreSkills: ['sql', 'excel', 'dataanalysis'],
    adjacentSkills: ['powerbi', 'tableau', 'python', 'communication'],
    jobTypeHints: ['Full-time', 'Internship'],
  },
  {
    title: 'Machine Learning Engineer',
    summary: 'A strong route when you already have Python fundamentals and enjoy model-driven workflows.',
    keywords: ['machine learning', 'ml', 'ai engineer', 'data science', 'applied ai'],
    coreSkills: ['python', 'machinelearning', 'pandas', 'numpy'],
    adjacentSkills: ['scikitlearn', 'sql', 'docker', 'aws'],
    jobTypeHints: ['Full-time', 'Internship', 'Contract'],
  },
  {
    title: 'UI/UX Designer',
    summary: 'Fits candidates who care about user journeys, interfaces, and design systems.',
    keywords: ['design', 'ui', 'ux', 'product design'],
    coreSkills: ['figma', 'uxdesign'],
    adjacentSkills: ['html', 'css', 'communication'],
    jobTypeHints: ['Full-time', 'Internship', 'Remote'],
  },
  {
    title: 'DevOps / Cloud Engineer',
    summary: 'Relevant when you enjoy deployment, reliability, and platform automation.',
    keywords: ['devops', 'cloud', 'platform', 'infrastructure', 'site reliability'],
    coreSkills: ['docker', 'aws', 'git'],
    adjacentSkills: ['kubernetes', 'nodejs', 'python', 'automation'],
    jobTypeHints: ['Full-time', 'Contract'],
  },
  {
    title: 'QA / Test Engineer',
    summary: 'Useful for candidates who like systems thinking, edge cases, and quality workflows.',
    keywords: ['qa', 'quality', 'test engineer', 'testing'],
    coreSkills: ['testing', 'automation'],
    adjacentSkills: ['javascript', 'typescript', 'python', 'communication'],
    jobTypeHints: ['Full-time', 'Internship', 'Contract'],
  },
  {
    title: 'Product Analyst',
    summary: 'A practical match when you combine analytics with communication and product curiosity.',
    keywords: ['product analyst', 'business analyst', 'growth analyst'],
    coreSkills: ['sql', 'excel', 'dataanalysis', 'communication'],
    adjacentSkills: ['powerbi', 'tableau', 'python'],
    jobTypeHints: ['Full-time', 'Internship'],
  },
]

const LEARNING_RESOURCE_MAP: Record<string, CareerLearningResource[]> = {
  react: [
    { title: 'React Learn', url: 'https://react.dev/learn', type: 'Docs', note: 'Best for modern component patterns and state.' },
    { title: 'React roadmap', url: 'https://roadmap.sh/react', type: 'Guide', note: 'Use this to sequence what to learn next.' },
  ],
  nextjs: [
    { title: 'Next.js Learn', url: 'https://nextjs.org/learn', type: 'Docs', note: 'Walks through routing, data fetching, and deployment.' },
    { title: 'Next.js Documentation', url: 'https://nextjs.org/docs', type: 'Docs', note: 'Good reference once you start building projects.' },
  ],
  typescript: [
    { title: 'TypeScript Handbook', url: 'https://www.typescriptlang.org/docs/handbook/intro.html', type: 'Docs', note: 'Best starting point for types, interfaces, and narrowing.' },
    { title: 'TypeScript roadmap', url: 'https://roadmap.sh/typescript', type: 'Guide', note: 'Useful if you are moving from JavaScript into production code.' },
  ],
  javascript: [
    { title: 'MDN JavaScript Guide', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide', type: 'Docs', note: 'Covers language fundamentals and browser APIs.' },
    { title: 'JavaScript roadmap', url: 'https://roadmap.sh/javascript', type: 'Guide', note: 'Helps you choose what to learn after the basics.' },
  ],
  nodejs: [
    { title: 'Node.js Learn', url: 'https://nodejs.org/en/learn', type: 'Docs', note: 'Covers the runtime, packages, and common backend patterns.' },
    { title: 'Node.js roadmap', url: 'https://roadmap.sh/nodejs', type: 'Guide', note: 'Good if you want to move into API work quickly.' },
  ],
  python: [
    { title: 'Python Tutorial', url: 'https://docs.python.org/3/tutorial/', type: 'Docs', note: 'Best official introduction for syntax and standard library basics.' },
    { title: 'Python roadmap', url: 'https://roadmap.sh/python', type: 'Guide', note: 'Use this to connect Python basics to backend or ML goals.' },
  ],
  sql: [
    { title: 'SQLBolt', url: 'https://sqlbolt.com/', type: 'Practice', note: 'Fast interactive practice for queries and joins.' },
    { title: 'PostgreSQL Tutorial', url: 'https://www.postgresql.org/docs/current/tutorial.html', type: 'Docs', note: 'Useful for moving from exercises to real databases.' },
  ],
  postgresql: [
    { title: 'PostgreSQL Tutorial', url: 'https://www.postgresql.org/docs/current/tutorial.html', type: 'Docs', note: 'Focus on tables, joins, indexes, and constraints.' },
    { title: 'Database Design Roadmap', url: 'https://roadmap.sh/backend', type: 'Guide', note: 'Follow the database sections for backend interview prep.' },
  ],
  mysql: [
    { title: 'MySQL Tutorial', url: 'https://dev.mysql.com/doc/refman/8.0/en/tutorial.html', type: 'Docs', note: 'Good for schema design, joins, and query basics.' },
  ],
  mongodb: [
    { title: 'MongoDB University', url: 'https://learn.mongodb.com/', type: 'Course', note: 'Good intro to document modeling and queries.' },
  ],
  restapis: [
    { title: 'MDN Web APIs', url: 'https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Server-side/First_steps/Website_security', type: 'Docs', note: 'Pair this with a small CRUD project to learn API behavior.' },
    { title: 'Backend roadmap', url: 'https://roadmap.sh/backend', type: 'Guide', note: 'Follow the API and auth sections in order.' },
  ],
  docker: [
    { title: 'Docker Getting Started', url: 'https://docs.docker.com/get-started/', type: 'Docs', note: 'Best for learning containers through one working example.' },
  ],
  aws: [
    { title: 'AWS Skill Builder', url: 'https://explore.skillbuilder.aws/learn', type: 'Course', note: 'Use the beginner cloud practitioner path first.' },
  ],
  machinelearning: [
    { title: 'Google Machine Learning Crash Course', url: 'https://developers.google.com/machine-learning/crash-course', type: 'Course', note: 'Fastest structured intro to models, evaluation, and iteration.' },
    { title: 'ML roadmap', url: 'https://roadmap.sh/ai-data-scientist', type: 'Guide', note: 'Helpful for sequencing math, tooling, and projects.' },
  ],
  pandas: [
    { title: 'Pandas User Guide', url: 'https://pandas.pydata.org/docs/user_guide/index.html', type: 'Docs', note: 'Use the basics and data cleaning sections first.' },
  ],
  numpy: [
    { title: 'NumPy Quickstart', url: 'https://numpy.org/doc/stable/user/quickstart.html', type: 'Docs', note: 'Great for arrays, indexing, and numerical workflows.' },
  ],
  scikitlearn: [
    { title: 'scikit-learn Tutorials', url: 'https://scikit-learn.org/stable/tutorial/index.html', type: 'Docs', note: 'Focus on model selection, preprocessing, and evaluation.' },
  ],
  excel: [
    { title: 'Microsoft Excel training', url: 'https://support.microsoft.com/en-us/excel', type: 'Docs', note: 'Start with formulas, lookups, and pivot tables.' },
  ],
  powerbi: [
    { title: 'Power BI Learning', url: 'https://learn.microsoft.com/en-us/training/powerplatform/power-bi/', type: 'Course', note: 'Best for dashboards, DAX basics, and data storytelling.' },
  ],
  tableau: [
    { title: 'Tableau Learning', url: 'https://www.tableau.com/learn/training', type: 'Course', note: 'Use this for dashboards and visual communication.' },
  ],
  figma: [
    { title: 'Figma Learn', url: 'https://help.figma.com/hc/en-us/categories/360002051613', type: 'Docs', note: 'Start with frames, components, and prototyping.' },
  ],
  uxdesign: [
    { title: 'Google UX Design Certificate overview', url: 'https://grow.google/certificates/ux-design/', type: 'Course', note: 'Good structured path if you are switching into UX.' },
    { title: 'Interaction Design Foundation articles', url: 'https://www.interaction-design.org/literature', type: 'Guide', note: 'Useful for principles, heuristics, and case studies.' },
  ],
  testing: [
    { title: 'Testing JavaScript', url: 'https://testingjavascript.com/', type: 'Guide', note: 'Use the free materials first for testing mindset and patterns.' },
  ],
}

function normalizeForComparison(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9+.#/ ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function canonicalizeSkill(value: string) {
  const normalized = normalizeForComparison(value)

  if (!normalized) {
    return null
  }

  const matchedDefinition = SKILL_TAXONOMY.find((definition) =>
    definition.aliases.some((alias) => normalized === normalizeForComparison(alias))
  )

  return matchedDefinition?.key || null
}

function getSkillLabel(skillKey: string) {
  return (
    SKILL_TAXONOMY.find((definition) => definition.key === skillKey)?.label ||
    skillKey
      .split(' ')
      .map((part) => part.slice(0, 1).toUpperCase() + part.slice(1))
      .join(' ')
  )
}

function dedupeSkills(skills: string[]) {
  return Array.from(new Set(skills.filter(Boolean)))
}

function extractKnownSkills(text: string | null | undefined) {
  const normalized = normalizeForComparison(text || '')

  if (!normalized) {
    return []
  }

  return dedupeSkills(
    SKILL_TAXONOMY
      .filter((definition) =>
        definition.aliases.some((alias) => normalized.includes(normalizeForComparison(alias)))
      )
      .map((definition) => definition.key)
  )
}

function collectCandidateSkills(input: CareerGuidanceInput) {
  const seededSkills = (input.skills || [])
    .map((skill) => canonicalizeSkill(skill) || normalizeForComparison(skill))
    .filter(Boolean) as string[]
  const extractedSkills = [
    ...extractKnownSkills(input.headline),
    ...extractKnownSkills(input.bio),
    ...extractKnownSkills(input.currentTitle),
    ...extractKnownSkills(input.experienceSummary),
    ...extractKnownSkills(input.projectHighlights),
    ...extractKnownSkills(input.resumeText),
  ]

  return dedupeSkills([...seededSkills, ...extractedSkills])
}

function collectJobSkills(job: CareerGuidanceInput['jobs'][number]) {
  return dedupeSkills([
    ...extractKnownSkills(job.title),
    ...extractKnownSkills(job.description),
    ...job.requirements.flatMap((requirement) => extractKnownSkills(requirement)),
  ])
}

function countMatchedKeywords(text: string, keywords: string[]) {
  const normalized = normalizeForComparison(text)

  return keywords.filter((keyword) =>
    normalized.includes(normalizeForComparison(keyword))
  ).length
}

function buildRoleRecommendations(
  input: CareerGuidanceInput,
  candidateSkills: string[],
  matchedJobs: CareerMatchedJob[]
) {
  const candidateSkillSet = new Set(candidateSkills)
  const targetRole = normalizeForComparison(input.targetRole || '')
  const preferredJobTypes = new Set((input.preferredJobTypes || []).map((jobType) => normalizeForComparison(jobType)))
  const supportingText = [
    input.headline,
    input.currentTitle,
    input.experienceSummary,
    input.projectHighlights,
    input.resumeText,
  ]
    .filter(Boolean)
    .join(' ')

  return ROLE_BLUEPRINTS.map((role) => {
    const matchedCoreSkills = role.coreSkills.filter((skill) => candidateSkillSet.has(skill))
    const matchedAdjacentSkills = role.adjacentSkills.filter((skill) => candidateSkillSet.has(skill))
    const missingSkills = role.coreSkills.filter((skill) => !candidateSkillSet.has(skill))
    const keywordHits = countMatchedKeywords(supportingText, role.keywords)
    const matchingJobCount = matchedJobs.filter((job) =>
      role.keywords.some((keyword) => normalizeForComparison(job.title).includes(normalizeForComparison(keyword)))
    ).length
    const preferredTypeBoost = role.jobTypeHints?.some((jobType) => preferredJobTypes.has(normalizeForComparison(jobType)))
      ? 6
      : 0
    const targetRoleBoost =
      targetRole && normalizeForComparison(role.title).includes(targetRole)
        ? 14
        : targetRole && targetRole.includes(normalizeForComparison(role.title))
          ? 14
          : 0

    const fitScore = Math.min(
      98,
      Math.round(
        (matchedCoreSkills.length / Math.max(role.coreSkills.length, 1)) * 64 +
        (matchedAdjacentSkills.length / Math.max(role.adjacentSkills.length, 1)) * 14 +
        Math.min(keywordHits * 5, 10) +
        Math.min(matchingJobCount * 6, 18) +
        preferredTypeBoost +
        targetRoleBoost
      )
    )

    const reasons = [
      matchedCoreSkills.length > 0
        ? `Already aligned with ${matchedCoreSkills.slice(0, 3).map(getSkillLabel).join(', ')}.`
        : `This role is adjacent to your current profile and worth exploring.`,
      matchingJobCount > 0
        ? `${matchingJobCount} open role${matchingJobCount === 1 ? '' : 's'} on LaunchPad overlap with this path.`
        : `Your current profile still maps to transferable skills in this path.`,
      missingSkills.length > 0
        ? `Focus next on ${missingSkills.slice(0, 2).map(getSkillLabel).join(' and ')}.`
        : `You already cover the core foundation for this track.`,
    ]

    return {
      title: role.title,
      fitScore,
      summary: role.summary,
      reasons,
      matchedSkills: dedupeSkills([...matchedCoreSkills, ...matchedAdjacentSkills]).map(getSkillLabel),
      missingSkills: missingSkills.slice(0, 4).map(getSkillLabel),
      matchedJobCount: matchingJobCount,
    }
  })
    .sort((left, right) => right.fitScore - left.fitScore || right.matchedJobCount - left.matchedJobCount)
    .slice(0, 4)
}

function buildMatchedJobs(
  input: CareerGuidanceInput,
  candidateSkills: string[]
) {
  const candidateSkillSet = new Set(candidateSkills)
  const normalizedTargetRole = normalizeForComparison(input.targetRole || '')
  const normalizedLocation = normalizeForComparison(input.location || '')
  const preferredJobTypes = new Set((input.preferredJobTypes || []).map((jobType) => normalizeForComparison(jobType)))

  return input.jobs
    .map((job) => {
      const jobSkills = collectJobSkills(job)
      const matchedSkills = jobSkills.filter((skill) => candidateSkillSet.has(skill))
      const missingSkills = jobSkills.filter((skill) => !candidateSkillSet.has(skill))
      let matchScore = jobSkills.length
        ? Math.round((matchedSkills.length / jobSkills.length) * 100)
        : 0

      if (normalizedTargetRole && normalizeForComparison(job.title).includes(normalizedTargetRole)) {
        matchScore += 12
      }

      if (
        normalizedLocation &&
        job.location &&
        normalizeForComparison(job.location).includes(normalizedLocation)
      ) {
        matchScore += 6
      }

      if (job.jobType && preferredJobTypes.has(normalizeForComparison(job.jobType))) {
        matchScore += 5
      }

      return {
        id: job.id,
        title: job.title,
        company: job.company.name,
        industry: job.company.industry,
        location: job.location,
        jobType: job.jobType,
        salaryMin: job.salaryMin,
        salaryMax: job.salaryMax,
        deadline: job.deadline,
        matchScore: Math.min(matchScore, 99),
        matchedSkills: matchedSkills.slice(0, 5).map(getSkillLabel),
        missingSkills: missingSkills.slice(0, 4).map(getSkillLabel),
      }
    })
    .filter((job) => job.matchScore > 15)
    .sort((left, right) => right.matchScore - left.matchScore)
    .slice(0, 5)
}

function buildSkillGaps(recommendedRoles: CareerRecommendation[]) {
  return recommendedRoles
    .filter((role) => role.missingSkills.length > 0)
    .map((role, index): CareerSkillGap => {
      const priority: CareerSkillGap['priority'] =
        index === 0 || role.fitScore >= 68
          ? 'High'
          : role.fitScore >= 45
            ? 'Medium'
            : 'Explore'

      return {
        role: role.title,
        priority,
        missingSkills: role.missingSkills.slice(0, 4),
        rationale:
          role.fitScore >= 68
            ? `You are already close to this path, so closing these gaps should improve results quickly.`
            : `These skills would make your profile more credible for ${role.title.toLowerCase()} roles.`,
      }
    })
    .slice(0, 3)
}

function buildLearningPath(
  recommendedRoles: CareerRecommendation[],
  matchedJobs: CareerMatchedJob[]
) {
  const skillFrequency = new Map<string, number>()

  recommendedRoles.forEach((role) => {
    role.missingSkills.forEach((skill) => {
      skillFrequency.set(skill, (skillFrequency.get(skill) || 0) + 2)
    })
  })

  matchedJobs.forEach((job) => {
    job.missingSkills.forEach((skill) => {
      skillFrequency.set(skill, (skillFrequency.get(skill) || 0) + 1)
    })
  })

  return Array.from(skillFrequency.entries())
    .sort((left, right) => right[1] - left[1])
    .slice(0, 6)
    .map(([skill, weight], index) => {
      const canonicalSkill = canonicalizeSkill(skill) || normalizeForComparison(skill)
      const resources = LEARNING_RESOURCE_MAP[canonicalSkill] || [
        {
          title: 'Developer roadmap',
          url: 'https://roadmap.sh',
          type: 'Guide' as const,
          note: 'Use this as a structure guide, then pair it with one project.',
        },
      ]

      const stage: CareerLearningStep['stage'] = index < 2 ? 'Now' : index < 4 ? 'Next' : 'Later'

      return {
        skill,
        stage,
        reason:
          weight >= 4
            ? `This shows up repeatedly across your strongest role matches and top jobs.`
            : `This is a useful supporting skill for the next step in your target path.`,
        resources,
      }
    })
}

function buildResumeFeedback(
  input: CareerGuidanceInput,
  candidateSkills: string[],
  recommendedRoles: CareerRecommendation[],
  learningPath: CareerLearningStep[]
): ResumeFeedback {
  let score = 32
  const strengths: string[] = []
  const improvements: string[] = []
  const missingSections: string[] = []
  const rewriteExamples: string[] = []
  const hasProfileLinks = Boolean(input.githubUrl || input.linkedinUrl || input.portfolioUrl)
  const topRole = recommendedRoles[0]?.title || 'target role'
  const topSkillToAdd = learningPath[0]?.skill || 'one role-specific skill'

  if ((input.headline || '').trim()) {
    score += 12
    strengths.push('You already have a professional headline, which helps recruiters scan your profile faster.')
  } else {
    missingSections.push('Professional headline')
    improvements.push(`Add a headline tailored to ${topRole.toLowerCase()} roles instead of leaving your profile generic.`)
  }

  if (candidateSkills.length >= 5) {
    score += 14
    strengths.push(`Your profile already surfaces ${candidateSkills.length} recognizable skills, which gives the recommender useful signal.`)
  } else {
    improvements.push('List more concrete technical skills so recommendations and recruiter search results become sharper.')
  }

  if ((input.experienceSummary || '').trim()) {
    score += 12
    strengths.push('You included an experience summary, which gives helpful context beyond a raw skill list.')
  } else {
    missingSections.push('Experience summary')
    improvements.push('Add a short experience summary that explains what you have built, shipped, or learned.')
  }

  if ((input.projectHighlights || '').trim()) {
    score += 12
    strengths.push('Project highlights are present, which is valuable for students and fresh graduates.')
  } else {
    missingSections.push('Project highlights')
    improvements.push('Add 2-3 recruiter-friendly project highlights with tech stack, ownership, and outcomes.')
  }

  if ((input.resumeText || '').trim().length > 280 || input.resumeUrl) {
    score += 8
    strengths.push('You provided resume content or a resume link, so the feedback can go beyond the basic profile fields.')
  } else {
    missingSections.push('Resume content')
    improvements.push('Paste resume content or attach a resume link so the feedback engine can assess wording and keyword coverage.')
  }

  if (hasProfileLinks) {
    score += 8
    strengths.push('External links like GitHub, LinkedIn, or portfolio improve recruiter trust and evidence of work.')
  } else {
    missingSections.push('Portfolio links')
    improvements.push('Add at least one proof-of-work link such as GitHub, LinkedIn, or a portfolio.')
  }

  if (((input.projectHighlights || '') + ' ' + (input.experienceSummary || '') + ' ' + (input.resumeText || '')).match(/\d/)) {
    score += 8
    strengths.push('Your profile already includes numeric detail, which makes project impact more believable.')
  } else {
    improvements.push('Add metrics where possible, such as response time, users served, accuracy, or completion rates.')
  }

  if ((input.certifications || []).length > 0) {
    score += 6
  }

  rewriteExamples.push(
    `Built a ${topRole.toLowerCase()} project using ${candidateSkills.slice(0, 2).map(getSkillLabel).join(' and ') || 'a focused stack'}, improving <metric> by <number>% through clear ownership and iteration.`
  )
  rewriteExamples.push(
    `Designed and delivered an end-to-end feature, collaborating on requirements, implementation, and testing while strengthening ${topSkillToAdd}.`
  )

  return {
    score: Math.min(score, 96),
    strengths: dedupeSkills(strengths).slice(0, 4),
    improvements: dedupeSkills(improvements).slice(0, 4),
    missingSections: dedupeSkills(missingSections),
    rewriteExamples,
  }
}

export function analyzeCareerGuidance(input: CareerGuidanceInput): CareerGuidanceResponse {
  const candidateSkills = collectCandidateSkills(input)
  const matchedJobs = buildMatchedJobs(input, candidateSkills)
  const recommendedRoles = buildRoleRecommendations(input, candidateSkills, matchedJobs)
  const skillGaps = buildSkillGaps(recommendedRoles)
  const learningPath = buildLearningPath(recommendedRoles, matchedJobs)
  const resumeFeedback = buildResumeFeedback(input, candidateSkills, recommendedRoles, learningPath)
  const signalsUsed = [
    candidateSkills.length > 0 ? 'skills' : '',
    input.headline ? 'headline' : '',
    input.experienceSummary ? 'experience summary' : '',
    input.projectHighlights ? 'project highlights' : '',
    input.resumeText ? 'pasted resume text' : input.resumeUrl ? 'resume URL' : '',
  ].filter(Boolean)

  return {
    source: 'deterministic',
    profileSnapshot: {
      fullName: input.fullName,
      headline: input.headline,
      location: input.location,
      skillCount: candidateSkills.length,
      skills: candidateSkills.map(getSkillLabel),
      preferredJobTypes: input.preferredJobTypes || [],
      resumeIncluded: Boolean(input.resumeText || input.resumeUrl),
      signalsUsed,
    },
    recommendedRoles,
    matchedJobs,
    skillGaps,
    learningPath,
    resumeFeedback,
  }
}
