import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser, supabaseAdmin } from '@/lib/server-supabase'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    const { conversationId } = await params
    const auth = await getAuthenticatedUser(request)
    if (!auth.user) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const { data: conversation, error: conversationError } = await supabaseAdmin
      .from('message_conversations')
      .select('id, student_id, company_admin_id')
      .eq('id', conversationId)
      .single()

    if (conversationError || !conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
    }

    if (
      conversation.student_id !== auth.user.id &&
      conversation.company_admin_id !== auth.user.id
    ) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const now = new Date().toISOString()
    const { error } = await supabaseAdmin
      .from('message_entries')
      .update({ read_at: now })
      .eq('conversation_id', conversationId)
      .neq('sender_id', auth.user.id)
      .is('read_at', null)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, readAt: now })
  } catch (error) {
    console.error('Error marking messages as read:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
