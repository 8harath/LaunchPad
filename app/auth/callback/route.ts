import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { AVATAR_PRESETS } from '@/lib/avatar-presets'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // Exchange the code for a session
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      // Check if user already has a profile
      const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false,
          },
        }
      )

      const { data: existingProfile } = await supabaseAdmin
        .from('profiles')
        .select('id, role')
        .eq('id', data.user.id)
        .single()

      if (!existingProfile) {
        // First-time Google sign-in: create a profile with 'student' as default role
        await supabaseAdmin.from('profiles').insert([
          {
            id: data.user.id,
            email: data.user.email!,
            full_name: data.user.user_metadata?.full_name || data.user.user_metadata?.name || null,
            avatar_url: data.user.user_metadata?.avatar_url || AVATAR_PRESETS[0].url,
            role: 'student',
          },
        ])

        // Also create a student profile
        await supabaseAdmin.from('student_profiles').insert([
          {
            id: data.user.id,
            skills: [],
          },
        ])

        // Redirect to student dashboard for new users
        return NextResponse.redirect(new URL('/profile?welcome=1', requestUrl.origin))
      }

      // Existing user — redirect based on role
      if (existingProfile.role === 'company' || existingProfile.role === 'admin') {
        return NextResponse.redirect(new URL('/dashboard/company', requestUrl.origin))
      }
      return NextResponse.redirect(new URL('/dashboard/student', requestUrl.origin))
    }
  }

  // If something went wrong, redirect to login with error
  return NextResponse.redirect(new URL('/auth/login?error=auth_callback_error', requestUrl.origin))
}
