# LaunchPad Setup Checklist

Complete these steps to get your LaunchPad application running locally and deployed.

## Phase 1: Local Setup (15 minutes)

### 1.1 Environment Setup
- [ ] Install Node.js 18+ (if not already installed)
- [ ] Install pnpm: `npm install -g pnpm`
- [ ] Navigate to project directory
- [ ] Run `pnpm install` to install dependencies

### 1.2 Create Supabase Project
- [ ] Go to https://app.supabase.com
- [ ] Click "New Project"
- [ ] Fill in project name, password, region
- [ ] Wait for project to be provisioned (2-3 minutes)

### 1.3 Get Supabase Credentials
- [ ] Go to Project Settings → API
- [ ] Copy **Project URL**
- [ ] Copy **Anon Public Key** (under "anon [public]")
- [ ] Copy **Service Role Key** (under "service_role [secret]")

### 1.4 Create Environment File
- [ ] Create `.env.local` in project root
- [ ] Add:
```
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```
- [ ] Save the file

### 1.5 Initialize Database
- [ ] In Supabase dashboard, go to SQL Editor
- [ ] Click "New Query"
- [ ] Open `/scripts/init-db.sql` in text editor
- [ ] Copy entire content
- [ ] Paste into Supabase SQL Editor
- [ ] Click "Execute"
- [ ] Wait for execution to complete (should show no errors)

### 1.6 Verify Database Setup
- [ ] In Supabase, go to Table Editor
- [ ] Verify these tables exist:
  - [ ] profiles
  - [ ] companies
  - [ ] student_profiles
  - [ ] jobs
  - [ ] job_details
  - [ ] applications
  - [ ] notifications
  - [ ] admin_settings

## Phase 2: Local Testing (10 minutes)

### 2.1 Start Development Server
- [ ] Run `pnpm dev` in project directory
- [ ] Wait for "ready - started server on 0.0.0.0:3000"
- [ ] Open http://localhost:3000 in browser

### 2.2 Test Landing Page
- [ ] Verify landing page loads
- [ ] Check that navbar displays correctly
- [ ] Verify all sections render
- [ ] Check links work (at least Browse Jobs)

### 2.3 Test Student Signup
- [ ] Click "Sign Up"
- [ ] Select "Student" role
- [ ] Fill in email, password, full name, university
- [ ] Click "Sign Up"
- [ ] Verify redirected to dashboard

### 2.4 Test Browse Jobs
- [ ] Click "Browse Jobs"
- [ ] Verify page loads (should show "No jobs yet" or 0 jobs)
- [ ] Search/filter works if jobs exist

### 2.5 Test Company Signup
- [ ] Logout (or use incognito window)
- [ ] Click "Sign Up"
- [ ] Select "Company" role
- [ ] Fill in details, company name
- [ ] Click "Sign Up"
- [ ] Verify redirected to company dashboard

### 2.6 Test Job Posting
- [ ] Click "Post New Job"
- [ ] Fill in:
  - [ ] Job Title
  - [ ] Description
  - [ ] Location
  - [ ] Job Type
  - [ ] Requirements
- [ ] Click "Post Job"
- [ ] Verify job appears in company dashboard

### 2.7 Test Application Flow (as Student)
- [ ] Login as student
- [ ] Go to "Browse Jobs"
- [ ] Click on the posted job
- [ ] Click "Apply Now"
- [ ] Verify application submitted
- [ ] Check student dashboard for application

### 2.8 Test Application Status (as Company)
- [ ] Logout, login as company
- [ ] Go to Dashboard
- [ ] Click "View Applications" on job
- [ ] See student application
- [ ] Change status to "Reviewing"
- [ ] Verify change saved

## Phase 3: Pre-Deployment Verification (5 minutes)

### 3.1 Code Quality
- [ ] Run `pnpm lint` (should pass with no errors)
- [ ] No console errors in browser devtools
- [ ] All pages load without errors

### 3.2 Database Verification
- [ ] Can create users
- [ ] Can create jobs
- [ ] Can create applications
- [ ] Can update application status
- [ ] RLS policies are working (verify in Supabase)

### 3.3 Performance Check
- [ ] Pages load quickly (< 2 seconds)
- [ ] No N+1 query problems visible
- [ ] Real-time updates work smoothly

### 3.4 Security Check
- [ ] Cannot access other users' data
- [ ] Company can only see their own jobs
- [ ] Student cannot modify company data
- [ ] Logout works properly

## Phase 4: Deployment (10 minutes)

