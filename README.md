# LaunchPad

LaunchPad is a recruitment platform for two primary user groups:

- students who want to create a detailed professional profile, browse opportunities, apply for roles, and track application progress
- recruiters or companies who want to create a hiring presence, publish jobs, review incoming applications, and manage hiring workflow in one place

This repository contains the full web application, including:

- the Next.js frontend
- authenticated API routes
- the Supabase PostgreSQL schema and RLS policies
- seed scripts for demo data
- profile, job, and application management flows

This README is the single source of documentation for the repository. It is intentionally detailed so that someone opening the repository can understand the platform, architecture, database design, and implementation choices without needing a stack of separate markdown files.

## Project Context

LaunchPad was created by:

- Bharath K
- Karthik S Gowda
- Lakshith S Lokesh

This application was built as part of IBM training focused on designing and delivering practical web applications. The current repository represents a working recruitment platform output from that training, and it is intentionally structured so future batches or reviewers can understand, extend, and iterate on it.

## Product Summary

LaunchPad supports a full student-to-recruiter hiring workflow:

1. A user signs up as either a `student` or a `company`.
2. Students complete a recruiter-friendly profile with academic, personal, and professional details.
3. Recruiters configure a company identity and publish jobs.
4. Students browse jobs and apply.
5. Recruiters review applications and update statuses.
6. Students track progress from their dashboard.

The platform is a general recruitment platform for students and recruiters.

## Roles

### Student

Students can:

- create an account
- select an avatar during onboarding
- edit a detailed profile
- browse jobs
- apply to jobs
- track applications

### Company / Recruiter

Recruiters can:

- create an account
- configure a company profile
- post jobs
- view applicants
- update application statuses

### Admin

Admins exist in the schema for future operational controls and settings.

## Core Flows

### Authentication

Authentication is powered by Supabase Auth.

Supported methods:

- email/password signup
- email/password login
- Google OAuth

On signup:

- an auth user is created
- a `profiles` row is created
- a role-specific row is created in `student_profiles` or `companies`
- the user is redirected to profile setup

On first Google login:

- the callback route exchanges the auth code for a session
- if the user does not already exist in `profiles`, a profile row is created
- a student profile row is also created
- the user is redirected to `/profile?welcome=1`

### Profile Management

The `/profile` page is the main editable profile surface.

Shared profile fields:

- full name
- avatar
- bio

Student profile fields:

- university
- major
- graduation year
- professional headline
- date of birth
- phone
- location
- current title
- current company
- years of experience
- experience summary
- project highlights
- certifications
- languages
- availability / notice period
- skills
- preferred job types
- expected salary min/max
- resume URL
- GitHub URL
- LinkedIn URL
- portfolio URL
- Twitter / X URL
- Instagram URL
- LeetCode URL
- Devfolio URL

Company profile fields:

- company name
- industry
- location
- website
- size
- description
- logo URL

### Job Discovery

Students browse jobs from `/browse`.

Current features:

- search
- location filtering
- job type filtering
- detail pages at `/browse/[jobId]`

### Applications

Students apply through `POST /api/applications`.

Recruiters manage applications from the company dashboard and update status through `PATCH /api/applications/[applicationId]`.

### Dashboards

Student dashboard:

- shows the student's applications
- reflects application status changes

Company dashboard:

- shows the company's job postings
- links to application review pages

## Technical Architecture

### Stack

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS v4
- shadcn/ui
- Supabase Auth
- Supabase Postgres

### Why This Stack

- Next.js App Router gives a strong foundation for building a modern React application with both client and server boundaries in one repository.
- TypeScript improves maintainability and makes the data contract between UI, API routes, and Supabase much safer.
- Tailwind CSS and shadcn/ui help standardize spacing, form controls, cards, and interaction states across the application.
- Supabase reduces setup overhead by combining authentication, PostgreSQL, SQL migrations, and policy-based data access in one platform.
- PostgreSQL works well for relational hiring data because users, companies, jobs, and applications are naturally interconnected.

