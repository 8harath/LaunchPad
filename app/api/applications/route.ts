import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase credentials')
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const studentId = searchParams.get('studentId')
    const jobId = searchParams.get('jobId')

    let query = supabase.from('applications').select('*', { count: 'exact' })

    if (studentId) {
      query = query.eq('student_id', studentId)
    }
    if (jobId) {
      query = query.eq('job_id', jobId)
    }

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .limit(100)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ applications: [], count: count || 0 })
    }

    const jobIds = [...new Set(data.map((application) => application.job_id))]
    const studentIds = [...new Set(data.map((application) => application.student_id))]

    const [
      { data: jobs, error: jobsError },
      { data: studentProfiles, error: studentProfilesError },
      { data: profiles, error: profilesError },
    ] = await Promise.all([
      supabase
        .from('jobs')
        .select('id, title, company_id')
        .in('id', jobIds),
      supabase
        .from('student_profiles')
        .select('id, university, major, graduation_year, headline, location, current_title, current_company, years_of_experience, experience_summary, project_highlights, certifications, languages, availability_notice_period, skills, preferred_job_types, expected_salary_min, expected_salary_max, resume_url, github_url, linkedin_url, portfolio_url, twitter_url, instagram_url, leetcode_url, devfolio_url')
        .in('id', studentIds),
      supabase
        .from('profiles')
        .select('id, full_name, email, bio, avatar_url')
        .in('id', studentIds),
    ])

    if (jobsError || studentProfilesError || profilesError) {
      return NextResponse.json(
        {
          error:
            jobsError?.message ||
            studentProfilesError?.message ||
            profilesError?.message ||
            'Failed to load application details',
        },
        { status: 400 }
      )
    }

    const companyIds = [...new Set((jobs || []).map((job) => job.company_id))]
    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .select('id, name, logo_url')
      .in('id', companyIds)

    if (companiesError) {
      return NextResponse.json({ error: companiesError.message }, { status: 400 })
    }

    const jobsById = new Map((jobs || []).map((job) => [job.id, job]))
    const companiesById = new Map((companies || []).map((company) => [company.id, company]))
    const studentProfilesById = new Map(
      (studentProfiles || []).map((profile) => [profile.id, profile])
    )
    const profilesById = new Map((profiles || []).map((profile) => [profile.id, profile]))

    const applications = data.map((application) => {
      const job = jobsById.get(application.job_id)
      const company = job ? companiesById.get(job.company_id) : null
      const studentProfile = studentProfilesById.get(application.student_id)
      const profile = profilesById.get(application.student_id)

      return {
        ...application,
        jobs: job
          ? {
              id: job.id,
              title: job.title,
              company_id: job.company_id,
              companies: company
                ? {
                    id: company.id,
                    name: company.name,
                    logo_url: company.logo_url,
                  }
                : null,
            }
          : null,
        student_profiles: studentProfile
          ? {
              id: studentProfile.id,
              university: studentProfile.university,
              major: studentProfile.major,
              graduation_year: studentProfile.graduation_year,
              headline: studentProfile.headline,
              location: studentProfile.location,
              current_title: studentProfile.current_title,
              current_company: studentProfile.current_company,
              years_of_experience: studentProfile.years_of_experience,
              experience_summary: studentProfile.experience_summary,
              project_highlights: studentProfile.project_highlights,
              certifications: studentProfile.certifications,
              languages: studentProfile.languages,
              availability_notice_period: studentProfile.availability_notice_period,
              skills: studentProfile.skills,
              preferred_job_types: studentProfile.preferred_job_types,
              expected_salary_min: studentProfile.expected_salary_min,
              expected_salary_max: studentProfile.expected_salary_max,
              resume_url: studentProfile.resume_url,
              github_url: studentProfile.github_url,
              linkedin_url: studentProfile.linkedin_url,
              portfolio_url: studentProfile.portfolio_url,
              twitter_url: studentProfile.twitter_url,
              instagram_url: studentProfile.instagram_url,
              leetcode_url: studentProfile.leetcode_url,
              devfolio_url: studentProfile.devfolio_url,
              profiles: profile
                ? {
                    full_name: profile.full_name,
                    email: profile.email,
                    bio: profile.bio,
                    avatar_url: profile.avatar_url,
                  }
                : null,
            }
          : null,
      }
    })

    return NextResponse.json({ applications, count: count || applications.length })
  } catch (error) {
    console.error('Error fetching applications:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

type CreateApplicationRequest = {
  jobId: string
  studentId: string
  resumeUrl?: string
  coverLetter?: string
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateApplicationRequest = await request.json()
    const { jobId, studentId, resumeUrl, coverLetter } = body

    // Validate required fields
    if (!jobId || !studentId) {
      return NextResponse.json(
        { error: 'Job ID and Student ID are required' },
        { status: 400 }
      )
    }

    // Check if application already exists
    const { data: existingApp } = await supabase
      .from('applications')
      .select('id')
      .eq('job_id', jobId)
      .eq('student_id', studentId)
      .single()

    if (existingApp) {
      return NextResponse.json(
        { error: 'You have already applied to this job' },
        { status: 409 }
      )
    }

    // Create application
    const { data, error } = await supabase
      .from('applications')
      .insert([
        {
          job_id: jobId,
          student_id: studentId,
          resume_url: resumeUrl || null,
          cover_letter: coverLetter || null,
          status: 'pending',
        },
      ])
      .select('*')
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Create notification for company
    const { data: job } = await supabase
      .from('jobs')
      .select('company_id')
      .eq('id', jobId)
      .single()

    if (job) {
      const { data: company } = await supabase
        .from('companies')
        .select('admin_id')
        .eq('id', job.company_id)
        .single()

      if (company) {
        await supabase
          .from('notifications')
          .insert([
            {
              user_id: company.admin_id,
              title: 'New Application',
              message: `A student has applied to your job posting`,
              type: 'new_application',
            },
          ])
      }
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Error creating application:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
