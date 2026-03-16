import 'server-only'

import { createClient } from '@supabase/supabase-js'
import type { NextRequest } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase credentials')
}

export const serverSupabase = createClient(supabaseUrl, supabaseServiceKey)

export async function getAuthorizedUser(request: NextRequest) {
  const authHeader = request.headers.get('authorization')

  if (!authHeader?.startsWith('Bearer ')) {
    return { user: null, error: 'Unauthorized' }
  }

  const token = authHeader.replace('Bearer ', '')
  const {
    data: { user },
    error,
  } = await serverSupabase.auth.getUser(token)

  if (error || !user) {
    return { user: null, error: 'Unauthorized' }
  }

  return { user, error: null }
}
