import { NextRequest, NextResponse } from 'next/server'
import { analyzeCareerGuidance } from '@/lib/recruitment'
import { getAuthorizedUser, serverSupabase } from '@/lib/server-supabase'

type CareerGuidanceRequest = {
  resumeText?: string
  targetRole?: string
}

function asSingleRelation<T>(value: T | T[] | null | undefined): T | null {
  if (!value) {
    return null
  }

  return Array.isArray(value) ? value[0] || null : value
}

export async function POST(request: NextRequest) {
  try {
    const { user, error: authError } = await getAuthorizedUser(request)

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = ((await request.json().catch(() => ({}))) || {}) as CareerGuidanceRequest
    const [profileResult, studentProfileResult, jobsResult] = await Promise.all([
      serverSupabase
        .from('profiles')
        .select('id, full_name, bio, role')
        .eq('id', user.id)
        .single(),
      serverSupabase
        .from('student_profiles')
        .select(
          'id, headline, location, current_title, current_company, years_of_experience, experience_summary, project_highlights, certifications, skills, preferred_job_types, resume_url, github_url, linkedin_url, portfolio_url'
        )
        .eq('id', user.id)
        .maybeSingle(),
      serverSupabase
        .from('jobs')
        .select(
          `
          id,
          title,
          description,
          requirements,
          location,
          job_type,
          salary_min,
          salary_max,
          deadline,
          companies:company_id(id, name, industry)
          `
        )
        .eq('status', 'open')
        .order('created_at', { ascending: false })
        .limit(100),
    ])

    if (profileResult.error || !profileResult.data) {
      return NextResponse.json({ error: 'Unable to load profile.' }, { status: 400 })
    }

    if (profileResult.data.role !== 'student' || !studentProfileResult.data) {
      return NextResponse.json(
        { error: 'Career guidance is available for student accounts only.' },
        { status: 403 }
      )
    }

    if (jobsResult.error) {
      return NextResponse.json({ error: jobsResult.error.message }, { status: 400 })
    }

    const studentProfile = studentProfileResult.data
    const jobs = (jobsResult.data || []).map((job) => {
      const company = asSingleRelation(job.companies)

      return {
        id: job.id,
        title: job.title,
        description: job.description,
        requirements: job.requirements || [],
        location: job.location,
        jobType: job.job_type,
        salaryMin: job.salary_min,
        salaryMax: job.salary_max,
        deadline: job.deadline,
        company: {
          id: company?.id || '',
          name: company?.name || 'Unknown company',
          industry: company?.industry || null,
        },
      }
    })

    const guidance = analyzeCareerGuidance({
      fullName: profileResult.data.full_name,
      bio: profileResult.data.bio,
      headline: studentProfile.headline,
      location: studentProfile.location,
      currentTitle: studentProfile.current_title,
      currentCompany: studentProfile.current_company,
      yearsOfExperience: studentProfile.years_of_experience,
      experienceSummary: studentProfile.experience_summary,
      projectHighlights: studentProfile.project_highlights,
      certifications: studentProfile.certifications || [],
      preferredJobTypes: studentProfile.preferred_job_types || [],
      skills: studentProfile.skills || [],
      githubUrl: studentProfile.github_url,
      linkedinUrl: studentProfile.linkedin_url,
      portfolioUrl: studentProfile.portfolio_url,
      resumeUrl: studentProfile.resume_url,
      resumeText: body.resumeText || '',
      targetRole: body.targetRole || '',
      jobs,
    })

    return NextResponse.json(guidance)
  } catch (error) {
    console.error('Error generating career guidance:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
