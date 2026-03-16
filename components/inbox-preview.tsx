import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export type InboxMessagePreview = {
  id: string
  senderName: string
  recipientName: string
  subject: string | null
  body: string
  createdAt: string
  read: boolean
}

interface InboxPreviewProps {
  title: string
  description: string
  messages: InboxMessagePreview[]
  href: string
}

export function InboxPreview({ title, description, messages, href }: InboxPreviewProps) {
  return (
    <Card className="rounded-[1.75rem] p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-foreground">{title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
        <Button asChild variant="outline" className="rounded-full">
          <Link href={href}>Open inbox</Link>
        </Button>
      </div>

      <div className="mt-5 space-y-3">
        {messages.length > 0 ? (
          messages.slice(0, 4).map((message) => (
            <div
              key={message.id}
              className={cn(
                'rounded-[1.25rem] border p-4',
                message.read ? 'border-border/70 bg-background/75' : 'border-foreground/15 bg-card'
              )}
            >
              <div className="flex items-center justify-between gap-3">
                <p className="font-medium text-foreground">{message.subject || 'New conversation'}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(message.createdAt).toLocaleDateString()}
                </p>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {message.senderName} to {message.recipientName}
              </p>
              <p className="mt-3 line-clamp-2 text-sm leading-6 text-foreground">{message.body}</p>
            </div>
          ))
        ) : (
          <div className="rounded-[1.25rem] border border-dashed border-border/80 bg-background/70 p-5 text-sm text-muted-foreground">
            No messages yet. Conversations with recruiters and students will show up here.
          </div>
        )}
      </div>
    </Card>
  )
}
