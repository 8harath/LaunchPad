# LaunchPad

LaunchPad is a recruitment platform for two primary user groups:

- students who want to create a detailed professional profile, browse opportunities, apply for roles, and track application progress
- recruiters or companies who want to create a hiring presence, publish jobs, review incoming applications, and manage hiring workflow in one place

This repository is the full product codebase for the web application, including:

- the Next.js application
- Supabase-authenticated API routes
- the PostgreSQL schema and RLS policies
- seed scripts for demo accounts and realistic sample data
- UI flows for authentication, profile setup, browsing, job management, and application management

This document is intended to act as repository-level documentation, not just a quick start file. It explains what the platform is, how the application is structured, how data flows through the system, and what each important table and code area is responsible for.

## Product Summary

At a high level, LaunchPad solves a simple but important workflow:

1. A user signs up either as a `student` or a `company`.
2. Students build a profile containing not just their name, but recruiter-relevant information such as:
   - academic details
   - date of birth
   - phone number
   - location
   - current title
   - current company
   - years of experience
   - experience summary
   - skills
   - preferred job types
   - expected salary range
   - resume and portfolio links
3. Recruiters create their company profile and publish jobs.
4. Students browse open jobs and apply.
5. Recruiters review applications and update statuses.
6. Students track progress from their dashboard.

The product is not hackathon-specific. It is a general recruitment platform for students and recruiters. If any older wording in the repository still references hackathons, it should be considered legacy language from earlier iterations of the project.

## User Roles

### Student

Students can:

- sign up and log in
- choose an avatar from preset options
- complete and edit a detailed student profile
- browse job listings
- apply to jobs
- track application status

### Company / Recruiter

Recruiters can:

- sign up and log in
- manage company identity and description
- create and manage job listings
- view applications to company jobs
- update application statuses

### Admin

Admins exist in the schema and seed data for operational control. The codebase currently uses the company dashboard for recruiter/admin redirection, but the schema also includes `admin_settings` for future platform-level administration.

## Core Product Flows

### 1. Authentication and Onboarding

Authentication is handled by Supabase Auth.

Supported flows:

- email/password signup
- email/password login
- Google OAuth

After signup:

- a Supabase auth user is created
- a `profiles` row is created
- a role-specific record is created in `student_profiles` or `companies`
- the user is redirected into profile setup

After Google OAuth:

- the callback route exchanges the authorization code for a Supabase session
- if the user is new, a default `profiles` row is created
- new Google users are currently initialized as `student`
- the user is redirected to `/profile?welcome=1`

### 2. Profile Management

The `/profile` page is the central profile editor for the platform.

Common profile fields:

- full name
- bio
- avatar

Student-specific profile fields:

- university
- major
- graduation year
- date of birth
- phone
- location
- current title
- current company
- years of experience
- experience summary
- skills
- preferred job types
- expected salary min/max
- resume URL
- GitHub URL
- LinkedIn URL
- portfolio URL

Company-specific profile fields:

- company name
- industry
- location
- website
- size
- description
- logo URL

### 3. Job Discovery

Students browse jobs from the `/browse` page.

The browse experience includes:

- search
- job type filtering
- location filtering
- job cards
- detailed job view at `/browse/[jobId]`

Jobs are fetched through the server API route `GET /api/jobs`, which reads from Supabase using the service role key.

### 4. Applications

Students can apply to jobs through `POST /api/applications`.

Applications store:

- which student applied
- which job they applied to
- the application status
- resume / cover letter fields

Recruiters can review applications from the company dashboard and update statuses through:

- `PATCH /api/applications/[applicationId]`

### 5. Dashboards

Student dashboard:

- shows the student’s applications
- reflects application status changes

Company dashboard:

- shows the company’s job postings
- links to application management per job

## Technical Architecture

### Stack

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS v4
- shadcn/ui components
- Supabase Auth
- Supabase Postgres

### Application Layers

#### 1. UI Layer

Located primarily in:

- `app/`
- `components/`

Responsibilities:

- rendering pages
- collecting user input
- orchestrating client-side flows
- calling API routes or Supabase client methods

#### 2. API Layer

Located in:

- `app/api/`

Responsibilities:

- secure writes and privileged reads
- role-sensitive checks
- token verification for protected mutations
- shaping responses for the UI

#### 3. Data Layer

Defined in:

- `scripts/init-db.sql`
- `types/database.ts`
- `lib/supabase.ts`

Responsibilities:

- table definitions
- indexes
- enum types
- RLS policies
- typed client access

### Architectural Notes

The current architecture mixes:

- direct client-side Supabase access for profile updates and authenticated user reads
- API route access for privileged operations like job creation, job listing aggregation, and application management

This is a reasonable architecture for a Supabase-backed Next.js application because:

- the client can safely update its own rows under RLS
- the server can use the service role key where cross-table or privileged access is needed

## Repository Structure

```text
app/
  api/
    applications/
    auth/
    jobs/
  auth/
    callback/
    login/
    signup/
  browse/
    [jobId]/
  dashboard/
    company/
    student/
  profile/
  layout.tsx
  page.tsx
  globals.css

components/
  app-logo.tsx
  job-card.tsx
  navbar.tsx
  status-badge.tsx
  ui/

lib/
  avatar-presets.ts
  supabase.ts
  utils.ts

scripts/
  init-db.sql
  seed-demo.sql

types/
  database.ts
```

