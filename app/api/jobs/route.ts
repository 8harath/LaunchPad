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
    const jobId = searchParams.get('jobId')
    const title = searchParams.get('title')
    const location = searchParams.get('location')
    const companyId = searchParams.get('companyId')

    let query = supabase
      .from('jobs')
      .select(
        `
        *,
        companies:company_id(id, name, logo_url, location, industry, description, website, admin_id),
        applications(id, status)
        `,
        { count: 'exact' }
      )

    if (jobId) {
      query = query.eq('id', jobId)
    } else {
      query = query.eq('status', 'open')
    }

    if (title) {
      query = query.ilike('title', `%${title}%`)
    }
    if (location) {
      query = query.ilike('location', `%${location}%`)
    }
    if (companyId) {
      query = query.eq('company_id', companyId)
    }

    const { data, error, count } = await query.order('created_at', {
      ascending: false,
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ jobs: data, count })
  } catch (error) {
    console.error('Error fetching jobs:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

type CreateJobRequest = {
  title: string
  description: string
  companyId: string
  requirements?: string[]
  salaryMin?: number
  salaryMax?: number
  jobType?: string
  location?: string
  deadline?: string
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateJobRequest = await request.json()
    const {
      title,
      description,
      companyId,
      requirements,
      salaryMin,
      salaryMax,
      jobType,
      location,
      deadline,
    } = body

    // Verify company exists and user is admin
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('id, admin_id')
      .eq('id', companyId)
      .single()

    if (companyError || !company || company.admin_id !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    // Create job
    const { data, error } = await supabase
      .from('jobs')
      .insert([
        {
          company_id: companyId,
          title,
          description,
          requirements: requirements || [],
          salary_min: salaryMin || null,
          salary_max: salaryMax || null,
          job_type: jobType || null,
          location: location || null,
          deadline: deadline || null,
          status: 'open',
        },
      ])
      .select('*')
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Error creating job:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
