import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser, supabaseAdmin } from '@/lib/server-supabase'

type SendMessageRequest = {
  conversationId: string
  body: string
}

async function getConversationForUser(conversationId: string, userId: string) {
  const { data: conversation, error } = await supabaseAdmin
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
    .eq('id', conversationId)
    .single()

  if (error || !conversation) {
    return null
  }

  if (conversation.student_id !== userId && conversation.company_admin_id !== userId) {
    return null
  }

  return conversation
}

export async function GET(request: NextRequest) {
  try {
    const auth = await getAuthenticatedUser(request)
    if (!auth.user) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const { searchParams } = request.nextUrl
    const conversationId = searchParams.get('conversationId')
    const before = searchParams.get('before')
    const limitParam = Number(searchParams.get('limit') || 50)
    const limit = Number.isFinite(limitParam)
      ? Math.min(Math.max(limitParam, 1), 100)
      : 50

    if (!conversationId) {
      return NextResponse.json(
        { error: 'conversationId is required' },
        { status: 400 }
      )
    }

    const conversation = await getConversationForUser(conversationId, auth.user.id)
    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
    }

    let query = supabaseAdmin
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
          email,
          avatar_url,
          role
        )
        `
      )
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (before) {
      query = query.lt('created_at', before)
    }

    const { data: messages, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({
      conversation,
      messages: (messages || []).reverse(),
    })
  } catch (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthenticatedUser(request)
    if (!auth.user) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const body: SendMessageRequest = await request.json()
    const trimmedBody = body.body?.trim()

    if (!body.conversationId || !trimmedBody) {
      return NextResponse.json(
        { error: 'conversationId and body are required' },
        { status: 400 }
      )
    }

    if (trimmedBody.length > 4000) {
      return NextResponse.json(
        { error: 'Message body must be 4000 characters or less' },
        { status: 400 }
      )
    }

    const conversation = await getConversationForUser(body.conversationId, auth.user.id)
    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
    }

    const applicationRelation = Array.isArray(conversation.applications)
      ? conversation.applications[0]
      : conversation.applications
    const jobRelation = Array.isArray(applicationRelation?.jobs)
      ? applicationRelation.jobs[0]
      : applicationRelation?.jobs

    const recipientId =
      conversation.student_id === auth.user.id
        ? conversation.company_admin_id
        : conversation.student_id

    const { data: message, error } = await supabaseAdmin
      .from('message_entries')
      .insert([
        {
          conversation_id: body.conversationId,
          sender_id: auth.user.id,
          body: trimmedBody,
        },
      ])
      .select(
        `
        id,
        conversation_id,
        sender_id,
        body,
        created_at,
        read_at
        `
      )
      .single()

    if (error || !message) {
      return NextResponse.json(
        { error: error?.message || 'Unable to send message' },
        { status: 400 }
      )
    }

    await Promise.all([
      supabaseAdmin
        .from('message_conversations')
        .update({
          last_message_at: message.created_at,
          updated_at: message.created_at,
        })
        .eq('id', body.conversationId),
      supabaseAdmin.from('notifications').insert([
        {
          user_id: recipientId,
          title: 'New Message',
          message: `You have a new message about ${jobRelation?.title || 'your application'}`,
          type: 'new_message',
          entity_id: body.conversationId,
          action_url: `/messages?conversationId=${body.conversationId}`,
        },
      ]),
    ])

    return NextResponse.json(message, { status: 201 })
  } catch (error) {
    console.error('Error sending message:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
