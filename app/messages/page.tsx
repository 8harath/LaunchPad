'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { MessageSquareText, RefreshCcw, SendHorizonal } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Navbar } from '@/components/navbar'
import { BackButton } from '@/components/back-button'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Textarea } from '@/components/ui/textarea'
import { Spinner } from '@/components/ui/spinner'

type Conversation = {
  id: string
  application_id: string
  student_id: string
  company_id: string
  company_admin_id: string
  last_message_at: string
  created_at: string
  updated_at: string
  title: string
  subtitle: string
}

type Message = {
  id: string
  conversation_id: string
  sender_id: string
  body: string
  created_at: string
  read_at: string | null
  senderName: string
}

function asObject(value: unknown) {
  return Array.isArray(value) ? value[0] : value
}

function normalizeConversation(item: any, userId: string): Conversation {
  const application = asObject(item.applications)
  const job = asObject(application?.jobs)
  const studentProfile = asObject(item.student_profile)
  const student = asObject(studentProfile?.profiles)
  const company = asObject(item.company)
  const counterpartName =
    item.student_id === userId ? company?.name || 'Company' : student?.full_name || 'Student'

  return {
    id: item.id,
    application_id: item.application_id,
    student_id: item.student_id,
    company_id: item.company_id,
    company_admin_id: item.company_admin_id,
    last_message_at: item.last_message_at,
    created_at: item.created_at,
    updated_at: item.updated_at,
    title: counterpartName,
    subtitle: job?.title || 'Application conversation',
  }
}

function normalizeMessage(item: any): Message {
  const sender = asObject(item.sender)

  return {
    id: item.id,
    conversation_id: item.conversation_id,
    sender_id: item.sender_id,
    body: item.body,
    created_at: item.created_at,
    read_at: item.read_at,
    senderName: sender?.full_name || sender?.email || 'User',
  }
}