### Architectural Layers

#### UI Layer

Located primarily in:

- `app/`
- `components/`

Responsibilities:

- render pages
- collect user input
- orchestrate client flows
- call Supabase or API routes

#### API Layer

Located in:

- `app/api/`

Responsibilities:

- privileged reads and writes
- role verification
- token-based authorization for protected mutations
- response shaping for frontend consumption

#### Data Layer

Defined in:

- `scripts/init-db.sql`
- `types/database.ts`
- `lib/supabase.ts`

Responsibilities:

- table design
- enum definitions
- RLS policy setup
- indexing
- typed database access

### Data Access Strategy

The project uses a hybrid approach:

- direct client-side Supabase access for user-owned profile reads and writes
- API routes with service-role access for privileged operations such as listing enriched jobs, creating jobs, and application orchestration

This structure works well for a Supabase-backed App Router application because:

- RLS protects user-owned updates
- server routes can safely aggregate cross-table data
- sensitive mutations can verify access tokens on the server

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
  globals.css
  layout.tsx
  page.tsx

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

The platform uses a Supabase-managed PostgreSQL database under the `public` schema.

### `profiles`

Purpose:

- canonical application-level identity record for every authenticated user

Key columns:

- `id`: foreign key to `auth.users.id`
- `email`
- `full_name`
- `role`
- `avatar_url`
- `bio`
- `created_at`
- `updated_at`

### `student_profiles`

Purpose:

- stores student-specific information recruiters need during evaluation

Key columns:

- `id`
- `university`
- `major`
- `graduation_year`
- `headline`
- `date_of_birth`
- `phone`
- `location`
- `current_title`
- `current_company`
- `years_of_experience`
- `experience_summary`
- `project_highlights`
- `certifications`
- `languages`
- `availability_notice_period`
- `skills` (`TEXT[]`)
- `preferred_job_types` (`TEXT[]`)
- `expected_salary_min`
- `expected_salary_max`
- `resume_url`
- `github_url`
- `linkedin_url`
- `portfolio_url`
- `twitter_url`
- `instagram_url`
- `leetcode_url`
- `devfolio_url`
- `created_at`
- `updated_at`

## Table Relationships

The core relational structure is:

- `auth.users` -> `profiles`
- `profiles` -> `student_profiles` for student users
- `profiles` -> `companies.admin_id` for recruiter users
- `companies` -> `jobs`
- `jobs` -> `applications`
- `student_profiles` -> `applications`
- `profiles` -> `notifications`

In practical terms:

- every authenticated person first exists in Supabase Auth
- every authenticated person also gets a `profiles` row for application-level identity
- a recruiter controls one company record through `companies.admin_id`
- a company can publish many jobs
- a student can apply to many jobs
- each application joins one student and one job

This structure makes recruiter dashboards possible because the application can trace:

`recruiter -> company -> jobs -> applications -> student`

It also makes student dashboards straightforward:

`student -> applications -> jobs -> company`

### `companies`

Purpose:

- stores recruiter-facing organization details

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

### `jobs`

Purpose:

- stores published job listings

Key columns:

- `id`
- `company_id`
- `title`
- `description`
- `requirements`
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

- optional key/value extension table for additional job metadata

Key columns:

- `id`
- `job_id`
- `key`
- `value`
- `created_at`

### `applications`

Purpose:

- connects students to jobs and stores application lifecycle data

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

- `UNIQUE(job_id, student_id)` ensures one application per student per job

### `notifications`

Purpose:

- stores per-user notifications for workflow events

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

- stores future platform-level configuration

Key columns:

- `id`
- `key`
- `value`
- `created_at`
- `updated_at`

## Row Level Security

RLS is enabled across the main tables.

Current intent:

- users can update their own `profiles` row
- students can update their own `student_profiles` row
- recruiter admins can update their own `companies` row
- only company admins can create and modify jobs for their company
- students can insert and read their own applications
- recruiters can read applications for their own jobs

