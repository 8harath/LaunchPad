import { Navbar } from '@/components/navbar'
import { Card } from '@/components/ui/card'

export default function CommunityPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <Card className="paper rounded-[2rem] border border-border/80 p-8 text-center">
          <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Community</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-foreground">
            Community space is coming soon
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-muted-foreground">
            Messaging is available through application threads now. A broader community layer can
            be added later without changing the current hiring conversation flow.
          </p>
        </Card>
      </section>
    </main>
  )
}
