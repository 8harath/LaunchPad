import { NextRequest, NextResponse } from 'next/server'
import { JOB_STATUS_OPTIONS } from '@/lib/recruitment'
import { getAuthorizedUser, serverSupabase } from '@/lib/server-supabase'

type CreateJobRequest = {
  title: string
  description: string
  companyId: string
  requirements?: string[]
  salaryMin?: number | null
  salaryMax?: number | null
  jobType?: string | null
  location?: string | null
  deadline?: string | null
  status?: string
}

const validJobStatuses = new Set<string>(JOB_STATUS_OPTIONS.map((option) => option.value))

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const jobId = searchParams.get('jobId')
    const title = searchParams.get('title')
    const location = searchParams.get('location')
    const companyId = searchParams.get('companyId')

    let query = serverSupabase
      .from('jobs')
      .select(
        `
        *,
        companies:company_id(id, name, logo_url, location, industry, description, website, size, admin_id),
        applications(id, status)
        `,
        { count: 'exact' }
      )

    if (jobId) {
      query = query.eq('id', jobId)
    } else if (!companyId) {
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
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user, error: authError } = await getAuthorizedUser(request)

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

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
      status,
    } = body

    if (!title?.trim() || !description?.trim() || !companyId) {
      return NextResponse.json(
        { error: 'Title, description, and company are required.' },
        { status: 400 }
      )
    }

    const { data: company, error: companyError } = await serverSupabase
      .from('companies')
      .select('id, admin_id, name')
      .eq('id', companyId)
      .single()

    if (companyError || !company || company.admin_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { data, error } = await serverSupabase
      .from('jobs')
      .insert([
        {
          company_id: companyId,
          title: title.trim(),
          description: description.trim(),
          requirements: requirements || [],
          salary_min: salaryMin || null,
          salary_max: salaryMax || null,
          job_type: jobType?.trim() || null,
          location: location?.trim() || null,
          deadline: deadline || null,
          status: validJobStatuses.has(status || '') ? (status as 'open' | 'closed' | 'filled') : 'open',
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
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { user, error: authError } = await getAuthorizedUser(request)

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = (await request.json()) as CreateJobRequest & { jobId: string }
    const { jobId, companyId, title, description, requirements, salaryMin, salaryMax, jobType, location, deadline, status } = body

    if (!jobId || !companyId) {
      return NextResponse.json({ error: 'Job ID and company are required.' }, { status: 400 })
    }

    const { data: company, error: companyError } = await serverSupabase
      .from('companies')
      .select('id, admin_id')
      .eq('id', companyId)
      .single()

    if (companyError || !company || company.admin_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const payload: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    }

    if (typeof title === 'string') payload.title = title.trim()
    if (typeof description === 'string' && description.trim()) payload.description = description.trim()
    if (requirements) payload.requirements = requirements
    if (salaryMin !== undefined) payload.salary_min = salaryMin || null
    if (salaryMax !== undefined) payload.salary_max = salaryMax || null
    if (typeof jobType === 'string') payload.job_type = jobType.trim() || null
    if (typeof location === 'string') payload.location = location.trim() || null
    if (deadline !== undefined) payload.deadline = deadline || null
    if (status && validJobStatuses.has(status)) {
      payload.status = status as 'open' | 'closed' | 'filled'
    }

    const { data, error } = await serverSupabase
      .from('jobs')
      .update(payload)
      .eq('id', jobId)
      .eq('company_id', companyId)
      .select('*')
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error updating job:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
