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

    let query = supabase
      .from('applications')
      .select(
        `
        *,
        jobs(id, title, company_id, companies(id, name, logo_url)),
        student_profiles(id, full_name:profiles(full_name), university)
        `
      )

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

    return NextResponse.json({ applications: data, count })
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
