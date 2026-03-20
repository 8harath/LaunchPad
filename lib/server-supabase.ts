import { createClient } from '@supabase/supabase-js'
import { NextRequest } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

export async function getAuthenticatedUser(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return { user: null, error: 'Unauthorized', status: 401 as const }
  }

  const token = authHeader.replace('Bearer ', '').trim()
  if (!token) {
    return { user: null, error: 'Unauthorized', status: 401 as const }
  }

  const {
    data: { user },
    error,
  } = await supabaseAuth.auth.getUser(token)

  if (error || !user) {
    return { user: null, error: 'Unauthorized', status: 401 as const }
  }

  return { user, error: null, status: 200 as const }
}
