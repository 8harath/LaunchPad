# LaunchPad - Hackathon Career Platform

LaunchPad is a comprehensive web application that connects students with companies at hackathons. It provides a seamless job browsing experience for students and powerful application management tools for companies.

## Features

### For Students
- 🔍 **Browse Jobs**: Discover opportunities posted by companies
- 💼 **Apply to Jobs**: Submit applications with custom cover letters
- 📊 **Track Applications**: Monitor the status of your applications in real-time
- 👤 **Profile Management**: Create and customize your student profile

### For Companies
- 📝 **Post Jobs**: Create detailed job postings with requirements
- 📋 **Manage Applications**: Review applications and track candidates
- 🔔 **Notifications**: Receive real-time updates on new applications
- 📊 **Analytics**: View application metrics for your postings

### For Admins
- 🎛️ **System Settings**: Configure platform-wide settings
- 👥 **User Management**: Manage user roles and permissions
- 📈 **Analytics Dashboard**: Track platform metrics

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS v4, shadcn/ui
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL via Supabase
- **Real-time**: Supabase Realtime subscriptions
- **Authentication**: Supabase Auth

## Getting Started

### Prerequisites
- Node.js 18+ 
- pnpm (or npm)
- Supabase account and project

### Installation

1. **Clone the repository** (or download the code)
```bash
cd launchpad
pnpm install
```

2. **Set up Supabase**
   - Create a Supabase project at https://app.supabase.com
   - Copy your project URL and API keys
   - Add them to `.env.local`:
     ```
     NEXT_PUBLIC_SUPABASE_URL=your_url_here
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
     SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
     ```

3. **Initialize Database**
   - See `SUPABASE_SETUP.md` for detailed database setup instructions
   - Copy the SQL from `/scripts/init-db.sql` and execute it in Supabase SQL Editor

4. **Run the development server**
```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
launchpad/
├── app/
│   ├── api/                          # API routes
│   │   ├── auth/                     # Authentication endpoints
│   │   ├── applications/             # Application management
│   │   └── jobs/                     # Job management
│   ├── auth/                         # Auth pages (login, signup)
│   ├── browse/                       # Job browsing
│   │   └── [jobId]/                  # Job detail page
│   ├── dashboard/
│   │   ├── student/                  # Student dashboard
│   │   └── company/                  # Company dashboard
│   ├── page.tsx                      # Landing page
│   ├── layout.tsx                    # Root layout
│   └── globals.css                   # Global styles
├── components/
│   ├── navbar.tsx                    # Navigation component
│   ├── job-card.tsx                  # Job card component
│   ├── status-badge.tsx              # Status badge component
│   └── ui/                           # shadcn/ui components
├── hooks/
│   └── use-notifications.ts          # Real-time notifications hook
├── lib/
│   └── supabase.ts                   # Supabase client and helpers
├── types/
│   └── database.ts                   # Database type definitions
├── scripts/
│   └── init-db.sql                   # Database initialization script
├── SUPABASE_SETUP.md                 # Detailed Supabase setup guide
└── package.json                      # Dependencies
```

## Key Features

### 1. Authentication
- Email/password signup and login
- Role-based access (student, company, admin)
- Secure session management via Supabase Auth

### 2. Job Management
- Companies can post detailed job listings
- Full text search and filtering
- Application deadline tracking
- Job status management (open, closed, filled)

### 3. Application Tracking
- Students can apply to jobs with cover letters
- Companies can review applications
- Real-time status updates via notifications
- Application history for students

### 4. Real-time Updates
- Supabase Realtime subscriptions for notifications
- Live application status changes
- Instant notifications for new applications

### 5. Responsive Design
- Mobile-first approach
- Works on desktop, tablet, and mobile devices
- Optimized for various screen sizes

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new account
- `POST /api/auth/login` - Login user

### Jobs
- `GET /api/jobs` - List jobs (supports filters)
- `POST /api/jobs` - Create new job (company only)

### Applications
- `GET /api/applications` - List applications
- `POST /api/applications` - Submit application
- `PATCH /api/applications/[id]` - Update application status

## Database Schema

See `SUPABASE_SETUP.md` for complete database schema documentation.

Key tables:
- `profiles` - User profiles
- `companies` - Company information
- `student_profiles` - Student-specific data
- `jobs` - Job postings
- `applications` - Job applications
- `notifications` - User notifications
- `admin_settings` - System settings

## Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

## Deployment

### Deploy to Vercel

1. **Connect your GitHub repository** to Vercel
2. **Set environment variables** in Vercel project settings
3. **Deploy** - Vercel will automatically build and deploy your app

```bash
# Or use Vercel CLI
vercel
```

## Testing Workflows

### Student Workflow
1. Sign up as student
2. Go to "Browse Jobs"
3. Click on a job to view details
4. Click "Apply Now" to submit application
5. Visit "My Applications" dashboard to track status

### Company Workflow
1. Sign up as company
2. Go to "Post New Job" in dashboard
3. Fill in job details and click "Post Job"
4. View applications in "Applications" section
5. Update application status (Reviewing, Accepted, Rejected, etc.)

## Performance Optimizations

- Server-side rendering for landing page
- Client-side caching with SWR
- Optimized Supabase queries with indexes
- Responsive images
- CSS-in-JS optimization with Tailwind

## Security Features

- Row Level Security (RLS) on all tables
- Parameterized queries to prevent SQL injection
- Secure authentication via Supabase
- Protected API routes with auth verification
- HTTPS only in production

## Contributing

1. Create a feature branch
2. Make your changes
3. Submit a pull request

## Support

For detailed setup instructions, see `SUPABASE_SETUP.md`.

For issues or questions, please open an issue on GitHub.

## License

MIT License

## Acknowledgments

Built with Next.js, React, Supabase, and shadcn/ui.
