import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables.')
  process.exit(1)
}

// Demo credentials – change these in production if needed
const ADMIN_EMAIL = 'admin@launchpad.test'
const ADMIN_PASSWORD = 'Admin123!'

const COMPANY_EMAIL = 'recruiter@launchpad.test'
const COMPANY_PASSWORD = 'Recruiter123!'

const STUDENT_EMAIL = 'student@launchpad.test'
const STUDENT_PASSWORD = 'Student123!'

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

async function upsertProfile(userId, email, fullName, role) {
  const { error } = await supabase
    .from('profiles')
    .upsert(
      {
        id: userId,
        email,
        full_name: fullName,
        role,
      },
      { onConflict: 'id' }
    )

  if (error) {
    throw new Error(`Failed to upsert profile for ${email}: ${error.message}`)
  }
}

async function createOrGetUser(email, password, fullName, role) {
  // Try to find existing auth user
  const { data: existing, error: listError } = await supabase.auth.admin.listUsers({
    page: 1,
    perPage: 100,
  })

  if (listError) {
    throw listError
  }

  const found = existing.users.find((u) => u.email === email)
  if (found) {
    await upsertProfile(found.id, email, fullName, role)
    return found
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (error) {
    throw new Error(`Failed to create auth user for ${email}: ${error.message}`)
  }

  await upsertProfile(data.user.id, email, fullName, role)
  return data.user
}

async function main() {
  try {
    console.log('Seeding demo data...')

    // 1. Admin user (single global admin)
    const adminUser = await createOrGetUser(ADMIN_EMAIL, ADMIN_PASSWORD, 'Platform Admin', 'admin')
    console.log('Admin user ready:', ADMIN_EMAIL)

    // 2. Company recruiter user + company
    const companyUser = await createOrGetUser(
      COMPANY_EMAIL,
      COMPANY_PASSWORD,
      'Acme Recruiter',
      'company'
    )
    console.log('Company recruiter user ready:', COMPANY_EMAIL)

    // Create or get company
    let company
    {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('admin_id', companyUser.id)
        .maybeSingle()

      if (error) {
        throw new Error(`Failed to read company for recruiter: ${error.message}`)
      }

      if (data) {
        company = data
      } else {
        const { data: inserted, error: insertError } = await supabase
          .from('companies')
          .insert([
            {
              name: 'Acme Tech',
              admin_id: companyUser.id,
              industry: 'Software',
              location: 'Remote',
              description: 'Building tools for hackathon teams and early-stage startups.',
              website: 'https://www.carthik.tech',
            },
          ])
          .select('*')
          .single()

        if (insertError) {
          throw new Error(`Failed to create demo company: ${insertError.message}`)
        }
        company = inserted
      }
    }

    console.log('Company ready:', company.name)

    // 3. Student user + student profile
    const studentUser = await createOrGetUser(
      STUDENT_EMAIL,
      STUDENT_PASSWORD,
      'Demo Student',
      'student'
    )
    console.log('Student user ready:', STUDENT_EMAIL)

    {
      const { data, error } = await supabase
        .from('student_profiles')
        .select('*')
        .eq('id', studentUser.id)
        .maybeSingle()

      if (error) {
        throw new Error(`Failed to read student profile: ${error.message}`)
      }

      if (!data) {
        const { error: insertError } = await supabase.from('student_profiles').insert([
          {
            id: studentUser.id,
            university: 'Demo University',
            major: 'Computer Science',
            graduation_year: new Date().getFullYear() + 1,
            skills: ['React', 'TypeScript', 'Node.js'],
          },
        ])

        if (insertError) {
          throw new Error(`Failed to create demo student profile: ${insertError.message}`)
        }
      }
    }

    // 4. Seed jobs
    const demoJobs = [
      {
        title: 'Frontend Engineer (Hackathon Platform)',
        description:
          'Work on the LaunchPad hackathon platform frontend using React, Next.js, and Tailwind CSS.',
        location: 'Remote',
        job_type: 'Full-time',
        salary_min: 80000,
        salary_max: 120000,
        requirements: [
          'Strong React and TypeScript experience',
          'Familiarity with Next.js and Tailwind CSS',
          'Comfortable working in fast-paced hackathon environments',
        ],
      },
      {
        title: 'Backend Engineer (Supabase / Postgres)',
        description:
          'Design and maintain backend services and Supabase database schema for the LaunchPad platform.',
        location: 'Remote',
        job_type: 'Full-time',
        salary_min: 90000,
        salary_max: 130000,
        requirements: [
          'Experience with Node.js and SQL',
          'Comfortable with Supabase or PostgreSQL',
          'Understanding of authentication and authorization',
        ],
      },
      {
        title: 'Developer Relations Intern',
        description:
          'Help hackathon participants be successful on LaunchPad by creating tutorials, guides, and sample projects.',
        location: 'Remote',
        job_type: 'Internship',
        salary_min: null,
        salary_max: null,
        requirements: [
          'Good communication skills',
          'Enjoy teaching and writing',
          'Experience participating in hackathons',
        ],
      },
    ]

    for (const job of demoJobs) {
      const { error } = await supabase.from('jobs').insert([
        {
          company_id: company.id,
          title: job.title,
          description: job.description,
          location: job.location,
          job_type: job.job_type,
          salary_min: job.salary_min,
          salary_max: job.salary_max,
          requirements: job.requirements,
          status: 'open',
        },
      ])

      if (error) {
        console.error(`Failed to insert job "${job.title}":`, error.message)
      } else {
        console.log('Job seeded:', job.title)
      }
    }

    // 5. Create at least one application from the demo student
    const { data: existingJobs, error: jobsError } = await supabase
      .from('jobs')
      .select('id')
      .eq('company_id', company.id)
      .limit(1)

    if (jobsError) {
      throw new Error(`Failed to fetch jobs for applications: ${jobsError.message}`)
    }

    if (existingJobs && existingJobs.length > 0) {
      const jobId = existingJobs[0].id

      const { error: appError } = await supabase.from('applications').insert([
        {
          job_id: jobId,
          student_id: studentUser.id,
          status: 'pending',
          cover_letter:
            'I am excited to contribute to LaunchPad and help other students succeed at hackathons.',
        },
      ])

      if (appError) {
        console.error('Failed to create demo application (may already exist):', appError.message)
      } else {
        console.log('Demo application created for student.')
      }
    }

    console.log('\nSeeding complete.\n')
    console.log('You can now log in with:')
    console.log(`Admin:    ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`)
    console.log(`Company:  ${COMPANY_EMAIL} / ${COMPANY_PASSWORD}`)
    console.log(`Student:  ${STUDENT_EMAIL} / ${STUDENT_PASSWORD}`)
  } catch (err) {
    console.error('Error while seeding data:', err)
    process.exit(1)
  }
}

main()

