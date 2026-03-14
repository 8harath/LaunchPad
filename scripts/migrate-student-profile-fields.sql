-- Run this on an existing Supabase project before scripts/seed-demo.sql
-- It adds the richer student profile fields introduced after the original schema.

ALTER TABLE public.student_profiles ADD COLUMN IF NOT EXISTS headline TEXT;
ALTER TABLE public.student_profiles ADD COLUMN IF NOT EXISTS date_of_birth DATE;
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
