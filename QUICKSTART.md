# LaunchPad Quick Start Guide

## 5-Minute Setup

### Step 1: Install Dependencies
```bash
pnpm install
```

### Step 2: Set Up Supabase

1. Go to https://app.supabase.com and create a new project
2. Copy your project credentials:
   - Project URL
   - Anon Public Key
   - Service Role Key

3. Create `.env.local` in your project root:
```
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Step 3: Initialize Database

1. In Supabase dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy the entire contents of `/scripts/init-db.sql`
4. Paste it into the SQL Editor
5. Click **Execute**

**Important**: Execute the SQL in order. Wait for each section to complete before moving to the next.

### Step 4: Run Development Server
```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000)

## Testing the Application

### As a Student

1. Click **Sign Up** → Select **Student**
2. Fill in your details and sign up
3. Click **Browse Jobs**
4. Click on any job to view details
5. Click **Apply Now**
6. Go to dashboard to see your applications

### As a Company

1. Click **Sign Up** → Select **Company**
2. Fill in company details
3. Go to dashboard
4. Click **Post New Job**
5. Fill in job details and post
6. View applications in your dashboard
7. Change application statuses

## Key Pages

| Page | URL | Who Can Access |
|------|-----|---|
| Landing | `/` | Everyone |
| Login | `/auth/login` | Everyone |
| Signup | `/auth/signup` | Everyone |
| Browse Jobs | `/browse` | Everyone |
| Job Detail | `/browse/[jobId]` | Everyone |
| Student Dashboard | `/dashboard/student` | Students |
| Company Dashboard | `/dashboard/company` | Companies |
| Post Job | `/dashboard/company/post-job` | Companies |
| View Applications | `/dashboard/company/applications/[jobId]` | Companies |

## Troubleshooting

### Database Connection Error
- Check `.env.local` has correct Supabase credentials
- Verify database tables exist in Supabase dashboard
- Run the SQL initialization script again

### Authentication Issues
- Clear browser cookies/cache
- Ensure you're using correct email and password
- Check that user was created in Supabase Auth tab

### Missing Tables
- Re-run the SQL script from `/scripts/init-db.sql`
- Check that all sections executed without errors

## Features Overview

### Real-time Notifications
- Changes to application status are instant
- Students get notified when company updates their application
- No page refresh needed

### Search and Filter
- Filter jobs by location, title, company
- Coming soon: Advanced filters for skills, salary range

### Role-Based Access
- Different dashboards for students and companies
- Admins can configure system settings
- Row-level security protects user data

## Next Steps

1. **Customize Branding**: Edit company name, colors, and content
2. **Add More Fields**: Extend student profile with skills, resume, etc.
3. **Deploy to Vercel**: Use `vercel` command or GitHub integration
4. **Set Up Email**: Configure Supabase email provider for notifications
5. **Add Payment**: Integrate Stripe for premium features

## Useful Resources

- [Supabase Docs](https://supabase.com/docs)
- [Next.js Docs](https://nextjs.org/docs)
- [React Docs](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com/docs)

## Common Tasks

### Add a New Job Field
1. Update database schema in `/scripts/init-db.sql`
2. Update types in `/types/database.ts`
3. Update API routes in `/app/api/jobs`
4. Update form in `/app/dashboard/company/post-job`

### Customize Colors
1. Edit design tokens in `/app/globals.css`
2. Update color values in `:root` and `.dark` sections
3. Rebuild project

### Add New API Endpoint
1. Create new file in `/app/api/`
2. Implement GET, POST, PATCH, DELETE as needed
3. Add Supabase queries
4. Add error handling

## Support

For detailed information, see:
- `README.md` - Full documentation
- `SUPABASE_SETUP.md` - Database setup details
- `/scripts/init-db.sql` - SQL schema definition

Happy building! 🚀
