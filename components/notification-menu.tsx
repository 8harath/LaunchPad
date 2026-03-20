'use client'

import Link from 'next/link'
import { Bell, BriefcaseBusiness, CheckCheck, MessageSquareText } from 'lucide-react'
import { useNotifications } from '@/hooks/use-notifications'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

type NotificationMenuProps = {
  userId?: string
  userRole?: string
}

function getNotificationHref(type: string | null, userRole?: string) {
  if (type === 'new_message') return '/messages'
  if (type === 'new_application') return '/dashboard/company'
  if (type === 'application_update') return '/dashboard/student'

  return userRole === 'company' || userRole === 'admin'
    ? '/dashboard/company'
    : '/dashboard/student'
}

function getNotificationIcon(type: string | null) {
  if (type === 'new_message') return <MessageSquareText className="size-4" />
  return <BriefcaseBusiness className="size-4" />
}

export function NotificationMenu({ userId, userRole }: NotificationMenuProps) {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications(userId)

  if (!userId) {
    return null
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="relative rounded-full">
          <Bell className="size-4" />
          {unreadCount > 0 ? (
            <span className="absolute -right-1 -top-1 flex min-w-5 items-center justify-center rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-semibold text-primary-foreground">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          ) : null}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[22rem] rounded-2xl p-2">
        <div className="flex items-center justify-between px-2 py-1">
          <DropdownMenuLabel className="p-0">Notifications</DropdownMenuLabel>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 rounded-full px-3 text-xs"
            onClick={() => void markAllAsRead()}
          >
            <CheckCheck className="size-3.5" />
            Mark all read
          </Button>
        </div>
        <DropdownMenuSeparator />

        {notifications.length === 0 ? (
          <div className="px-3 py-6 text-center text-sm text-muted-foreground">
            No notifications yet.
          </div>
        ) : (
          notifications.slice(0, 8).map((notification) => (
            <DropdownMenuItem key={notification.id} asChild className="rounded-xl p-0">
              <Link
                href={getNotificationHref(notification.type, userRole)}
                onClick={() => {
                  if (!notification.read) {
                    void markAsRead(notification.id)
                  }
                }}
                className={`flex items-start gap-3 rounded-xl px-3 py-3 ${
                  notification.read ? 'opacity-80' : 'bg-accent/40'
                }`}
              >
                <span className="mt-0.5 rounded-full border border-border bg-background p-2 text-muted-foreground">
                  {getNotificationIcon(notification.type)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-foreground">
                    {notification.title}
                  </span>
                  {notification.message ? (
                    <span className="mt-1 block text-xs leading-5 text-muted-foreground">
                      {notification.message}
                    </span>
                  ) : null}
                  <span className="mt-2 block text-[11px] text-muted-foreground">
                    {new Date(notification.created_at).toLocaleString()}
                  </span>
                </span>
              </Link>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
