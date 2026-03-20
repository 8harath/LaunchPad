'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MessageSquareMore } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'

interface MessageComposerProps {
  applicationId: string
  recipientId: string
  recipientLabel: string
  defaultSubject?: string
  buttonLabel?: string
  onSent?: () => void
}

export function MessageComposer({
  applicationId,
  recipientLabel,
  buttonLabel = 'Message',
  onSent,
}: MessageComposerProps) {
  const router = useRouter()
  const [opening, setOpening] = useState(false)
  const [error, setError] = useState('')

  const handleOpenConversation = async () => {
    setOpening(true)
    setError('')

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      const token = session?.access_token
      if (!token) {
        router.push('/auth/login')
        return
      }

      const response = await fetch('/api/messages/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          applicationId,
        }),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => null)
        throw new Error(data?.error || 'Unable to open your conversation right now.')
      }

      const conversation = await response.json()
      onSent?.()
      router.push(`/messages?conversationId=${conversation.id}`)
    } catch (sendError: any) {
      setError(sendError?.message || 'Unable to open your conversation right now.')
    } finally {
      setOpening(false)
    }
  }

  return (
    <div className="space-y-2">
      <Button
        variant="outline"
        className="rounded-full"
        disabled={opening}
        onClick={() => void handleOpenConversation()}
      >
        <MessageSquareMore className="h-4 w-4" />
        {opening ? 'Opening...' : buttonLabel}
      </Button>
      {error ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error || `Unable to open the conversation with ${recipientLabel}.`}
        </div>
      ) : null}
    </div>
  )
}
