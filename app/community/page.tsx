'use client'

import { useEffect, useState } from 'react'
import { BookOpenText, Sparkles, Users } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Navbar } from '@/components/navbar'
import { CareerInsightsBoard } from '@/components/career-insights-board'
import { Card } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'

type CommunityPayload = {
  reviews: {
    id: string
    company_name: string
    reviewer_name: string
    reviewer_role: string | null
    rating: number
    title: string
    review: string
    outcome: string | null
  }[]
  stories: {
    id: string
    name: string
    role: string
    company: string
    story: string
    advice: string | null
  }[]
  insights: {
    id: string
    category: string
    title: string
    summary: string
    takeaway: string | null
  }[]
}

export default function CommunityPage() {
  const [loading, setLoading] = useState(true)
  const [userRole, setUserRole] = useState<string | undefined>()
  const [userName, setUserName] = useState<string | undefined>()
  const [community, setCommunity] = useState<CommunityPayload>({
    reviews: [],
    stories: [],
    insights: [],
  })

  useEffect(() => {
    const loadPage = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, role')
            .eq('id', user.id)
            .maybeSingle()

          setUserName(profile?.full_name || user.email || undefined)
          setUserRole(profile?.role || undefined)
        }

        const response = await fetch('/api/community')
        if (response.ok) {
          setCommunity(await response.json())
        }
      } finally {
        setLoading(false)
      }
    }

    loadPage()
  }, [])

  return (
    <div className="ambient-page min-h-screen bg-background">
      <Navbar userRole={userRole} userName={userName} />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="page-hero mb-8 rounded-[2rem] border border-border/80 px-6 py-8 sm:px-8">
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div>
              <div className="section-kicker">
                <Sparkles className="h-3.5 w-3.5" />
                Community and guidance
              </div>
              <h1 className="mt-5 text-4xl font-semibold tracking-[-0.04em] text-foreground">
                Learn how candidates got hired and how teams actually evaluate them.
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
                Read company feedback, student outcomes, and practical hiring advice in one place.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <Card className="rounded-[1.5rem] p-5">
                <Users className="h-5 w-5 text-foreground" />
                <p className="mt-4 text-2xl font-semibold text-foreground">{community.reviews.length}</p>
                <p className="mt-1 text-sm text-muted-foreground">Company reviews</p>
              </Card>
              <Card className="rounded-[1.5rem] p-5">
                <Sparkles className="h-5 w-5 text-foreground" />
                <p className="mt-4 text-2xl font-semibold text-foreground">{community.stories.length}</p>
                <p className="mt-1 text-sm text-muted-foreground">Success stories</p>
              </Card>
              <Card className="rounded-[1.5rem] p-5">
                <BookOpenText className="h-5 w-5 text-foreground" />
                <p className="mt-4 text-2xl font-semibold text-foreground">{community.insights.length}</p>
                <p className="mt-1 text-sm text-muted-foreground">Hiring insights</p>
              </Card>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-14">
            <Spinner />
          </div>
        ) : (
          <CareerInsightsBoard
            reviews={community.reviews}
            stories={community.stories}
            insights={community.insights}
          />
        )}
      </main>
    </div>
  )
}
