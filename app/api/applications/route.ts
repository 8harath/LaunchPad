import { NextRequest, NextResponse } from 'next/server'
import { getAuthorizedUser, serverSupabase } from '@/lib/server-supabase'
import { normalizeApplicationStatus } from '@/lib/recruitment'

type CreateApplicationRequest = {
  jobId: string
  studentId?: string
  resumeUrl?: string
  coverLetter?: string
  customResponse?: string
}

export async function GET(request: NextRequest) {
  try {
    const { user, error: authError } = await getAuthorizedUser(request)

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const studentId = searchParams.get('studentId')
    const jobId = searchParams.get('jobId')

    if (!studentId && !jobId) {
      return NextResponse.json(
        { error: 'A studentId or jobId filter is required.' },
        { status: 400 }
      )
    }

    if (studentId && user.id !== studentId) {
      const { data: ownedCompany } = await serverSupabase
        .from('companies')
        .select('id')
        .eq('admin_id', user.id)
        .maybeSingle()

      if (!ownedCompany) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
    }

    if (jobId) {
      const { data: job, error: jobError } = await serverSupabase
        .from('jobs')
        .select('id, company_id, companies:company_id(admin_id)')
        .eq('id', jobId)
        .single()

      const ownerId = Array.isArray(job?.companies) ? job?.companies[0]?.admin_id : job?.companies?.admin_id

      if (jobError || !job || ownerId !== user.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
    }

    let query = serverSupabase.from('applications').select('*', { count: 'exact' })

    if (studentId) {
      query = query.eq('student_id', studentId)
    }

    if (jobId) {
      query = query.eq('job_id', jobId)
    }

    const { data, error, count } = await query.order('created_at', { ascending: false }).limit(100)

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
      serverSupabase
        .from('jobs')
        .select('id, title, company_id, location, job_type, salary_min, salary_max, deadline, status')
        .in('id', jobIds),
      serverSupabase
        .from('student_profiles')
        .select('id, university, major, graduation_year, headline, location, current_title, current_company, years_of_experience, experience_summary, project_highlights, certifications, languages, availability_notice_period, skills, preferred_job_types, expected_salary_min, expected_salary_max, resume_url, github_url, linkedin_url, portfolio_url, twitter_url, instagram_url, leetcode_url, devfolio_url')
        .in('id', studentIds),
      serverSupabase
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
    const { data: companies, error: companiesError } = await serverSupabase
      .from('companies')
      .select('id, name, logo_url, location, industry, website, size, admin_id')
      .in('id', companyIds)

    if (companiesError) {
      return NextResponse.json({ error: companiesError.message }, { status: 400 })
    }

    const jobsById = new Map((jobs || []).map((job) => [job.id, job]))
    const companiesById = new Map((companies || []).map((company) => [company.id, company]))
    const studentProfilesById = new Map((studentProfiles || []).map((profile) => [profile.id, profile]))
    const profilesById = new Map((profiles || []).map((profile) => [profile.id, profile]))

    const applications = data.map((application) => {
      const job = jobsById.get(application.job_id)
      const company = job ? companiesById.get(job.company_id) : null
      const studentProfile = studentProfilesById.get(application.student_id)
      const profile = profilesById.get(application.student_id)

      return {
        ...application,
        status: normalizeApplicationStatus(application.status),
        jobs: job
          ? {
              id: job.id,
              title: job.title,
              company_id: job.company_id,
              location: job.location,
              job_type: job.job_type,
              salary_min: job.salary_min,
              salary_max: job.salary_max,
              deadline: job.deadline,
              status: job.status,
              companies: company
                ? {
                    id: company.id,
                    name: company.name,
                    logo_url: company.logo_url,
                    location: company.location,
                    industry: company.industry,
                    website: company.website,
                    size: company.size,
                    admin_id: company.admin_id,
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
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user, error: authError } = await getAuthorizedUser(request)

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body: CreateApplicationRequest = await request.json()
    const { jobId, resumeUrl, coverLetter, customResponse } = body

    if (!jobId) {
      return NextResponse.json({ error: 'Job ID is required' }, { status: 400 })
    }

    const { data: job, error: jobError } = await serverSupabase
      .from('jobs')
      .select('id, title, company_id, companies:company_id(admin_id, name)')
      .eq('id', jobId)
      .single()

    if (jobError || !job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    const { data: studentProfile } = await serverSupabase
      .from('student_profiles')
      .select('id, resume_url')
      .eq('id', user.id)
      .maybeSingle()

    if (!studentProfile) {
      return NextResponse.json({ error: 'Only students can apply for jobs.' }, { status: 403 })
    }

    const { data: existingApp } = await serverSupabase
      .from('applications')
      .select('id')
      .eq('job_id', jobId)
      .eq('student_id', user.id)
      .maybeSingle()

    if (existingApp) {
      return NextResponse.json({ error: 'You have already applied to this job' }, { status: 409 })
    }

    const { data, error } = await serverSupabase
      .from('applications')
      .insert([
        {
          job_id: jobId,
          student_id: user.id,
          resume_url: resumeUrl || studentProfile.resume_url || null,
          cover_letter: coverLetter || null,
          custom_response: customResponse || null,
          status: 'applied',
        },
      ])
      .select('*')
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    const companyRelation = Array.isArray(job.companies) ? job.companies[0] : job.companies

    if (companyRelation?.admin_id) {
      await serverSupabase.from('notifications').insert([
        {
          user_id: companyRelation.admin_id,
          title: 'New application received',
          message: `A student applied for ${job.title}.`,
          type: 'new_application',
          entity_id: data.id,
          action_url: `/dashboard/company/applications/${jobId}`,
        },
      ])
    }

    return NextResponse.json({ ...data, status: normalizeApplicationStatus(data.status) }, { status: 201 })
  } catch (error) {
    console.error('Error creating application:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