RLS is important in this project because the frontend talks directly to Supabase for some profile operations. Policies help ensure that even if a malicious client tries to craft a manual request, they still cannot freely write to another user's row.

## Authentication and Password Handling

LaunchPad does not store raw passwords in the `public` schema.

For email and password authentication:

- credentials are managed by Supabase Auth
- password material is stored as a hash in the managed `auth.users` schema
- application tables such as `profiles`, `student_profiles`, and `companies` do not contain plaintext passwords

This is an important separation of responsibility:

- Supabase Auth handles identity and session security
- the `public` schema handles product data

The demo seed script inserts auth users for local or evaluation convenience, but even there the password is inserted in hashed form using PostgreSQL cryptographic helpers rather than as raw plaintext in an application table.

## OAuth and Google Sign-In

Google sign-in is implemented through Supabase OAuth.

High-level flow:

1. The user chooses Google sign-in from the frontend.
2. Supabase redirects the user to Google's consent screen.
3. After Google authentication, the browser returns to the application callback route.
4. The callback route exchanges the code for a Supabase session.
5. The app ensures a `profiles` row exists.
6. If needed, it creates a matching `student_profiles` row for onboarding.
7. The user is redirected into the application, usually to `/profile?welcome=1`.

This approach is simpler and safer than hand-rolling OAuth because session creation, token lifecycle, and provider integration are delegated to Supabase.

## API Documentation

### `POST /api/auth/signup`

Creates:

- auth user
- `profiles` row
- `student_profiles` or `companies` row depending on role

### `POST /api/auth/login`

Authenticates the user and returns session plus role information.

### `GET /api/jobs`

Supports:

- listing open jobs
- filtering by title
- filtering by location
- filtering by company
- fetching a single job by `jobId`

### `POST /api/jobs`

Creates a job posting.

Security:

- verifies the caller's Supabase access token
- verifies the caller owns the company passed in the request

### `GET /api/applications`

Returns application data enriched with related job, company, and student profile basics.

The response is intentionally enriched so recruiter screens can show:

- student identity
- academic background
- experience summary
- links such as GitHub, LinkedIn, portfolio, LeetCode, and other socials
- salary preference and availability context

### `POST /api/applications`

Creates a new application if one does not already exist.

### `PATCH /api/applications/[applicationId]`

Updates application status.

Security:

- verifies the caller's Supabase access token
- verifies the caller owns the company related to the application's job

## Seed Data

Demo data is provided in:

- `scripts/seed-demo.sql`

The seed script creates:

- admin account
- recruiter accounts
- student accounts
- company records
- jobs
- applications
- notifications

The seeded student data is intentionally richer than a minimal demo. It includes academic information, professional context, social and portfolio links, compensation expectations, and summary fields so faculty and reviewers can inspect the full product experience.

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

Create `.env.local` with the required Supabase keys.

### Initialize the database

Run:

- `scripts/init-db.sql`

Optional demo data:

- `scripts/seed-demo.sql`

### Start development

```bash
pnpm dev
```

### Run production build

```bash
pnpm build
```

Note:

- on this Windows environment, Next.js compilation succeeds but the process currently ends with a local `spawn EPERM`
- Vercel is the reliable production build environment

## Current State

Implemented:

- auth
- avatar-based onboarding
- profile editing
- richer student profiles
- company profiles
- job browsing
- applications
- recruiter-side application management

Still worth improving:

- resume file uploads to Supabase Storage
- profile completion scoring
- recruiter analytics
- stronger automated test coverage
- more complete admin tooling

## Recommended Reading Order

If you are new to the repository, start with:

1. `README.md`
2. `scripts/init-db.sql`
3. `app/profile/page.tsx`
4. `app/api/jobs/route.ts`
5. `app/api/applications/route.ts`
6. `app/api/auth/signup/route.ts`

## License

MIT
