import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase credentials')
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

type SignupRequest = {
  email: string
  password: string
  fullName: string
  role: 'student' | 'company'
  avatarUrl?: string
  university?: string
  major?: string
  graduationYear?: number
  companyName?: string
  industry?: string
}

export async function POST(request: NextRequest) {
  try {
    const body: SignupRequest = await request.json()
    const { email, password, fullName, role, ...profileData } = body

    // Validate required fields
    if (!email || !password || !fullName || !role) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    if (authError) {
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      )
    }

    const userId = authData.user.id

    // Create profile
    const { error: profileError } = await supabase
      .from('profiles')
      .insert([
        {
          id: userId,
          email,
          full_name: fullName,
          avatar_url: profileData.avatarUrl || null,
          role,
        },
      ])

    if (profileError) {
      // Clean up auth user if profile creation fails
      await supabase.auth.admin.deleteUser(userId)
      return NextResponse.json(
        { error: 'Failed to create user profile' },
        { status: 400 }
      )
    }

    // Create role-specific profile
    if (role === 'student') {
      const { error: studentError } = await supabase
        .from('student_profiles')
        .insert([
          {
            id: userId,
            university: profileData.university || null,
            major: profileData.major || null,
            graduation_year: profileData.graduationYear || null,
            skills: [],
          },
        ])

      if (studentError) {
        return NextResponse.json(
          { error: 'Failed to create student profile' },
          { status: 400 }
        )
      }
    } else if (role === 'company') {
      const { error: companyError } = await supabase
        .from('companies')
        .insert([
          {
            name: profileData.companyName || 'Unnamed Company',
            admin_id: userId,
            industry: profileData.industry || null,
          },
        ])

      if (companyError) {
        return NextResponse.json(
          { error: 'Failed to create company profile' },
          { status: 400 }
        )
      }
    }

    return NextResponse.json(
      {
        message: 'User created successfully',
        userId,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
