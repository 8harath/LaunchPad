'use client'

import { useState } from 'react'
import { MessageSquareMore } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

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
  recipientId,
  recipientLabel,
  defaultSubject,
  buttonLabel = 'Message',
  onSent,
}: MessageComposerProps) {
  const [open, setOpen] = useState(false)
  const [subject, setSubject] = useState(defaultSubject || '')
  const [body, setBody] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
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
          applicationId,
          recipientId,
          subject,
          body,
        }),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => null)
        throw new Error(data?.error || 'Unable to send your message right now.')
      }

      setBody('')
      setOpen(false)
      onSent?.()
    } catch (sendError: any) {
      setError(sendError?.message || 'Unable to send your message right now.')
    } finally {
      setSending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="rounded-full">
          <MessageSquareMore className="h-4 w-4" />
          {buttonLabel}
        </Button>
      </DialogTrigger>
      <DialogContent className="rounded-[1.75rem] sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Message {recipientLabel}</DialogTitle>
          <DialogDescription>
            Keep the conversation professional and specific to the application.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <p className="mb-2 text-sm font-medium text-foreground">Subject</p>
            <Input
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
              placeholder="Interview availability, follow-up, next steps..."
            />
          </div>
          <div>
            <p className="mb-2 text-sm font-medium text-foreground">Message</p>
            <Textarea
              value={body}
              onChange={(event) => setBody(event.target.value)}
              placeholder="Write a concise message with the context the other person needs."
              className="min-h-36"
            />
          </div>
          {error ? (
            <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          ) : null}
          <div className="flex justify-end gap-3">
            <Button variant="outline" className="rounded-full" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              className="rounded-full"
              disabled={sending || !body.trim()}
              onClick={handleSubmit}
            >
              {sending ? 'Sending...' : 'Send message'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