### 4.1 Prepare for Deployment
- [ ] Commit all changes: `git add . && git commit -m "LaunchPad setup complete"`
- [ ] Push to GitHub: `git push origin main`
- [ ] Verify code is on GitHub

### 4.2 Deploy to Vercel
- [ ] Go to https://vercel.com/dashboard
- [ ] Click "Add New..." → "Project"
- [ ] Select your GitHub repository
- [ ] Click "Import"

### 4.3 Configure Environment Variables in Vercel
- [ ] Go to **Settings** → **Environment Variables**
- [ ] Add `NEXT_PUBLIC_SUPABASE_URL` (your Supabase project URL)
- [ ] Add `NEXT_PUBLIC_SUPABASE_ANON_KEY` (anon public key)
- [ ] Add `SUPABASE_SERVICE_ROLE_KEY` (service role key)
- [ ] Click "Save"

### 4.4 Deploy
- [ ] Click "Deploy" button
- [ ] Wait for deployment to complete (2-3 minutes)
- [ ] Click on deployed URL to verify it works

### 4.5 Test Production
- [ ] Load your Vercel URL
- [ ] Repeat signup and job posting tests
- [ ] Verify everything works the same as local

## Phase 5: Post-Deployment (5 minutes)

### 5.1 Monitoring Setup
- [ ] Enable Vercel Analytics (optional but recommended)
- [ ] Check Supabase dashboard for any errors
- [ ] Set up Sentry or similar error tracking (optional)

### 5.2 Documentation
- [ ] Share project links with team
- [ ] Document any custom modifications made
- [ ] Create admin account in production
- [ ] Share credentials securely with team

### 5.3 Backup Verification
- [ ] Verify Supabase backup schedule is enabled
- [ ] Test restore procedure (optional)
- [ ] Document backup location

## Common Mistakes to Avoid

❌ **Don't:**
- Run SQL script without reading it first
- Share API keys in code or repository
- Forget to add environment variables before deploying
- Deploy without testing locally first
- Use production database credentials in development

✅ **Do:**
- Keep `.env.local` in `.gitignore`
- Store credentials securely
- Test all features before deploying
- Use separate Supabase projects for dev/prod (optional but recommended)
- Keep documentation updated

## Troubleshooting

### "Missing environment variable" error
→ Check `.env.local` has all three variables and correct values

### Database connection fails
→ Verify Supabase URL and keys are correct (no trailing spaces)

### Signup not working
→ Check Supabase Auth is enabled in project
→ Verify email confirmation isn't required (uncheck in settings if needed)

### Job posting fails
→ Verify you're logged in as company
→ Check all required fields are filled
→ Check browser console for error details

### Can't see jobs after posting
→ Refresh the browse page
→ Check RLS policies in Supabase (jobs table)

### Real-time not updating
→ Check browser console for websocket errors
→ Verify Supabase Realtime is enabled
→ Try refreshing the page

## Next Steps After Setup

1. **Customize Branding**
   - [ ] Change company name in navbar
   - [ ] Update colors in `/app/globals.css`
   - [ ] Add your logo

2. **Add Advanced Features**
   - [ ] Student resume upload
   - [ ] Company logo upload
   - [ ] User profiles
   - [ ] Email notifications
   - [ ] Chat system

3. **Optimize Performance**
   - [ ] Add caching
   - [ ] Optimize database queries
   - [ ] Enable image optimization
   - [ ] Add monitoring

4. **Scale the Application**
   - [ ] Set up CI/CD pipeline
   - [ ] Add automated tests
   - [ ] Implement rate limiting
   - [ ] Set up proper logging

## Getting Help

| Issue | Resource |
|-------|----------|
| Setup questions | See `QUICKSTART.md` |
| Database issues | See `SUPABASE_SETUP.md` |
| Deployment issues | See `DEPLOYMENT.md` |
| Architecture questions | See `BUILD_SUMMARY.md` |
| Full documentation | See `README.md` |

---

## Progress Tracking

- [ ] Phase 1: Local Setup - **Estimated: 15 min**
- [ ] Phase 2: Local Testing - **Estimated: 10 min**
- [ ] Phase 3: Pre-Deployment Verification - **Estimated: 5 min**
- [ ] Phase 4: Deployment - **Estimated: 10 min**
- [ ] Phase 5: Post-Deployment - **Estimated: 5 min**

**Total Time**: ~45 minutes from start to live production deployment

---

**Status**: Ready to begin setup
**Date**: March 14, 2026

Start with Phase 1 and work through each phase sequentially. Good luck! 🚀
