# LaunchPad - Supabase Setup Guide

## Prerequisites
- Supabase account and project created
- Environment variables configured in `.env.local`:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`

## Setup Instructions

### 1. Navigate to Supabase Dashboard
1. Go to https://app.supabase.com
2. Select your project
3. Click "SQL Editor" in the left sidebar

### 2. Create Database Schema
Copy and paste the entire content of `/scripts/init-db.sql` into the SQL Editor and execute it.

**Important**: Execute in the following order:
1. First, create extensions and enums
2. Then, create tables
3. Finally, create indexes and RLS policies

### 3. Verify Setup
Check the "Tables" section in the SQL Editor to confirm all tables are created:
- profiles
- companies
- student_profiles
- jobs
- job_details
- applications
- notifications
- admin_settings

### 4. Enable RLS (Row Level Security)
All tables have RLS enabled. Verify in the "Authentication" → "Policies" section.

## Tables Overview

### profiles
- Extends Supabase auth.users
- Stores user profile information
- Fields: id, email, full_name, role, avatar_url, bio, created_at, updated_at
- Roles: student, company, admin, guest

### companies
- Stores company information
- Fields: id, name, logo_url, description, website, location, industry, size, admin_id
- Each company has one admin (company recruiter)

### student_profiles
- Extends profiles for student-specific data
- Fields: id, university, major, graduation_year, skills, resume_url, github_url, linkedin_url, portfolio_url
- Linked to profiles via foreign key

### jobs
- Stores job postings
- Fields: id, company_id, title, description, requirements, salary_min, salary_max, job_type, location, status, deadline
- Status: open, closed, filled
- Created by company admins

### applications
- Tracks student applications to jobs
- Fields: id, job_id, student_id, status, resume_url, cover_letter, custom_response, created_at, updated_at
- Status: pending, reviewing, accepted, rejected, offer_extended
- Unique constraint: one student per job

### notifications
- Stores user notifications
- Fields: id, user_id, title, message, type, read, created_at
- Used for real-time updates on application status

### admin_settings
- Stores application-wide settings
- Fields: id, key, value (JSONB), created_at, updated_at
- Used for admin configuration

## RLS Policies

### profiles
- **SELECT**: Public read (anyone can see profiles)
- **UPDATE**: Users can only update their own profile
- **INSERT**: Users can only insert their own profile

### companies
- **SELECT**: Anyone can read company information
- **UPDATE**: Only company admins can update their own company
- **INSERT**: Only company admins can insert a new company

### student_profiles
- **SELECT**: Anyone can read student profiles
- **UPDATE**: Students can only update their own profile
- **INSERT**: Students can only insert their own profile

### jobs
- **SELECT**: Anyone can read open jobs; company admins can see all their jobs
- **INSERT**: Only company admins can create jobs
- **UPDATE**: Only company admins can update their own jobs

### applications
- **SELECT**: Students can see their own applications; company admins can see applications for their jobs
- **INSERT**: Only students can apply to jobs
- **UPDATE**: Students can update their own applications; company admins can update application status

### notifications
- **SELECT**: Users can only read their own notifications
- **INSERT**: System can create notifications (no user restriction)
- **UPDATE**: Users can only update their own notifications

## Next Steps

1. Create Supabase client utilities in `/lib/supabase.ts`
2. Set up authentication flows in API routes
3. Implement real-time subscriptions for notifications
4. Build API endpoints for CRUD operations

## Troubleshooting

### Extensions not found
If you see errors about extensions, they're likely already enabled in your Supabase project. The `CREATE EXTENSION IF NOT EXISTS` clause handles this safely.

### RLS Policy conflicts
If RLS policies fail to create, ensure the tables are created first and that you're using the correct table names (prefixed with `public.`).

### Foreign key errors
Ensure tables are created in order: profiles → companies, jobs → applications.
