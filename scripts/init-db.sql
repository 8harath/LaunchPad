-- Enable UUID and other extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS "pgcrypto" SCHEMA extensions;

-- Create enum types for status fields
DO $$ BEGIN
  CREATE TYPE public.user_role AS ENUM ('student', 'company', 'admin', 'guest');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.application_status AS ENUM ('pending', 'reviewing', 'accepted', 'rejected', 'offer_extended');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

ALTER TYPE public.application_status ADD VALUE IF NOT EXISTS 'reviewed';
ALTER TYPE public.application_status ADD VALUE IF NOT EXISTS 'shortlisted';
ALTER TYPE public.application_status ADD VALUE IF NOT EXISTS 'interview_scheduled';
ALTER TYPE public.application_status ADD VALUE IF NOT EXISTS 'applied';
ALTER TYPE public.application_status ADD VALUE IF NOT EXISTS 'under_review';

DO $$ BEGIN
  CREATE TYPE public.job_status AS ENUM ('open', 'closed', 'filled');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Create profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role public.user_role NOT NULL DEFAULT 'guest',
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create companies table
CREATE TABLE IF NOT EXISTS public.companies (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  name TEXT NOT NULL,
  logo_url TEXT,
  description TEXT,
  website TEXT,
  location TEXT,
  industry TEXT,
  size TEXT,
  admin_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create student profiles table
CREATE TABLE IF NOT EXISTS public.student_profiles (
  id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  university TEXT,
  major TEXT,
  graduation_year INTEGER,
  headline TEXT,
  date_of_birth DATE,
  phone TEXT,
  location TEXT,
  current_title TEXT,
  current_company TEXT,
  years_of_experience NUMERIC(4,1),
  experience_summary TEXT,
  project_highlights TEXT,
  certifications TEXT[] DEFAULT '{}',
  languages TEXT[] DEFAULT '{}',
  availability_notice_period TEXT,
  skills TEXT[] DEFAULT '{}',
  preferred_job_types TEXT[] DEFAULT '{}',
  expected_salary_min INTEGER,
  expected_salary_max INTEGER,
  resume_url TEXT,
  github_url TEXT,
  linkedin_url TEXT,
  portfolio_url TEXT,
  twitter_url TEXT,
  instagram_url TEXT,
  leetcode_url TEXT,
  devfolio_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create jobs table
CREATE TABLE IF NOT EXISTS public.jobs (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  requirements TEXT[] DEFAULT '{}',
  salary_min INTEGER,
  salary_max INTEGER,
  job_type TEXT,
  location TEXT,
  status public.job_status NOT NULL DEFAULT 'open',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  deadline TIMESTAMP WITH TIME ZONE
);

-- Create job details table for additional info
CREATE TABLE IF NOT EXISTS public.job_details (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  key TEXT NOT NULL,
  value TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create applications table
CREATE TABLE IF NOT EXISTS public.applications (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE,
  status public.application_status NOT NULL DEFAULT 'pending',
  resume_url TEXT,
  cover_letter TEXT,
  custom_response TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(job_id, student_id)
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT,
  type TEXT,
  entity_id UUID,
  action_url TEXT,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  job_id UUID REFERENCES public.jobs(id) ON DELETE SET NULL,
  application_id UUID REFERENCES public.applications(id) ON DELETE SET NULL,
  subject TEXT,
  body TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.company_reviews (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  reviewer_name TEXT NOT NULL,
  reviewer_role TEXT,
  rating INTEGER NOT NULL DEFAULT 5 CHECK (rating BETWEEN 1 AND 5),
  title TEXT NOT NULL,
  review TEXT NOT NULL,
  outcome TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.success_stories (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  company TEXT NOT NULL,
  story TEXT NOT NULL,
  advice TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.hiring_insights (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  takeaway TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create admin settings table
CREATE TABLE IF NOT EXISTS public.admin_settings (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  key TEXT UNIQUE NOT NULL,
  value JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Backfill student profile columns for existing databases
ALTER TABLE public.student_profiles ADD COLUMN IF NOT EXISTS date_of_birth DATE;
ALTER TABLE public.student_profiles ADD COLUMN IF NOT EXISTS headline TEXT;
ALTER TABLE public.student_profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.student_profiles ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE public.student_profiles ADD COLUMN IF NOT EXISTS current_title TEXT;
ALTER TABLE public.student_profiles ADD COLUMN IF NOT EXISTS current_company TEXT;
ALTER TABLE public.student_profiles ADD COLUMN IF NOT EXISTS years_of_experience NUMERIC(4,1);
ALTER TABLE public.student_profiles ADD COLUMN IF NOT EXISTS experience_summary TEXT;
ALTER TABLE public.student_profiles ADD COLUMN IF NOT EXISTS project_highlights TEXT;
ALTER TABLE public.student_profiles ADD COLUMN IF NOT EXISTS certifications TEXT[] DEFAULT '{}';
ALTER TABLE public.student_profiles ADD COLUMN IF NOT EXISTS languages TEXT[] DEFAULT '{}';
ALTER TABLE public.student_profiles ADD COLUMN IF NOT EXISTS availability_notice_period TEXT;
ALTER TABLE public.student_profiles ADD COLUMN IF NOT EXISTS preferred_job_types TEXT[] DEFAULT '{}';
ALTER TABLE public.student_profiles ADD COLUMN IF NOT EXISTS expected_salary_min INTEGER;
ALTER TABLE public.student_profiles ADD COLUMN IF NOT EXISTS expected_salary_max INTEGER;
ALTER TABLE public.student_profiles ADD COLUMN IF NOT EXISTS twitter_url TEXT;
ALTER TABLE public.student_profiles ADD COLUMN IF NOT EXISTS instagram_url TEXT;
ALTER TABLE public.student_profiles ADD COLUMN IF NOT EXISTS leetcode_url TEXT;
ALTER TABLE public.student_profiles ADD COLUMN IF NOT EXISTS devfolio_url TEXT;
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS entity_id UUID;
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS action_url TEXT;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_companies_admin_id ON public.companies(admin_id);
CREATE INDEX IF NOT EXISTS idx_student_profiles_university ON public.student_profiles(university);
CREATE INDEX IF NOT EXISTS idx_jobs_company_id ON public.jobs(company_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON public.jobs(status);
CREATE INDEX IF NOT EXISTS idx_applications_job_id ON public.applications(job_id);
CREATE INDEX IF NOT EXISTS idx_applications_student_id ON public.applications(student_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON public.applications(status);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(read);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient_id ON public.messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_messages_application_id ON public.messages(application_id);
CREATE INDEX IF NOT EXISTS idx_company_reviews_company_id ON public.company_reviews(company_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.success_stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hiring_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Profiles - Users can read all profiles, update their own
CREATE POLICY "Allow public read" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policy: Companies - Anyone can read, admins can update their own
CREATE POLICY "Anyone can read companies" ON public.companies FOR SELECT USING (true);
CREATE POLICY "Admins can update own company" ON public.companies FOR UPDATE USING (auth.uid() = admin_id);
CREATE POLICY "Admins can insert company" ON public.companies FOR INSERT WITH CHECK (auth.uid() = admin_id);

-- RLS Policy: Student Profiles - Students can read all, update their own
CREATE POLICY "Anyone can read student profiles" ON public.student_profiles FOR SELECT USING (true);
CREATE POLICY "Students can update own profile" ON public.student_profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Students can insert own profile" ON public.student_profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policy: Jobs - Anyone can read open jobs
CREATE POLICY "Anyone can read open jobs" ON public.jobs FOR SELECT USING (status = 'open' OR auth.uid() IN (
  SELECT admin_id FROM public.companies WHERE public.companies.id = public.jobs.company_id
));
CREATE POLICY "Company admins can insert jobs" ON public.jobs FOR INSERT WITH CHECK (auth.uid() IN (
  SELECT admin_id FROM public.companies WHERE public.companies.id = company_id
));
CREATE POLICY "Company admins can update own jobs" ON public.jobs FOR UPDATE USING (auth.uid() IN (
  SELECT admin_id FROM public.companies WHERE public.companies.id = company_id
));

-- RLS Policy: Job Details - Anyone can read
CREATE POLICY "Anyone can read job details" ON public.job_details FOR SELECT USING (true);

-- RLS Policy: Applications - Students can read own, companies can read for their jobs
CREATE POLICY "Students can read own applications" ON public.applications FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY "Company admins can read applications for their jobs" ON public.applications FOR SELECT USING (
  auth.uid() IN (SELECT admin_id FROM public.companies WHERE public.companies.id IN (
    SELECT company_id FROM public.jobs WHERE public.jobs.id = public.applications.job_id
  ))
);
CREATE POLICY "Students can insert applications" ON public.applications FOR INSERT WITH CHECK (auth.uid() = student_id);
CREATE POLICY "Students can update own applications" ON public.applications FOR UPDATE USING (auth.uid() = student_id);
CREATE POLICY "Company admins can update application status" ON public.applications FOR UPDATE USING (
  auth.uid() IN (SELECT admin_id FROM public.companies WHERE public.companies.id IN (
    SELECT company_id FROM public.jobs WHERE public.jobs.id = public.applications.job_id
  ))
);

-- RLS Policy: Notifications - Users can read their own
CREATE POLICY "Users can read own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own notifications" ON public.notifications FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policy: Messages - participants can read their own conversations
CREATE POLICY "Participants can read messages" ON public.messages FOR SELECT USING (
  auth.uid() = sender_id OR auth.uid() = recipient_id
);
CREATE POLICY "Participants can insert messages" ON public.messages FOR INSERT WITH CHECK (
  auth.uid() = sender_id
);
CREATE POLICY "Recipients can update read state" ON public.messages FOR UPDATE USING (
  auth.uid() = recipient_id OR auth.uid() = sender_id
);

-- RLS Policy: Community content - readable to all authenticated users
CREATE POLICY "Anyone can read company reviews" ON public.company_reviews FOR SELECT USING (true);
CREATE POLICY "Anyone can read success stories" ON public.success_stories FOR SELECT USING (true);
CREATE POLICY "Anyone can read hiring insights" ON public.hiring_insights FOR SELECT USING (true);

-- RLS Policy: Admin Settings - Only admins can read/write
CREATE POLICY "Only admins can read settings" ON public.admin_settings FOR SELECT USING (
  auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin')
);
CREATE POLICY "Only admins can update settings" ON public.admin_settings FOR UPDATE USING (
  auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin')
);