export default function MessagesPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const bottomRef = useRef<HTMLDivElement | null>(null)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [userId, setUserId] = useState<string>()
  const [userName, setUserName] = useState<string>()
  const [userRole, setUserRole] = useState<string>()
  const [draft, setDraft] = useState('')
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [activeConversationId, setActiveConversationId] = useState<string>()

  const requestedConversationId = searchParams.get('conversationId') || undefined
  const requestedApplicationId = searchParams.get('applicationId') || undefined

  const activeConversation = useMemo(
    () => conversations.find((conversation) => conversation.id === activeConversationId),
    [activeConversationId, conversations]
  )

  useEffect(() => {
    if (!messages.length) return
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    const ensureConversation = async (token: string) => {
      if (requestedConversationId) {
        return requestedConversationId
      }

      if (!requestedApplicationId) {
        return undefined
      }

      const response = await fetch('/api/messages/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ applicationId: requestedApplicationId }),
      })

      if (!response.ok) {
        return undefined
      }

      const data = await response.json()
      return data.id as string | undefined
    }

    const loadConversations = async (
      token: string,
      currentUserId: string,
      preferredConversationId?: string
    ) => {
      const response = await fetch('/api/messages/conversations', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        return
      }

      const data = await response.json()
      const normalized = ((data.conversations || []) as any[]).map((item) =>
        normalizeConversation(item, currentUserId)
      )

      setConversations(normalized)

      const initialConversationId =
        preferredConversationId ||
        requestedConversationId ||
        normalized[0]?.id

      if (initialConversationId) {
        setActiveConversationId(initialConversationId)
        await loadMessages(token, initialConversationId)
      }
    }

    const loadMessages = async (token: string, conversationId: string) => {
      const response = await fetch(`/api/messages?conversationId=${conversationId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        return
      }

      const data = await response.json()
      setMessages(((data.messages || []) as any[]).map(normalizeMessage))

      await fetch(`/api/messages/conversations/${conversationId}/read`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
    }

    const bootstrap = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          router.push('/auth/login')
          return
        }

        setUserId(user.id)

        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, role')
          .eq('id', user.id)
          .single()

        setUserName(profile?.full_name || user.email || undefined)
        setUserRole(profile?.role || undefined)

        const {
          data: { session },
        } = await supabase.auth.getSession()

        const token = session?.access_token
        if (!token) {
          router.push('/auth/login')
          return
        }

        const conversationId = await ensureConversation(token)
        await loadConversations(token, user.id, conversationId)
      } catch (error) {
        console.error('Error loading messages:', error)
      } finally {
        setLoading(false)
      }
    }

    void bootstrap()
  }, [requestedApplicationId, requestedConversationId, router])

  useEffect(() => {
    if (!userId || !activeConversationId) return

    const interval = window.setInterval(async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        const token = session?.access_token
        if (!token) return

        const [conversationResponse, messageResponse] = await Promise.all([
          fetch('/api/messages/conversations', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`/api/messages?conversationId=${activeConversationId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ])

        if (conversationResponse.ok) {
          const conversationData = await conversationResponse.json()
          setConversations(
            ((conversationData.conversations || []) as any[]).map((item) =>
              normalizeConversation(item, userId)
            )
          )
        }

        if (messageResponse.ok) {
          const messageData = await messageResponse.json()
          setMessages(((messageData.messages || []) as any[]).map(normalizeMessage))
          await fetch(`/api/messages/conversations/${activeConversationId}/read`, {
            method: 'PATCH',
            headers: { Authorization: `Bearer ${token}` },
          })
        }
      } catch (error) {
        console.error('Error refreshing messages:', error)
      }
    }, 20000)

    return () => window.clearInterval(interval)
  }, [activeConversationId, userId])

  const handleConversationSelect = async (conversationId: string) => {
    setActiveConversationId(conversationId)
    router.replace(`/messages?conversationId=${conversationId}`)

    const {
      data: { session },
    } = await supabase.auth.getSession()

    const token = session?.access_token
    if (!token) return

    const response = await fetch(`/api/messages?conversationId=${conversationId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })

    if (!response.ok) return

    const data = await response.json()
    setMessages(((data.messages || []) as any[]).map(normalizeMessage))
    await fetch(`/api/messages/conversations/${conversationId}/read`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
    })
  }

  const handleRefresh = async () => {
    setRefreshing(true)

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      const token = session?.access_token
      if (!token || !userId) return

      const conversationResponse = await fetch('/api/messages/conversations', {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (conversationResponse.ok) {
        const conversationData = await conversationResponse.json()
        setConversations(
          ((conversationData.conversations || []) as any[]).map((item) =>
            normalizeConversation(item, userId)
          )
        )
      }

      if (activeConversationId) {
        await handleConversationSelect(activeConversationId)
      }
    } catch (error) {
      console.error('Error refreshing inbox:', error)
    } finally {
      setRefreshing(false)
    }
  }

  const handleSend = async () => {
    if (!draft.trim() || !activeConversationId) return

    setSending(true)

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      const token = session?.access_token
      if (!token) return

      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          conversationId: activeConversationId,
          body: draft.trim(),
        }),
      })

      if (!response.ok) return

      setDraft('')
      await handleConversationSelect(activeConversationId)
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar userRole={userRole} userName={userName} />
        <div className="flex items-center justify-center py-16">
          <Spinner />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar userRole={userRole} userName={userName} />
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <BackButton
              fallbackHref={userRole === 'company' ? '/dashboard/company' : '/dashboard/student'}
              className="mb-4 rounded-full"
            />
            <h1 className="text-4xl font-semibold tracking-[-0.04em] text-foreground">
              Messages
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Polling refresh runs every 20 seconds, with manual refresh whenever you need it.
            </p>
          </div>

          <Button
            variant="outline"
            className="rounded-full"
            onClick={() => void handleRefresh()}
            disabled={refreshing}
          >
            <RefreshCcw className={`size-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh inbox
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-[22rem_minmax(0,1fr)]">
          <Card className="overflow-hidden rounded-[1.75rem] border border-border/70 bg-card/90 p-0">
            <div className="border-b border-border/70 px-5 py-4">
              <p className="text-sm font-medium text-foreground">Conversations</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {conversations.length} active {conversations.length === 1 ? 'thread' : 'threads'}
              </p>
            </div>

            <ScrollArea className="h-[34rem]">
              <div className="space-y-2 p-3">
                {conversations.length === 0 ? (
                  <div className="rounded-[1.25rem] border border-dashed border-border/80 px-4 py-8 text-center text-sm text-muted-foreground">
                    No conversations yet. Open one from an application card.
                  </div>
                ) : (
                  conversations.map((conversation) => (
                    <button
                      key={conversation.id}
                      onClick={() => void handleConversationSelect(conversation.id)}
                      className={`w-full rounded-[1.25rem] border px-4 py-4 text-left transition-colors ${
                        conversation.id === activeConversationId
                          ? 'border-primary/40 bg-accent/50'
                          : 'border-border/70 bg-background hover:bg-muted/40'
                      }`}
                    >
                      <p className="text-sm font-semibold text-foreground">{conversation.title}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{conversation.subtitle}</p>
                      <p className="mt-3 text-[11px] text-muted-foreground">
                        Updated {new Date(conversation.last_message_at).toLocaleString()}
                      </p>
                    </button>
                  ))
                )}
              </div>
            </ScrollArea>
          </Card>

          <Card className="flex min-h-[34rem] flex-col overflow-hidden rounded-[1.75rem] border border-border/70 bg-card/90">
            {activeConversation ? (
              <>
                <div className="border-b border-border/70 px-6 py-5">
                  <p className="text-lg font-semibold text-foreground">{activeConversation.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{activeConversation.subtitle}</p>
                </div>

                <ScrollArea className="flex-1 px-6 py-5">
                  <div className="space-y-4">
                    {messages.length === 0 ? (
                      <div className="rounded-[1.25rem] border border-dashed border-border/80 px-4 py-8 text-center text-sm text-muted-foreground">
                        Start the conversation with a quick introduction or a hiring update.
                      </div>
                    ) : (
                      messages.map((message) => {
                        const isMine = message.sender_id === userId

                        return (
                          <div
                            key={message.id}
                            className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-[80%] rounded-[1.5rem] px-4 py-3 ${
                                isMine
                                  ? 'bg-primary text-primary-foreground'
                                  : 'border border-border/70 bg-background text-foreground'
                              }`}
                            >
                              <p className="text-xs font-medium opacity-80">
                                {isMine ? 'You' : message.senderName}
                              </p>
                              <p className="mt-1 whitespace-pre-wrap text-sm leading-6">
                                {message.body}
                              </p>
                              <p className="mt-2 text-[11px] opacity-75">
                                {new Date(message.created_at).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        )
                      })
                    )}
                    <div ref={bottomRef} />
                  </div>
                </ScrollArea>

                <div className="border-t border-border/70 px-6 py-5">
                  <div className="space-y-3">
                    <Textarea
                      value={draft}
                      onChange={(event) => setDraft(event.target.value)}
                      placeholder="Write a message"
                      className="min-h-28 rounded-[1.25rem] bg-background"
                    />
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xs text-muted-foreground">
                        Keep it professional. This thread is tied to the application.
                      </p>
                      <Button
                        className="rounded-full"
                        onClick={() => void handleSend()}
                        disabled={sending || !draft.trim()}
                      >
                        <SendHorizonal className="size-4" />
                        {sending ? 'Sending...' : 'Send'}
                      </Button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
                <div className="rounded-full border border-border/70 bg-muted/40 p-4 text-muted-foreground">
                  <MessageSquareText className="size-7" />
                </div>
                <h2 className="mt-4 text-xl font-semibold text-foreground">Your inbox is ready</h2>
                <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                  Start from one of your applications to open a conversation, then come back here
                  to continue the thread.
                </p>
                <Button asChild className="mt-6 rounded-full">
                  <Link href={userRole === 'company' ? '/dashboard/company' : '/dashboard/student'}>
                    Go back to dashboard
                  </Link>
                </Button>
              </div>
            )}
          </Card>
        </div>
      </main>
    </div>
  )
}
