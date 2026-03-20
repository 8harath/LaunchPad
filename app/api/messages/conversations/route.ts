import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser, supabaseAdmin } from '@/lib/server-supabase'

type CreateConversationRequest = {
  applicationId: string
}

export async function GET(request: NextRequest) {
  try {
    const auth = await getAuthenticatedUser(request)
    if (!auth.user) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const { data, error } = await supabaseAdmin
      .from('message_conversations')
      .select(
        `
        id,
        application_id,
        student_id,
        company_id,
        company_admin_id,
        last_message_at,
        created_at,
        updated_at,
        applications:application_id (
          id,
          status,
          job_id,
          jobs:job_id (
            id,
            title
          )
        ),
        student_profile:student_id (
          id,
          profiles:id (
            id,
            full_name,
            email,
            avatar_url
          )
        ),
        company:company_id (
          id,
          name,
          logo_url
        )
        `
      )
      .or(`student_id.eq.${auth.user.id},company_admin_id.eq.${auth.user.id}`)
      .order('last_message_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    const conversations = data || []

    if (!conversations.length) {
      return NextResponse.json({ conversations: [] })
    }

    const conversationIds = conversations.map((conversation) => conversation.id)

    const { data: messageEntries, error: messageError } = await supabaseAdmin
      .from('message_entries')
      .select(
        `
        id,
        conversation_id,
        sender_id,
        body,
        created_at,
        read_at,
        sender:sender_id (
          id,
          full_name,
          email
        )
        `
      )
      .in('conversation_id', conversationIds)
      .order('created_at', { ascending: false })

    if (messageError) {
      return NextResponse.json({ error: messageError.message }, { status: 400 })
    }

    const latestMessageByConversation = new Map<string, any>()
    const unreadCountByConversation = new Map<string, number>()

    for (const entry of messageEntries || []) {
      if (!latestMessageByConversation.has(entry.conversation_id)) {
        latestMessageByConversation.set(entry.conversation_id, entry)
      }

      if (entry.sender_id !== auth.user.id && !entry.read_at) {
        unreadCountByConversation.set(
          entry.conversation_id,
          (unreadCountByConversation.get(entry.conversation_id) || 0) + 1
        )
      }
    }

    return NextResponse.json({
      conversations: conversations.map((conversation) => ({
        ...conversation,
        last_message: latestMessageByConversation.get(conversation.id) || null,
        unread_count: unreadCountByConversation.get(conversation.id) || 0,
      })),
    })
  } catch (error) {
    console.error('Error fetching conversations:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthenticatedUser(request)
    if (!auth.user) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const body: CreateConversationRequest = await request.json()
    if (!body.applicationId) {
      return NextResponse.json({ error: 'applicationId is required' }, { status: 400 })
    }

    const { data: existingConversation } = await supabaseAdmin
      .from('message_conversations')
      .select('id, application_id, student_id, company_id, company_admin_id, last_message_at, created_at, updated_at')
      .eq('application_id', body.applicationId)
      .maybeSingle()

    if (existingConversation) {
      if (
        existingConversation.student_id !== auth.user.id &&
        existingConversation.company_admin_id !== auth.user.id
      ) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }

      return NextResponse.json(existingConversation)
    }

    const { data: application, error: applicationError } = await supabaseAdmin
      .from('applications')
      .select('id, student_id, job_id')
      .eq('id', body.applicationId)
      .single()

    if (applicationError || !application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 })
    }

    const { data: job, error: jobError } = await supabaseAdmin
      .from('jobs')
      .select('id, company_id')
      .eq('id', application.job_id)
      .single()

    if (jobError || !job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    const { data: company, error: companyError } = await supabaseAdmin
      .from('companies')
      .select('id, admin_id')
      .eq('id', job.company_id)
      .single()

    if (companyError || !company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 })
    }

    if (auth.user.id !== application.student_id && auth.user.id !== company.admin_id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const now = new Date().toISOString()
    const { data: conversation, error: conversationError } = await supabaseAdmin
      .from('message_conversations')
      .insert([
        {
          application_id: application.id,
          student_id: application.student_id,
          company_id: company.id,
          company_admin_id: company.admin_id,
          last_message_at: now,
        },
      ])
      .select('id, application_id, student_id, company_id, company_admin_id, last_message_at, created_at, updated_at')
      .single()

    if (conversationError || !conversation) {
      return NextResponse.json(
        { error: conversationError?.message || 'Unable to create conversation' },
        { status: 400 }
      )
    }

    return NextResponse.json(conversation, { status: 201 })
  } catch (error) {
    console.error('Error creating conversation:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
