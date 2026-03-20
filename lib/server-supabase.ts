import 'server-only'

import { createClient } from '@supabase/supabase-js'
import type { NextRequest } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase credentials')
}

export const serverSupabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

export const supabaseAdmin = serverSupabase

const supabaseAuth =
  supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      })
    : null

export async function getAuthorizedUser(request: NextRequest) {
  const authHeader = request.headers.get('authorization')

  if (!authHeader?.startsWith('Bearer ')) {
    return { user: null, error: 'Unauthorized' }
  }

  const token = authHeader.replace('Bearer ', '').trim()
  const {
    data: { user },
    error,
  } = await serverSupabase.auth.getUser(token)

  if (error || !user) {
    return { user: null, error: 'Unauthorized' }
  }

  return { user, error: null }
}

export async function getAuthenticatedUser(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return { user: null, error: 'Unauthorized', status: 401 as const }
  }

  const token = authHeader.replace('Bearer ', '').trim()
  if (!token || !supabaseAuth) {
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
