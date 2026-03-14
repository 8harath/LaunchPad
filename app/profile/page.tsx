'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Navbar } from '@/components/navbar'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Spinner } from '@/components/ui/spinner'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { BackButton } from '@/components/back-button'
import { AVATAR_PRESETS } from '@/lib/avatar-presets'

type ProfileRole = 'student' | 'company' | 'admin' | 'guest'

function ProfilePageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [userName, setUserName] = useState<string>()
  const [avatarUrl, setAvatarUrl] = useState<string>()
  const [role, setRole] = useState<ProfileRole>('guest')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [profile, setProfile] = useState({
    full_name: '',
    bio: '',
    avatar_url: AVATAR_PRESETS[0].url,
  })
  const [studentProfile, setStudentProfile] = useState({
    university: '',
    major: '',
    graduation_year: '',
    headline: '',
    date_of_birth: '',
    phone: '',
    location: '',
    current_title: '',
    current_company: '',
    years_of_experience: '',
    experience_summary: '',
    project_highlights: '',
    certifications: '',
    languages: '',
    availability_notice_period: '',
    skills: '',
    preferred_job_types: '',
    expected_salary_min: '',
    expected_salary_max: '',
    resume_url: '',
    github_url: '',
    linkedin_url: '',
    portfolio_url: '',
    twitter_url: '',
    instagram_url: '',
    leetcode_url: '',
    devfolio_url: '',
  })
  const [companyProfile, setCompanyProfile] = useState({
    name: '',
    industry: '',
    location: '',
    website: '',
    size: '',
    description: '',
    logo_url: '',
  })

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          router.replace('/auth/login')
          return
        }

        const { data: baseProfile, error: baseError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (baseError || !baseProfile) {
          setError('Unable to load your profile.')
          return
        }

        setRole(baseProfile.role)
        setUserName(baseProfile.full_name || user.email || undefined)
        setAvatarUrl(baseProfile.avatar_url || AVATAR_PRESETS[0].url)
        setProfile({
          full_name: baseProfile.full_name || '',
          bio: baseProfile.bio || '',
          avatar_url: baseProfile.avatar_url || AVATAR_PRESETS[0].url,
        })

        if (baseProfile.role === 'student') {
          const { data: studentData } = await supabase
            .from('student_profiles')
            .select('*')
            .eq('id', user.id)
            .maybeSingle()

          if (studentData) {
            setStudentProfile({
              university: studentData.university || '',
              major: studentData.major || '',
              graduation_year: studentData.graduation_year ? String(studentData.graduation_year) : '',
              headline: studentData.headline || '',
              date_of_birth: studentData.date_of_birth || '',
              phone: studentData.phone || '',
              location: studentData.location || '',
              current_title: studentData.current_title || '',
              current_company: studentData.current_company || '',
              years_of_experience: studentData.years_of_experience ? String(studentData.years_of_experience) : '',
              experience_summary: studentData.experience_summary || '',
              project_highlights: studentData.project_highlights || '',
              certifications: (studentData.certifications || []).join(', '),
              languages: (studentData.languages || []).join(', '),
              availability_notice_period: studentData.availability_notice_period || '',
              skills: (studentData.skills || []).join(', '),
              preferred_job_types: (studentData.preferred_job_types || []).join(', '),
              expected_salary_min: studentData.expected_salary_min ? String(studentData.expected_salary_min) : '',
              expected_salary_max: studentData.expected_salary_max ? String(studentData.expected_salary_max) : '',
              resume_url: studentData.resume_url || '',
              github_url: studentData.github_url || '',
              linkedin_url: studentData.linkedin_url || '',
              portfolio_url: studentData.portfolio_url || '',
              twitter_url: studentData.twitter_url || '',
              instagram_url: studentData.instagram_url || '',
              leetcode_url: studentData.leetcode_url || '',
              devfolio_url: studentData.devfolio_url || '',
            })
          }
        }

        if (baseProfile.role === 'company' || baseProfile.role === 'admin') {
          const { data: companyData } = await supabase
            .from('companies')
            .select('*')
            .eq('admin_id', user.id)
            .maybeSingle()

          if (companyData) {
            setCompanyProfile({
              name: companyData.name || '',
              industry: companyData.industry || '',
              location: companyData.location || '',
              website: companyData.website || '',
              size: companyData.size || '',
              description: companyData.description || '',
              logo_url: companyData.logo_url || '',
            })
          }
        }
      } catch {
        setError('Something went wrong while loading your profile.')
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [router])

  const handleSave = async () => {
    setSaving(true)
    setError('')
    setMessage('')

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.replace('/auth/login')
        return
      }

      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: profile.full_name.trim() || null,
          bio: profile.bio.trim() || null,
          avatar_url: profile.avatar_url,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)

      if (profileError) throw profileError

      if (role === 'student') {
        const { error: studentError } = await supabase
          .from('student_profiles')
          .upsert({
            id: user.id,
            university: studentProfile.university.trim() || null,
            major: studentProfile.major.trim() || null,
            graduation_year: studentProfile.graduation_year ? Number(studentProfile.graduation_year) : null,
            headline: studentProfile.headline.trim() || null,
            date_of_birth: studentProfile.date_of_birth || null,
            phone: studentProfile.phone.trim() || null,
            location: studentProfile.location.trim() || null,
            current_title: studentProfile.current_title.trim() || null,
            current_company: studentProfile.current_company.trim() || null,
            years_of_experience: studentProfile.years_of_experience ? Number(studentProfile.years_of_experience) : null,
            experience_summary: studentProfile.experience_summary.trim() || null,
            project_highlights: studentProfile.project_highlights.trim() || null,
            certifications: studentProfile.certifications.split(',').map((item) => item.trim()).filter(Boolean),
            languages: studentProfile.languages.split(',').map((item) => item.trim()).filter(Boolean),
            availability_notice_period: studentProfile.availability_notice_period.trim() || null,
            skills: studentProfile.skills.split(',').map((skill) => skill.trim()).filter(Boolean),
            preferred_job_types: studentProfile.preferred_job_types.split(',').map((jobType) => jobType.trim()).filter(Boolean),
            expected_salary_min: studentProfile.expected_salary_min ? Number(studentProfile.expected_salary_min) : null,
            expected_salary_max: studentProfile.expected_salary_max ? Number(studentProfile.expected_salary_max) : null,
            resume_url: studentProfile.resume_url.trim() || null,
            github_url: studentProfile.github_url.trim() || null,
            linkedin_url: studentProfile.linkedin_url.trim() || null,
            portfolio_url: studentProfile.portfolio_url.trim() || null,
            twitter_url: studentProfile.twitter_url.trim() || null,
            instagram_url: studentProfile.instagram_url.trim() || null,
            leetcode_url: studentProfile.leetcode_url.trim() || null,
            devfolio_url: studentProfile.devfolio_url.trim() || null,
            updated_at: new Date().toISOString(),
          })

        if (studentError) throw studentError
      }

      if (role === 'company' || role === 'admin') {
        const { data: existingCompany } = await supabase
          .from('companies')
          .select('id')
          .eq('admin_id', user.id)
          .maybeSingle()

        const companyPayload = {
          name: companyProfile.name.trim() || 'Unnamed Company',
          industry: companyProfile.industry.trim() || null,
          location: companyProfile.location.trim() || null,
          website: companyProfile.website.trim() || null,
          size: companyProfile.size.trim() || null,
          description: companyProfile.description.trim() || null,
          logo_url: companyProfile.logo_url.trim() || null,
          admin_id: user.id,
          updated_at: new Date().toISOString(),
        }

        const companyQuery = existingCompany?.id
          ? supabase.from('companies').update(companyPayload).eq('id', existingCompany.id)
          : supabase.from('companies').insert(companyPayload)

        const { error: companyError } = await companyQuery
        if (companyError) throw companyError
      }

      setAvatarUrl(profile.avatar_url)
      setUserName(profile.full_name || undefined)
      setMessage('Profile saved successfully.')
    } catch (saveError: any) {
      setError(saveError?.message || 'Unable to save your profile right now.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <Spinner />
        </div>
      </div>
    )
  }

  const initials = (profile.full_name || userName || 'LP')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')

  const isWelcome = searchParams.get('welcome') === '1'

  return (
    <div className="min-h-screen bg-background">
      <Navbar userRole={role} userName={userName} avatarUrl={avatarUrl} />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <BackButton
              fallbackHref={role === 'company' || role === 'admin' ? '/dashboard/company' : '/dashboard/student'}
              preferFallback={isWelcome}
              className="mb-5 rounded-full"
            />
            <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
              {isWelcome ? 'Welcome' : 'Profile'}
            </p>
            <h1 className="mt-2 text-4xl font-semibold tracking-[-0.04em] text-foreground">
              Build a profile recruiters can actually use.
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
              Keep it clean, current, and easy to scan. Your details are stored in Supabase and can be updated anytime.
            </p>
          </div>
          <Button onClick={handleSave} disabled={saving} className="rounded-full px-6">
            {saving ? 'Saving...' : 'Save profile'}
          </Button>
        </div>

        {(message || error) && (
          <div className={`mb-6 rounded-2xl border px-4 py-3 text-sm ${error ? 'border-destructive/30 bg-destructive/10 text-destructive' : 'border-border bg-card text-foreground'}`}>
            {error || message}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <Card className="paper rounded-[2rem] border border-border/80 p-6">
            <div className="mb-6 flex items-center gap-4">
              <Avatar className="h-20 w-20 border border-border">
                <AvatarImage src={profile.avatar_url} alt={profile.full_name || 'Profile avatar'} />
                <AvatarFallback>{initials || 'LP'}</AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-xl font-semibold text-foreground">{profile.full_name || 'Your profile'}</h2>
                <p className="text-sm text-muted-foreground">
                  {role === 'company' ? 'Recruiter profile' : 'Student profile'}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Choose an avatar</Label>
              <div className="grid grid-cols-5 gap-3">
                {AVATAR_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => setProfile((current) => ({ ...current, avatar_url: preset.url }))}
                    className={`rounded-2xl border p-1 transition-all ${profile.avatar_url === preset.url ? 'border-foreground bg-accent shadow-sm' : 'border-border hover:border-foreground/30'}`}
                    aria-label={`Select ${preset.label} avatar`}
                  >
                    <Avatar className="h-14 w-14">
                      <AvatarImage src={preset.url} alt={preset.label} />
                      <AvatarFallback>{preset.label.slice(0, 1)}</AvatarFallback>
                    </Avatar>
                  </button>
                ))}
              </div>
            </div>
          </Card>

          <div className="space-y-6">
            <Card className="paper rounded-[2rem] border border-border/80 p-6">
              <div className="mb-5">
                <h2 className="text-xl font-semibold text-foreground">Basics</h2>
                <p className="mt-1 text-sm text-muted-foreground">Name, short bio, and a profile image that feels like you.</p>
              </div>
              <div className="grid gap-5">
                <div>
                  <Label htmlFor="full_name">Full name</Label>
                  <Input id="full_name" value={profile.full_name} onChange={(e) => setProfile((current) => ({ ...current, full_name: e.target.value }))} className="mt-2" placeholder="Your name" />
                </div>
                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea id="bio" value={profile.bio} onChange={(e) => setProfile((current) => ({ ...current, bio: e.target.value }))} className="mt-2 min-h-28" placeholder="A short summary recruiters or students should know." />
                </div>
              </div>
            </Card>

            {role === 'student' ? (
              <Card className="paper rounded-[2rem] border border-border/80 p-6">
                <div className="mb-5">
                  <h2 className="text-xl font-semibold text-foreground">Student details</h2>
                  <p className="mt-1 text-sm text-muted-foreground">Keep your academic info, links, and skills easy to scan.</p>
                </div>
                <div className="grid gap-5 md:grid-cols-2">
                  <div><Label htmlFor="university">University</Label><Input id="university" value={studentProfile.university} onChange={(e) => setStudentProfile((current) => ({ ...current, university: e.target.value }))} className="mt-2" /></div>
                  <div><Label htmlFor="major">Major</Label><Input id="major" value={studentProfile.major} onChange={(e) => setStudentProfile((current) => ({ ...current, major: e.target.value }))} className="mt-2" /></div>
                  <div><Label htmlFor="graduation_year">Graduation year</Label><Input id="graduation_year" type="number" value={studentProfile.graduation_year} onChange={(e) => setStudentProfile((current) => ({ ...current, graduation_year: e.target.value }))} className="mt-2" placeholder="2026" /></div>
                  <div><Label htmlFor="headline">Professional headline</Label><Input id="headline" value={studentProfile.headline} onChange={(e) => setStudentProfile((current) => ({ ...current, headline: e.target.value }))} className="mt-2" placeholder="Frontend engineer with product instincts" /></div>
                  <div><Label htmlFor="date_of_birth">Date of birth</Label><Input id="date_of_birth" type="date" value={studentProfile.date_of_birth} onChange={(e) => setStudentProfile((current) => ({ ...current, date_of_birth: e.target.value }))} className="mt-2" /></div>
                  <div><Label htmlFor="phone">Phone</Label><Input id="phone" value={studentProfile.phone} onChange={(e) => setStudentProfile((current) => ({ ...current, phone: e.target.value }))} className="mt-2" placeholder="+91 98765 43210" /></div>
                  <div><Label htmlFor="student_location">Location</Label><Input id="student_location" value={studentProfile.location} onChange={(e) => setStudentProfile((current) => ({ ...current, location: e.target.value }))} className="mt-2" placeholder="Chennai, India" /></div>
                  <div><Label htmlFor="current_title">Current title</Label><Input id="current_title" value={studentProfile.current_title} onChange={(e) => setStudentProfile((current) => ({ ...current, current_title: e.target.value }))} className="mt-2" placeholder="Frontend Intern" /></div>
                  <div><Label htmlFor="current_company">Current company</Label><Input id="current_company" value={studentProfile.current_company} onChange={(e) => setStudentProfile((current) => ({ ...current, current_company: e.target.value }))} className="mt-2" placeholder="Campus Labs" /></div>
                  <div><Label htmlFor="years_of_experience">Years of experience</Label><Input id="years_of_experience" type="number" step="0.1" value={studentProfile.years_of_experience} onChange={(e) => setStudentProfile((current) => ({ ...current, years_of_experience: e.target.value }))} className="mt-2" placeholder="1.5" /></div>
                  <div><Label htmlFor="availability_notice_period">Availability / notice period</Label><Input id="availability_notice_period" value={studentProfile.availability_notice_period} onChange={(e) => setStudentProfile((current) => ({ ...current, availability_notice_period: e.target.value }))} className="mt-2" placeholder="Available immediately" /></div>
                  <div><Label htmlFor="skills">Skills</Label><Input id="skills" value={studentProfile.skills} onChange={(e) => setStudentProfile((current) => ({ ...current, skills: e.target.value }))} className="mt-2" placeholder="React, Supabase, TypeScript" /></div>
                  <div><Label htmlFor="languages">Languages</Label><Input id="languages" value={studentProfile.languages} onChange={(e) => setStudentProfile((current) => ({ ...current, languages: e.target.value }))} className="mt-2" placeholder="English, Tamil" /></div>
                  <div><Label htmlFor="certifications">Certifications</Label><Input id="certifications" value={studentProfile.certifications} onChange={(e) => setStudentProfile((current) => ({ ...current, certifications: e.target.value }))} className="mt-2" placeholder="AWS Cloud Practitioner, Google UX Certificate" /></div>
                  <div><Label htmlFor="preferred_job_types">Preferred job types</Label><Input id="preferred_job_types" value={studentProfile.preferred_job_types} onChange={(e) => setStudentProfile((current) => ({ ...current, preferred_job_types: e.target.value }))} className="mt-2" placeholder="Full-time, Internship, Remote" /></div>
                  <div><Label htmlFor="expected_salary_min">Expected salary min</Label><Input id="expected_salary_min" type="number" value={studentProfile.expected_salary_min} onChange={(e) => setStudentProfile((current) => ({ ...current, expected_salary_min: e.target.value }))} className="mt-2" placeholder="800000" /></div>
                  <div><Label htmlFor="expected_salary_max">Expected salary max</Label><Input id="expected_salary_max" type="number" value={studentProfile.expected_salary_max} onChange={(e) => setStudentProfile((current) => ({ ...current, expected_salary_max: e.target.value }))} className="mt-2" placeholder="1400000" /></div>
                  <div><Label htmlFor="github_url">GitHub URL</Label><Input id="github_url" value={studentProfile.github_url} onChange={(e) => setStudentProfile((current) => ({ ...current, github_url: e.target.value }))} className="mt-2" /></div>
                  <div><Label htmlFor="linkedin_url">LinkedIn URL</Label><Input id="linkedin_url" value={studentProfile.linkedin_url} onChange={(e) => setStudentProfile((current) => ({ ...current, linkedin_url: e.target.value }))} className="mt-2" /></div>
                  <div><Label htmlFor="portfolio_url">Portfolio URL</Label><Input id="portfolio_url" value={studentProfile.portfolio_url} onChange={(e) => setStudentProfile((current) => ({ ...current, portfolio_url: e.target.value }))} className="mt-2" /></div>
                  <div><Label htmlFor="resume_url">Resume URL</Label><Input id="resume_url" value={studentProfile.resume_url} onChange={(e) => setStudentProfile((current) => ({ ...current, resume_url: e.target.value }))} className="mt-2" /></div>
                  <div><Label htmlFor="twitter_url">Twitter / X URL</Label><Input id="twitter_url" value={studentProfile.twitter_url} onChange={(e) => setStudentProfile((current) => ({ ...current, twitter_url: e.target.value }))} className="mt-2" /></div>
                  <div><Label htmlFor="instagram_url">Instagram URL</Label><Input id="instagram_url" value={studentProfile.instagram_url} onChange={(e) => setStudentProfile((current) => ({ ...current, instagram_url: e.target.value }))} className="mt-2" /></div>
                  <div><Label htmlFor="leetcode_url">LeetCode URL</Label><Input id="leetcode_url" value={studentProfile.leetcode_url} onChange={(e) => setStudentProfile((current) => ({ ...current, leetcode_url: e.target.value }))} className="mt-2" /></div>
                  <div><Label htmlFor="devfolio_url">Devfolio URL</Label><Input id="devfolio_url" value={studentProfile.devfolio_url} onChange={(e) => setStudentProfile((current) => ({ ...current, devfolio_url: e.target.value }))} className="mt-2" /></div>
                  <div className="md:col-span-2"><Label htmlFor="experience_summary">Experience summary</Label><Textarea id="experience_summary" value={studentProfile.experience_summary} onChange={(e) => setStudentProfile((current) => ({ ...current, experience_summary: e.target.value }))} className="mt-2 min-h-28" placeholder="Summarize internships, projects, ownership, and measurable outcomes." /></div>
                  <div className="md:col-span-2"><Label htmlFor="project_highlights">Project highlights</Label><Textarea id="project_highlights" value={studentProfile.project_highlights} onChange={(e) => setStudentProfile((current) => ({ ...current, project_highlights: e.target.value }))} className="mt-2 min-h-28" placeholder="List notable projects, measurable results, technologies, and leadership contributions." /></div>
                </div>
              </Card>
            ) : null}

            {role === 'company' || role === 'admin' ? (
              <Card className="paper rounded-[2rem] border border-border/80 p-6">
                <div className="mb-5">
                  <h2 className="text-xl font-semibold text-foreground">Company details</h2>
                  <p className="mt-1 text-sm text-muted-foreground">Add the company details candidates should see before applying.</p>
                </div>
                <div className="grid gap-5 md:grid-cols-2">
                  <div><Label htmlFor="company_name">Company name</Label><Input id="company_name" value={companyProfile.name} onChange={(e) => setCompanyProfile((current) => ({ ...current, name: e.target.value }))} className="mt-2" /></div>
                  <div><Label htmlFor="industry">Industry</Label><Input id="industry" value={companyProfile.industry} onChange={(e) => setCompanyProfile((current) => ({ ...current, industry: e.target.value }))} className="mt-2" /></div>
                  <div><Label htmlFor="company_location">Location</Label><Input id="company_location" value={companyProfile.location} onChange={(e) => setCompanyProfile((current) => ({ ...current, location: e.target.value }))} className="mt-2" /></div>
                  <div><Label htmlFor="size">Team size</Label><Input id="size" value={companyProfile.size} onChange={(e) => setCompanyProfile((current) => ({ ...current, size: e.target.value }))} className="mt-2" placeholder="1-10, 11-50, 1000+" /></div>
                  <div><Label htmlFor="website">Website</Label><Input id="website" value={companyProfile.website} onChange={(e) => setCompanyProfile((current) => ({ ...current, website: e.target.value }))} className="mt-2" /></div>
                  <div><Label htmlFor="logo_url">Company logo URL</Label><Input id="logo_url" value={companyProfile.logo_url} onChange={(e) => setCompanyProfile((current) => ({ ...current, logo_url: e.target.value }))} className="mt-2" /></div>
                  <div className="md:col-span-2"><Label htmlFor="company_description">Description</Label><Textarea id="company_description" value={companyProfile.description} onChange={(e) => setCompanyProfile((current) => ({ ...current, description: e.target.value }))} className="mt-2 min-h-28" /></div>
                </div>
              </Card>
            ) : null}
          </div>
        </div>
      </main>
    </div>
  )
}

export default function ProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background">
          <Navbar />
          <div className="flex items-center justify-center py-20">
            <Spinner />
          </div>
        </div>
      }
    >
      <ProfilePageContent />
    </Suspense>
  )
}
