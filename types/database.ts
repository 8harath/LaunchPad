export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          role: 'student' | 'company' | 'admin' | 'guest'
          avatar_url: string | null
          bio: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          role?: 'student' | 'company' | 'admin' | 'guest'
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          email?: string
          full_name?: string | null
          role?: 'student' | 'company' | 'admin' | 'guest'
          avatar_url?: string | null
          bio?: string | null
          updated_at?: string
        }
      }
      companies: {
        Row: {
          id: string
          name: string
          logo_url: string | null
          description: string | null
          website: string | null
          location: string | null
          industry: string | null
          size: string | null
          admin_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          logo_url?: string | null
          description?: string | null
          website?: string | null
          location?: string | null
          industry?: string | null
          size?: string | null
          admin_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          logo_url?: string | null
          description?: string | null
          website?: string | null
          location?: string | null
          industry?: string | null
          size?: string | null
          updated_at?: string
        }
      }
      student_profiles: {
        Row: {
          id: string
          university: string | null
          major: string | null
          graduation_year: number | null
          headline: string | null
          date_of_birth: string | null
          phone: string | null
          location: string | null
          current_title: string | null
          current_company: string | null
          years_of_experience: number | null
          experience_summary: string | null
          project_highlights: string | null
          certifications: string[]
          languages: string[]
          availability_notice_period: string | null
          skills: string[]
          preferred_job_types: string[]
          expected_salary_min: number | null
          expected_salary_max: number | null
          resume_url: string | null
          github_url: string | null
          linkedin_url: string | null
          portfolio_url: string | null
          twitter_url: string | null
          instagram_url: string | null
          leetcode_url: string | null
          devfolio_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          university?: string | null
          major?: string | null
          graduation_year?: number | null
          headline?: string | null
          date_of_birth?: string | null
          phone?: string | null
          location?: string | null
          current_title?: string | null
          current_company?: string | null
          years_of_experience?: number | null
          experience_summary?: string | null
          project_highlights?: string | null
          certifications?: string[]
          languages?: string[]
          availability_notice_period?: string | null
          skills?: string[]
          preferred_job_types?: string[]
          expected_salary_min?: number | null
          expected_salary_max?: number | null
          resume_url?: string | null
          github_url?: string | null
          linkedin_url?: string | null
          portfolio_url?: string | null
          twitter_url?: string | null
          instagram_url?: string | null
          leetcode_url?: string | null
          devfolio_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          university?: string | null
          major?: string | null
          graduation_year?: number | null
          headline?: string | null
          date_of_birth?: string | null
          phone?: string | null
          location?: string | null
          current_title?: string | null
          current_company?: string | null
          years_of_experience?: number | null
          experience_summary?: string | null
          project_highlights?: string | null
          certifications?: string[]
          languages?: string[]
          availability_notice_period?: string | null
          skills?: string[]
          preferred_job_types?: string[]
          expected_salary_min?: number | null
          expected_salary_max?: number | null
          resume_url?: string | null
          github_url?: string | null
          linkedin_url?: string | null
          portfolio_url?: string | null
          twitter_url?: string | null
          instagram_url?: string | null
          leetcode_url?: string | null
          devfolio_url?: string | null
          updated_at?: string
        }
      }
      jobs: {
        Row: {
          id: string
          company_id: string
          title: string
          description: string
          requirements: string[]
          salary_min: number | null
          salary_max: number | null
          job_type: string | null
          location: string | null
          status: 'open' | 'closed' | 'filled'
          created_at: string
          updated_at: string
          deadline: string | null
        }
        Insert: {
          id?: string
          company_id: string
          title: string
          description: string
          requirements?: string[]
          salary_min?: number | null
          salary_max?: number | null
          job_type?: string | null
          location?: string | null
          status?: 'open' | 'closed' | 'filled'
          created_at?: string
          updated_at?: string
          deadline?: string | null
        }
        Update: {
          title?: string
          description?: string
          requirements?: string[]
          salary_min?: number | null
          salary_max?: number | null
          job_type?: string | null
          location?: string | null
          status?: 'open' | 'closed' | 'filled'
          updated_at?: string
          deadline?: string | null
        }
      }
      job_details: {
        Row: {
          id: string
          job_id: string
          key: string
          value: string
          created_at: string
        }
        Insert: {
          id?: string
          job_id: string
          key: string
          value: string
          created_at?: string
        }
      }
      applications: {
        Row: {
          id: string
          job_id: string
          student_id: string
          status: 'pending' | 'reviewing' | 'accepted' | 'rejected' | 'offer_extended'
          resume_url: string | null
          cover_letter: string | null
          custom_response: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          job_id: string
          student_id: string
          status?: 'pending' | 'reviewing' | 'accepted' | 'rejected' | 'offer_extended'
          resume_url?: string | null
          cover_letter?: string | null
          custom_response?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          status?: 'pending' | 'reviewing' | 'accepted' | 'rejected' | 'offer_extended'
          resume_url?: string | null
          cover_letter?: string | null
          custom_response?: string | null
          updated_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          title: string
          message: string | null
          type: string | null
          read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          message?: string | null
          type?: string | null
          read?: boolean
          created_at?: string
        }
        Update: {
          read?: boolean
        }
      }
      admin_settings: {
        Row: {
          id: string
          key: string
          value: Record<string, any> | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          key: string
          value?: Record<string, any> | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          value?: Record<string, any> | null
          updated_at?: string
        }
      }
    }
  }
}
