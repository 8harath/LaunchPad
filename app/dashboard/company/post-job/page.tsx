'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { BackButton } from '@/components/back-button'
import { Navbar } from '@/components/navbar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'

export default function PostJobPage() {
  const router = useRouter()
  const [company, setCompany] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [userName, setUserName] = useState<string | undefined>()

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    jobType: 'Full-time',
    salaryMin: '',
    salaryMax: '',
    requirements: '',
    deadline: '',
  })

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser()
        if (!authUser) {
          router.push('/auth/login')
          return
        }
        setUser(authUser)

        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, role')
          .eq('id', authUser.id)
          .single()

        setUserName(profile?.full_name || authUser.email || undefined)

        if (profile?.role !== 'company') {
          router.push('/dashboard/student')
          return
        }

        const { data: companyData } = await supabase
          .from('companies')
          .select('*')
          .eq('admin_id', authUser.id)
          .single()

        setCompany(companyData)
      } catch (error) {
        console.error('Error checking auth:', error)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!company) return

    setSubmitting(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token || ''}`,
        },
        body: JSON.stringify({
          companyId: company.id,
          title: formData.title,
          description: formData.description,
          location: formData.location,
          jobType: formData.jobType,
          salaryMin: formData.salaryMin ? parseInt(formData.salaryMin) : null,
          salaryMax: formData.salaryMax ? parseInt(formData.salaryMax) : null,
          requirements: formData.requirements.split('\n').filter(r => r.trim()),
          deadline: formData.deadline || null,
        }),
      })

      if (response.ok) {
        router.push('/dashboard/company')
      } else {
        console.error('Error creating job')
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar userRole="company" userName={userName} onLogout={handleLogout} />
        <div className="flex items-center justify-center py-12">
          <Spinner />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar userRole="company" userName={userName} onLogout={handleLogout} />
      <main className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <BackButton fallbackHref="/dashboard/company" className="mb-4 rounded-full" />
          <h1 className="text-4xl font-bold text-foreground mb-2">Post a New Job</h1>
          <p className="text-muted-foreground">
            Fill out the form below to post a new job opportunity
          </p>
        </div>

        <Card className="max-w-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Job Title
              </label>
              <Input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="e.g. Full-Stack Engineer"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Description
              </label>
              <Textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe the job role, responsibilities, and what you're looking for..."
                rows={6}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Location
                </label>
                <Input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="e.g. Bengaluru, India"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Job Type
                </label>
                <select
                  name="jobType"
                  value={formData.jobType}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                >
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Internship">Internship</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Salary Min in INR (Optional)
                </label>
                <Input
                  type="number"
                  name="salaryMin"
                  value={formData.salaryMin}
                  onChange={handleInputChange}
                  placeholder="e.g. 800000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Salary Max in INR (Optional)
                </label>
                <Input
                  type="number"
                  name="salaryMax"
                  value={formData.salaryMax}
                  onChange={handleInputChange}
                  placeholder="e.g. 1400000"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Requirements (One per line)
              </label>
              <Textarea
                name="requirements"
                value={formData.requirements}
                onChange={handleInputChange}
                placeholder="e.g. 3+ years of experience&#10;React/TypeScript&#10;PostgreSQL"
                rows={4}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Application Deadline (Optional)
              </label>
              <Input
                type="date"
                name="deadline"
                value={formData.deadline}
                onChange={handleInputChange}
              />
            </div>

            <div className="flex gap-4">
              <Button
                type="submit"
                disabled={submitting}
                className="flex-1"
              >
                {submitting ? (
                  <>
                    <Spinner className="mr-2" />
                    Posting...
                  </>
                ) : (
                  'Post Job'
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      </main>
    </div>
  )
}
