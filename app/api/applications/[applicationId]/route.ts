import { NextRequest, NextResponse } from 'next/server'
import { APPLICATION_STATUS_OPTIONS, normalizeApplicationStatus } from '@/lib/recruitment'
import { getAuthorizedUser, serverSupabase } from '@/lib/server-supabase'

const validStatuses = new Set(APPLICATION_STATUS_OPTIONS.map((status) => status.value))

const statusMessages: Record<string, string> = {
  applied: 'Your application has been submitted successfully.',
  under_review: 'A recruiter is reviewing your application.',
  shortlisted: 'You have been shortlisted for the next stage.',
  interview_scheduled: 'Your interview has been scheduled.',
  accepted: 'Congratulations. You have been accepted for this role.',
  rejected: 'This application has been closed. Thank you for your interest.',
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ applicationId: string }> }
) {
  try {
    const { user, error: authError } = await getAuthorizedUser(request)

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const status = normalizeApplicationStatus(body.status)

    if (!validStatuses.has(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    const { applicationId } = await params

    const { data: application, error: fetchError } = await serverSupabase
      .from('applications')
      .select('id, student_id, job_id, jobs:job_id(company_id, title)')
      .eq('id', applicationId)
      .single()

    if (fetchError || !application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 })
    }

    const jobRelation = Array.isArray(application.jobs) ? application.jobs[0] : application.jobs
    const companyId = jobRelation?.company_id

    const { data: company, error: companyError } = await serverSupabase
      .from('companies')
      .select('admin_id, name')
      .eq('id', companyId)
      .single()

    if (companyError || !company || company.admin_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { data, error } = await serverSupabase
      .from('applications')
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', applicationId)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    await serverSupabase.from('notifications').insert([
      {
        user_id: application.student_id,
        title: `Application update: ${APPLICATION_STATUS_OPTIONS.find((item) => item.value === status)?.label}`,
        message: statusMessages[status] || `Your application is now ${status.replace(/_/g, ' ')}.`,
        type: 'application_update',
        entity_id: applicationId,
        action_url: '/dashboard/student',
      },
    ])

    return NextResponse.json({ ...data, status: normalizeApplicationStatus(data.status) })
  } catch (error) {
    console.error('Error updating application:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
