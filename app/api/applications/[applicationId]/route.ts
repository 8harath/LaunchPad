import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase credentials')
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function PATCH(
  request: NextRequest,
  { params }: { params: { applicationId: string } }
) {
  try {
    const body = await request.json()
    const { status } = body

    if (!status) {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      )
    }

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

    // Get application and verify company admin
    const { data: application, error: fetchError } = await supabase
      .from('applications')
      .select('*, jobs(company_id)')
      .eq('id', params.applicationId)
      .single()

    if (fetchError || !application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      )
    }

    const jobRelation = Array.isArray(application.jobs) ? application.jobs[0] : application.jobs
    const companyId = jobRelation?.company_id

    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('admin_id')
      .eq('id', companyId)
      .single()

    if (companyError || !company || company.admin_id !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    // Update application status
    const { data, error } = await supabase
      .from('applications')
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.applicationId)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Create notification for student
    const { data: student } = await supabase
      .from('student_profiles')
      .select('id')
      .eq('id', application.student_id)
      .single()

    if (student) {
      const messageMap: Record<string, string> = {
        reviewing: 'Your application is being reviewed',
        accepted: 'Congratulations! Your application was accepted',
        rejected: 'Thank you for applying. We will keep your profile in mind for future opportunities',
        offer_extended: 'We are excited to extend an offer to you',
        pending: 'Your application has been submitted',
      }

      await supabase
        .from('notifications')
        .insert([
          {
            user_id: student.id,
            title: `Application Status Updated: ${status.replace('_', ' ').toUpperCase()}`,
            message: messageMap[status] || `Your application status has been updated to ${status}`,
            type: 'application_update',
          },
        ])
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error updating application:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
