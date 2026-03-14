'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border/40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="font-semibold text-foreground">LaunchPad</div>
          <div className="flex gap-2">
            <Link href="/auth/login">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                Sign in
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                Get started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="space-y-6 text-center">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-semibold text-balance leading-tight text-foreground">
              Launch your career at hackathons
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Connect with top companies, showcase your skills, and land amazing opportunities. All in one place.
            </p>
          </div>

          <div className="flex gap-3 justify-center pt-4">
            <Link href="/auth/signup">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground h-12 px-8 font-medium">
                Get started <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/browse">
              <Button size="lg" variant="outline" className="h-12 px-8 font-medium">
                Browse jobs
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="border-t border-border/40" />

      {/* Features Grid */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-semibold text-center mb-16 text-foreground">Everything you need</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                title: 'Find opportunities',
                description: 'Browse and search through hundreds of career opportunities from top companies and startups.',
              },
              {
                title: 'Track applications',
                description: 'Monitor your applications in real-time and get instant notifications on status changes.',
              },
              {
                title: 'Land your role',
                description: 'Secure offers and connect directly with top companies and hiring managers.',
              },
            ].map((feature, idx) => (
              <div
                key={idx}
                className="p-6 rounded-md border border-border/50 hover:border-border hover:bg-muted/20 transition-all"
              >
                <div className="h-10 w-10 rounded-md bg-primary/10 text-primary flex items-center justify-center mb-4 font-semibold text-sm">
                  {idx + 1}
                </div>
                <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30 border-y border-border/40">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-semibold text-center mb-16 text-foreground">How it works</h2>
          <div className="space-y-8 max-w-2xl mx-auto">
            {[
              {
                title: 'Create your profile',
                description: 'Sign up and build your professional profile. Add your skills, experience, and resume.',
              },
              {
                title: 'Browse opportunities',
                description: 'Explore jobs that match your interests. Filter by company, location, and role type.',
              },
              {
                title: 'Submit applications',
                description: 'Apply to positions you like. Track the status of your applications in real-time.',
              },
              {
                title: 'Get hired',
                description: 'Hear back from companies and take your career to the next level.',
              },
            ].map((step, idx) => (
              <div key={idx} className="flex gap-6">
                <div className="flex-shrink-0">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground font-semibold text-sm">
                    {idx + 1}
                  </div>
                </div>
                <div className="flex-1 pt-1">
                  <h3 className="font-semibold text-foreground mb-1">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-12 text-center">
            {[
              { stat: '500+', label: 'Job opportunities' },
              { stat: '1000+', label: 'Active users' },
              { stat: '95%', label: 'Success rate' },
            ].map((item, idx) => (
              <div key={idx} className="space-y-2">
                <div className="text-3xl sm:text-4xl font-semibold text-foreground">{item.stat}</div>
                <p className="text-sm text-muted-foreground">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 border-t border-border/40">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h2 className="text-3xl sm:text-4xl font-semibold text-foreground">
              Ready to get started?
            </h2>
            <p className="text-muted-foreground">
              Join thousands of students finding their next opportunity
            </p>
          </div>
          <Link href="/auth/signup">
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground h-12 px-8 font-medium">
              Create account
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-muted/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-8">
            <div>
              <h3 className="font-semibold text-foreground">LaunchPad</h3>
              <p className="text-sm text-muted-foreground">Launch your career at hackathons</p>
            </div>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
              <a href="#" className="hover:text-foreground transition-colors">Terms</a>
              <a href="#" className="hover:text-foreground transition-colors">Contact</a>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-border/40 text-center text-sm text-muted-foreground">
            <p>© 2024 LaunchPad. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  )
}
