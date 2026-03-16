'use client'

import { Suspense, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { MessageSquareMore, Send, Sparkles } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Navbar } from '@/components/navbar'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { Textarea } from '@/components/ui/textarea'

type InboxMessage = {
  id: string
  application_id: string | null
  sender_id: string
  recipient_id: string
  subject: string | null
  body: string
  read: boolean
  created_at: string
  sender: {
    id: string
    full_name: string | null
    email: string
  } | null
  recipient: {
    id: string
    full_name: string | null
    email: string
  } | null
}

function MessagesPageContent() {
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [messages, setMessages] = useState<InboxMessage[]>([])
  const [userId, setUserId] = useState<string>()
  const [userName, setUserName] = useState<string | undefined>()
  const [userRole, setUserRole] = useState<string | undefined>()
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')

  const selectedApplicationIdFromQuery = searchParams.get('applicationId')

  const loadMessages = async (currentUserId: string, preferredApplicationId?: string | null) => {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    const response = await fetch('/api/messages', {
      headers: {
        Authorization: `Bearer ${session?.access_token || ''}`,
      },
    })

    if (!response.ok) {
      throw new Error('Unable to load messages.')
    }

    const payload = await response.json()
    const loadedMessages = payload.messages || []
    setMessages(loadedMessages)

    const threadId = preferredApplicationId || loadedMessages[0]?.application_id
    if (threadId) {
      const unreadIds = loadedMessages
        .filter((message: InboxMessage) => message.application_id === threadId && message.recipient_id === currentUserId && !message.read)
        .map((message: InboxMessage) => message.id)

      if (unreadIds.length > 0) {
        await fetch('/api/messages', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session?.access_token || ''}`,
          },
          body: JSON.stringify({ messageIds: unreadIds }),
        })
      }
    }
  }

  useEffect(() => {
    const loadPage = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          setLoading(false)
          return
        }

        setUserId(user.id)

        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, role')
          .eq('id', user.id)
          .maybeSingle()

        setUserName(profile?.full_name || user.email || undefined)
        setUserRole(profile?.role || undefined)

        await loadMessages(user.id, selectedApplicationIdFromQuery)
      } catch (loadError: any) {
        setError(loadError?.message || 'Unable to load messages.')
      } finally {
        setLoading(false)
      }
    }

    loadPage()
  }, [selectedApplicationIdFromQuery])

  const threads = useMemo(() => {
    const map = new Map<string, InboxMessage[]>()

    messages.forEach((message) => {
      const threadId = message.application_id || message.id
      const existing = map.get(threadId) || []
      existing.push(message)
      map.set(threadId, existing)
    })

    return Array.from(map.entries())
      .map(([applicationId, threadMessages]) => {
        const sorted = [...threadMessages].sort(
          (left, right) => new Date(left.created_at).getTime() - new Date(right.created_at).getTime()
        )
        const latest = sorted[sorted.length - 1]
        const counterpart =
          latest.sender_id === userId ? latest.recipient : latest.sender

        return {
          applicationId,
          messages: sorted,
          latest,
          counterpart,
          unreadCount: sorted.filter((message) => message.recipient_id === userId && !message.read).length,
        }
      })
      .sort(
        (left, right) =>
          new Date(right.latest.created_at).getTime() - new Date(left.latest.created_at).getTime()
      )
  }, [messages, userId])

  const selectedThread =
    threads.find((thread) => thread.applicationId === selectedApplicationIdFromQuery) || threads[0]

  const handleSend = async () => {
    if (!selectedThread?.counterpart?.id || !selectedThread.applicationId || !body.trim()) {
      return
    }

    setSending(true)
    setError('')

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token || ''}`,
        },
        body: JSON.stringify({
          applicationId: selectedThread.applicationId,
          recipientId: selectedThread.counterpart.id,
          subject: subject || selectedThread.latest.subject || '',
          body,
        }),
      })

      if (!response.ok) {
        const payload = await response.json().catch(() => null)
        throw new Error(payload?.error || 'Unable to send message.')
      }

      setBody('')
      await loadMessages(userId || '', selectedThread.applicationId)
    } catch (sendError: any) {
      setError(sendError?.message || 'Unable to send message.')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="ambient-page min-h-screen bg-background">
      <Navbar userRole={userRole} userName={userName} />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="page-hero mb-8 rounded-[2rem] border border-border/80 px-6 py-8 sm:px-8">
          <div className="section-kicker">
            <Sparkles className="h-3.5 w-3.5" />
            Inbox
          </div>
          <h1 className="mt-5 text-4xl font-semibold tracking-[-0.04em] text-foreground">
            Professional conversations between students and recruiters.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
            Keep follow-ups, interview coordination, and application questions in one thread.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Spinner />
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <Card className="rounded-[1.75rem] p-4">
              <div className="border-b border-border/70 px-2 pb-3">
                <h2 className="text-lg font-semibold text-foreground">Conversations</h2>
              </div>
              <div className="mt-3 space-y-2">
                {threads.length > 0 ? (
                  threads.map((thread) => (
                    <Link
                      key={thread.applicationId}
                      href={`/messages?applicationId=${thread.applicationId}`}
                      className={`block rounded-[1.25rem] border p-4 ${
                        thread.applicationId === selectedThread?.applicationId
                          ? 'border-foreground/15 bg-card'
                          : 'border-border/70 bg-background/70'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-medium text-foreground">
                            {thread.counterpart?.full_name || thread.counterpart?.email || 'Conversation'}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {thread.latest.subject || 'Application conversation'}
                          </p>
                        </div>
                        {thread.unreadCount ? (
                          <span className="rounded-full bg-foreground px-2.5 py-1 text-xs text-background">
                            {thread.unreadCount}
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-3 line-clamp-2 text-sm leading-6 text-muted-foreground">
                        {thread.latest.body}
                      </p>
                    </Link>
                  ))
                ) : (
                  <div className="rounded-[1.25rem] border border-dashed border-border/80 bg-background/70 p-5 text-sm text-muted-foreground">
                    No conversations yet. Start from an application card to message a recruiter or candidate.
                  </div>
                )}
              </div>
            </Card>

            <Card className="rounded-[1.75rem] p-6">
              {selectedThread ? (
                <>
                  <div className="border-b border-border/70 pb-4">
                    <p className="text-lg font-semibold text-foreground">
                      {selectedThread.counterpart?.full_name || selectedThread.counterpart?.email || 'Conversation'}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {selectedThread.latest.subject || 'Application conversation'}
                    </p>
                  </div>

                  <div className="mt-5 space-y-3">
                    {selectedThread.messages.map((message) => {
                      const isOwn = message.sender_id === userId
                      return (
                        <div
                          key={message.id}
                          className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[80%] rounded-[1.25rem] px-4 py-3 ${
                              isOwn
                                ? 'bg-foreground text-background'
                                : 'border border-border/70 bg-background text-foreground'
                            }`}
                          >
                            <p className="text-sm leading-6">{message.body}</p>
                            <p
                              className={`mt-2 text-xs ${
                                isOwn ? 'text-background/70' : 'text-muted-foreground'
                              }`}
                            >
                              {new Date(message.created_at).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  <div className="mt-6 space-y-3 border-t border-border/70 pt-5">
                    <Input
                      value={subject}
                      onChange={(event) => setSubject(event.target.value)}
                      placeholder="Subject"
                    />
                    <Textarea
                      value={body}
                      onChange={(event) => setBody(event.target.value)}
                      placeholder="Write your message..."
                      className="min-h-32"
                    />
                    {error ? (
                      <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                        {error}
                      </div>
                    ) : null}
                    <div className="flex justify-end">
                      <Button className="rounded-full" disabled={sending || !body.trim()} onClick={handleSend}>
                        <Send className="h-4 w-4" />
                        {sending ? 'Sending...' : 'Send'}
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex min-h-96 flex-col items-center justify-center text-center">
                  <MessageSquareMore className="h-10 w-10 text-muted-foreground" />
                  <p className="mt-4 text-lg font-semibold text-foreground">No thread selected</p>
                  <p className="mt-2 max-w-md text-sm text-muted-foreground">
                    Start a conversation from a student application or candidate review card.
                  </p>
                </div>
              )}
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}

export default function MessagesPage() {
  return (
    <Suspense
      fallback={
        <div className="ambient-page min-h-screen bg-background">
          <Navbar />
          <div className="flex justify-center py-16">
            <Spinner />
          </div>
        </div>
      }
    >
      <MessagesPageContent />
    </Suspense>
  )
}