## Database Documentation

The platform is centered around a Supabase Postgres schema under `public`.

### `profiles`

Purpose:

- canonical application-level identity record for each authenticated user

Key columns:

- `id`: UUID, foreign key to `auth.users.id`
- `email`
- `full_name`
- `role`
- `avatar_url`
- `bio`
- `created_at`
- `updated_at`

Notes:

- every authenticated application user should have a `profiles` record
- this table is the parent for both recruiter and student-specific profile data

### `student_profiles`

Purpose:

- stores recruiter-relevant student details

Key columns:

- `id`: UUID, foreign key to `profiles.id`
- `university`
- `major`
- `graduation_year`
- `date_of_birth`
- `phone`
- `location`
- `current_title`
- `current_company`
- `years_of_experience`
- `experience_summary`
- `skills` (`TEXT[]`)
- `preferred_job_types` (`TEXT[]`)
- `expected_salary_min`
- `expected_salary_max`
- `resume_url`
- `github_url`
- `linkedin_url`
- `portfolio_url`
- `created_at`
- `updated_at`

Notes:

- this table is where the platform now stores richer student information a recruiter would expect from a candidate profile
- users with the `student` role can update their own row through RLS

### `companies`

Purpose:

- stores recruiter/company-facing information

Key columns:

- `id`
- `name`
- `logo_url`
- `description`
- `website`
- `location`
- `industry`
- `size`
- `admin_id`
- `created_at`
- `updated_at`

Notes:

- `admin_id` links the company record back to the authenticated recruiter user in `profiles`

### `jobs`

Purpose:

- stores published job listings

Key columns:

- `id`
- `company_id`
- `title`
- `description`
- `requirements` (`TEXT[]`)
- `salary_min`
- `salary_max`
- `job_type`
- `location`
- `status`
- `deadline`
- `created_at`
- `updated_at`

### `job_details`

Purpose:

- optional key/value extension table for job metadata

Key columns:

- `id`
- `job_id`
- `key`
- `value`
- `created_at`

### `applications`

Purpose:

- joins students to jobs and tracks application lifecycle

Key columns:

- `id`
- `job_id`
- `student_id`
- `status`
- `resume_url`
- `cover_letter`
- `custom_response`
- `created_at`
- `updated_at`

Constraint:

- one student may only apply once per job via `UNIQUE(job_id, student_id)`

### `notifications`

Purpose:

- stores per-user notification records

Key columns:

- `id`
- `user_id`
- `title`
- `message`
- `type`
- `read`
- `created_at`

### `admin_settings`

Purpose:

- future-facing operational settings store

Key columns:

- `id`
- `key`
- `value`
- `created_at`
- `updated_at`

## Row Level Security Summary

RLS is enabled on all primary tables.

Important policy intent:

- users can update their own `profiles` row
- students can update their own `student_profiles` row
- company admins can update their own `companies` row
- only company admins can create/update jobs belonging to their company
- students can only insert/read their own applications
- companies can read applications for their own jobs

## API Documentation

### `POST /api/auth/signup`

Creates:

- Supabase auth user
- `profiles` row
- role-specific row in `student_profiles` or `companies`

### `POST /api/auth/login`

Performs:

- email/password authentication
- returns session and role information

### `GET /api/jobs`

Supports:

- listing open jobs
- filtering by title
- filtering by location
- filtering by company
- fetching a specific job by `jobId`

### `POST /api/jobs`

Creates a job posting.

Security:

- verifies the caller’s Supabase access token
- verifies the caller is the admin for the provided company

### `GET /api/applications`

Returns application data enriched with:

- job info
- company info
- student profile basics

### `POST /api/applications`

Creates a new student application if one does not already exist.

### `PATCH /api/applications/[applicationId]`

Updates application status.

Security:

- verifies the caller’s Supabase access token
- verifies the caller owns the company associated with the application’s job

## Seed Data

Demo data is available in:

- `scripts/seed-demo.sql`

It creates:

- admin login
- recruiter/company accounts
- student accounts
- company records
- job listings
- application records
- notifications

## Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

## Local Development

### Install

```bash
pnpm install
```

### Configure environment

Create `.env.local` with the Supabase keys listed above.

### Initialize database

Run the contents of:

- `scripts/init-db.sql`

Optional demo data:

- `scripts/seed-demo.sql`

### Start the app

```bash
pnpm dev
```

### Production build

```bash
pnpm build
```

Note:

- on this Windows environment, the Next.js compile succeeds but the process ends with a local `spawn EPERM`
- Vercel remains the authoritative production build environment

## Current Product Status

Working:

- auth
- avatar-based onboarding
- profile management
- job browsing
- applications
- recruiter job management

Still worth improving over time:

- deeper admin tools
- resume upload storage instead of URL-only input
- richer recruiter analytics
- more automated test coverage
- stricter end-to-end validation around profile completeness

## Important Files to Read First

If you are new to the repository, read these in order:

1. `README.md`
2. `scripts/init-db.sql`
3. `SUPABASE_SETUP.md`
4. `app/profile/page.tsx`
5. `app/api/jobs/route.ts`
6. `app/api/applications/route.ts`
7. `app/api/auth/signup/route.ts`

## License

MIT
