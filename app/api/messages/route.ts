import { NextRequest, NextResponse } from 'next/server'
import { getAuthorizedUser, serverSupabase } from '@/lib/server-supabase'

type MessageRequestBody = {
  recipientId: string
  applicationId: string
  subject?: string
  body: string
}

export async function GET(request: NextRequest) {
  try {
    const { user, error: authError } = await getAuthorizedUser(request)

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const applicationId = request.nextUrl.searchParams.get('applicationId')

    let query = serverSupabase
      .from('messages')
      .select('*')
      .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
      .order('created_at', { ascending: false })
      .limit(100)

    if (applicationId) {
      query = query.eq('application_id', applicationId)
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    if (!data?.length) {
      return NextResponse.json({ messages: [] })
    }

    const profileIds = [...new Set(data.flatMap((message) => [message.sender_id, message.recipient_id]))]

    const { data: profiles, error: profilesError } = await serverSupabase
      .from('profiles')
      .select('id, full_name, email')
      .in('id', profileIds)

    if (profilesError) {
      return NextResponse.json({ error: profilesError.message }, { status: 400 })
    }

    const profilesById = new Map((profiles || []).map((profile) => [profile.id, profile]))

    const messages = data
      .slice()
      .reverse()
      .map((message) => ({
        ...message,
        sender: profilesById.get(message.sender_id)
          ? {
              id: message.sender_id,
              full_name: profilesById.get(message.sender_id)?.full_name,
              email: profilesById.get(message.sender_id)?.email,
            }
          : null,
        recipient: profilesById.get(message.recipient_id)
          ? {
              id: message.recipient_id,
              full_name: profilesById.get(message.recipient_id)?.full_name,
              email: profilesById.get(message.recipient_id)?.email,
            }
          : null,
      }))

    return NextResponse.json({ messages })
  } catch (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user, error: authError } = await getAuthorizedUser(request)

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = (await request.json()) as MessageRequestBody

    if (!body.recipientId || !body.applicationId || !body.body?.trim()) {
      return NextResponse.json(
        { error: 'Recipient, application, and message body are required.' },
        { status: 400 }
      )
    }

    const { data: application, error: applicationError } = await serverSupabase
      .from('applications')
      .select('id, student_id, job_id')
      .eq('id', body.applicationId)
      .single()

    if (applicationError || !application) {
      return NextResponse.json({ error: 'Application not found.' }, { status: 404 })
    }

    const { data: job, error: jobError } = await serverSupabase
      .from('jobs')
      .select('id, title, company_id')
      .eq('id', application.job_id)
      .single()

    if (jobError || !job) {
      return NextResponse.json({ error: 'Related job not found.' }, { status: 404 })
    }

    const { data: company, error: companyError } = await serverSupabase
      .from('companies')
      .select('admin_id, name')
      .eq('id', job.company_id)
      .single()

    if (companyError || !company) {
      return NextResponse.json({ error: 'Related company not found.' }, { status: 404 })
    }

    const studentId = application.student_id
    const recruiterId = company.admin_id
    const isAuthorizedParticipant =
      [studentId, recruiterId].includes(user.id) &&
      [studentId, recruiterId].includes(body.recipientId)

    if (!isAuthorizedParticipant) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { data, error } = await serverSupabase
      .from('messages')
      .insert([
        {
          sender_id: user.id,
          recipient_id: body.recipientId,
          application_id: body.applicationId,
          job_id: application.job_id,
          subject: body.subject?.trim() || null,
          body: body.body.trim(),
          read: false,
        },
      ])
      .select('*')
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    await serverSupabase.from('notifications').insert([
      {
        user_id: body.recipientId,
        title: 'New message',
        message: body.subject?.trim() || `You have a new conversation update for ${job.title}.`,
        type: 'message',
        entity_id: data.id,
        action_url: `/messages?applicationId=${body.applicationId}`,
      },
    ])

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Error creating message:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { user, error: authError } = await getAuthorizedUser(request)

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = (await request.json()) as { messageIds: string[] }
    const messageIds = body.messageIds || []

    if (!messageIds.length) {
      return NextResponse.json({ error: 'No messages provided.' }, { status: 400 })
    }

    const { error } = await serverSupabase
      .from('messages')
      .update({ read: true, updated_at: new Date().toISOString() })
      .eq('recipient_id', user.id)
      .in('id', messageIds)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating messages:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
