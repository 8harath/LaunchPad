'use client'

import Link from 'next/link'
import { Bell } from 'lucide-react'
import { useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import type { Notification } from '@/hooks/use-notifications'

interface NotificationCenterProps {
  notifications: Notification[]
  unreadCount: number
  onMarkAsRead: (notificationId: string) => Promise<void>
  onMarkAllAsRead: () => Promise<void>
}

export function NotificationCenter({
  notifications,
  unreadCount,
  onMarkAsRead,
  onMarkAllAsRead,
}: NotificationCenterProps) {
  const hasUnread = unreadCount > 0
  const visibleNotifications = useMemo(() => notifications.slice(0, 6), [notifications])

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="relative rounded-full text-foreground">
          <Bell className="h-4 w-4" />
          {hasUnread ? (
            <span className="absolute -right-1 -top-1 rounded-full bg-foreground px-1.5 py-0.5 text-[10px] text-background">
              {unreadCount}
            </span>
          ) : null}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-88 rounded-2xl p-2">
        <div className="flex items-center justify-between gap-3 px-2 py-1">
          <DropdownMenuLabel className="px-0">Notifications</DropdownMenuLabel>
          {hasUnread ? (
            <Button variant="ghost" size="sm" className="h-8 rounded-full px-3 text-xs" onClick={() => void onMarkAllAsRead()}>
              Mark all as read
            </Button>
          ) : null}
        </div>
        <DropdownMenuSeparator />

        {visibleNotifications.length > 0 ? (
          visibleNotifications.map((notification) => (
            <DropdownMenuItem
              key={notification.id}
              className="flex cursor-pointer flex-col items-start gap-1 rounded-xl px-3 py-3"
              onSelect={() => {
                void onMarkAsRead(notification.id)
              }}
            >
              {notification.action_url ? (
                <Link href={notification.action_url} className="w-full">
                  <p className="font-medium text-foreground">{notification.title}</p>
                  {notification.message ? (
                    <p className="mt-1 text-sm leading-5 text-muted-foreground">{notification.message}</p>
                  ) : null}
                  <p className="mt-2 text-xs text-muted-foreground">
                    {new Date(notification.created_at).toLocaleDateString()}
                  </p>
                </Link>
              ) : (
                <>
                  <p className="font-medium text-foreground">{notification.title}</p>
                  {notification.message ? (
                    <p className="mt-1 text-sm leading-5 text-muted-foreground">{notification.message}</p>
                  ) : null}
                  <p className="mt-2 text-xs text-muted-foreground">
                    {new Date(notification.created_at).toLocaleDateString()}
                  </p>
                </>
              )}
            </DropdownMenuItem>
          ))
        ) : (
          <div className="px-3 py-6 text-sm text-muted-foreground">
            No notifications yet.
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
