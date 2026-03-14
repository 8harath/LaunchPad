import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error) throw error
  return user
}

export async function getUserProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  if (error) throw error
  return data
}

export async function getStudentProfile(userId: string) {
  const { data, error } = await supabase
    .from('student_profiles')
    .select('*')
    .eq('id', userId)
    .single()
  if (error) throw error
  return data
}

export async function getCompanyProfile(userId: string) {
  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .eq('admin_id', userId)
    .single()
  if (error) throw error
  return data
}

export async function getOpenJobs() {
  const { data, error } = await supabase
    .from('jobs')
    .select('*, companies(*)')
    .eq('status', 'open')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function getJobById(jobId: string) {
  const { data, error } = await supabase
    .from('jobs')
    .select('*, companies(*), job_details(*)')
    .eq('id', jobId)
    .single()
  if (error) throw error
  return data
}

export async function searchJobs(filters: {
  title?: string
  company_id?: string
  location?: string
  job_type?: string
}) {
  let query = supabase
    .from('jobs')
    .select('*, companies(*)')
    .eq('status', 'open')

  if (filters.title) {
    query = query.ilike('title', `%${filters.title}%`)
  }
  if (filters.company_id) {
    query = query.eq('company_id', filters.company_id)
  }
  if (filters.location) {
    query = query.ilike('location', `%${filters.location}%`)
  }
  if (filters.job_type) {
    query = query.eq('job_type', filters.job_type)
  }

  const { data, error } = await query.order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function getStudentApplications(studentId: string) {
  const { data, error } = await supabase
    .from('applications')
    .select('*, jobs(*, companies(*))')
    .eq('student_id', studentId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function getCompanyApplications(companyId: string) {
  const { data, error } = await supabase
    .from('applications')
    .select('*, jobs(*), student_profiles(*)')
    .in(
      'job_id',
      (await supabase
        .from('jobs')
        .select('id')
        .eq('company_id', companyId)
        .then(res => res.data?.map(j => j.id) || []))
    )
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function createApplication(jobId: string, studentId: string, resumeUrl?: string, coverLetter?: string) {
  const { data, error } = await supabase
    .from('applications')
    .insert([
      {
        job_id: jobId,
        student_id: studentId,
        resume_url: resumeUrl,
        cover_letter: coverLetter,
        status: 'pending',
      },
    ])
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateApplicationStatus(applicationId: string, status: string) {
  const { data, error } = await supabase
    .from('applications')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', applicationId)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function subscribeToApplicationUpdates(jobId: string, callback: (payload: any) => void) {
  return supabase
    .channel(`job:${jobId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'applications',
        filter: `job_id=eq.${jobId}`,
      },
      callback
    )
    .subscribe()
}
