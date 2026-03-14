# LaunchPad Deployment Guide

## Deploy to Vercel (Recommended)

Vercel is the optimal hosting platform for Next.js applications and makes deployment seamless.

### Prerequisites
- Vercel account (free at https://vercel.com)
- GitHub account with your LaunchPad repository
- Supabase project set up and configured

### Step 1: Push Code to GitHub

```bash
# Initialize git if not already done
git init
git add .
git commit -m "Initial commit: LaunchPad application"

# Create repository on GitHub and push
git remote add origin https://github.com/yourusername/launchpad.git
git branch -M main
git push -u origin main
```

### Step 2: Connect to Vercel

1. Go to https://vercel.com/dashboard
2. Click "Add New..." → "Project"
3. Select your GitHub repository
4. Click "Import"

### Step 3: Add Environment Variables

In the Vercel project settings:

1. Go to **Settings** → **Environment Variables**
2. Add the following variables:

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
```

3. Select which environments these apply to (all recommended)
4. Click "Save"

### Step 4: Deploy

1. Click "Deploy"
2. Wait for build to complete (usually 2-3 minutes)
3. Your app will be live at `your-app.vercel.app`

**That's it!** Your LaunchPad instance is now live.

## Custom Domain (Optional)

To use your own domain:

1. In Vercel project, go to **Settings** → **Domains**
2. Enter your domain name
3. Follow DNS configuration instructions
4. Update your domain registrar's DNS settings
5. DNS propagation usually takes 24-48 hours

## Environment Variable Checklist

Before deploying, ensure these are set:

| Variable | Source | Required |
|----------|--------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Project Settings | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Project Settings | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Project Settings | Yes |

## Production Supabase Setup

### Enable Additional Security Features

1. **Authentication**
   - Disable signups if only invite-based
   - Configure email templates
   - Set up email provider

2. **Database**
   - Enable backup schedule
   - Set up point-in-time recovery
   - Monitor database metrics

3. **Row Level Security**
   - Verify all RLS policies are enabled
   - Test policies with different user roles
   - Monitor slow queries

### Monitoring

1. **Supabase Dashboard**
   - Check database metrics
   - Monitor API usage
   - Review error logs

2. **Vercel Analytics**
   - Check deployment metrics
   - Monitor performance
   - Review error tracking

## Post-Deployment Checklist

- [ ] Test signup and login flows
- [ ] Test job posting and applications
- [ ] Verify email notifications work
- [ ] Test on mobile devices
- [ ] Check performance metrics
- [ ] Monitor error logs
- [ ] Verify HTTPS is enabled
- [ ] Test real-time updates
- [ ] Check database backup status
- [ ] Document any customizations

## CI/CD Pipeline

Vercel automatically sets up CI/CD:

1. **Preview Deployments**: Every pull request gets a preview URL
2. **Production Deployments**: Merging to main deploys to production
3. **Automatic Builds**: Code is built and tested before deployment

### GitHub Integration Benefits

- Automatic preview links on PRs
- One-click rollbacks to previous versions
- Automatic deploy on merge to main
- Performance monitoring
- Security updates

## Scaling Considerations

### Database
- Monitor database connections
- Optimize slow queries using Supabase metrics
- Consider read replicas for high traffic
- Use connection pooling if hitting limits

### Compute
- Vercel scales automatically
- Monitor function execution time
- Optimize API response times

### Storage
- Use Supabase Storage for files
- Consider CDN for images
- Monitor storage usage

## Troubleshooting Deployment

### Build Fails
```
Error: Missing environment variables
```
Solution: Add all required env vars to Vercel

### Database Connection Error
```
Error: Failed to connect to database
```
Solution: Check Supabase credentials are correct

### Blank Page / 500 Error
```
Error: Application not responding
```
Solution: Check logs in Vercel and Supabase dashboards

## Monitoring in Production

### Set Up Alerts

1. **Vercel**: Enable error notifications
2. **Supabase**: Set up database alerts
3. **Custom**: Implement error tracking (Sentry optional)

### Recommended Monitoring Tools

- **Error Tracking**: Sentry (free tier available)
- **Performance**: Vercel Web Analytics
- **Database**: Supabase Dashboard metrics
- **Uptime**: StatusPage.io

## Backup and Recovery

### Supabase Backups
- Automated daily backups included
- Point-in-time recovery available
- Backup retention: 7 days (free), longer on pro

### Vercel
- Can roll back to previous deployments anytime
- Deployment history available in dashboard

## Cost Estimates

### Free Tier (Starting Point)
- **Vercel**: Free tier covers most projects
- **Supabase**: 500MB storage, basic auth, real-time

### Expected Monthly Costs (Growth)
- **Vercel**: $20-100+ depending on bandwidth
- **Supabase**: $25-100+ depending on usage

### Cost Optimization
- Cache static content
- Optimize database queries
- Use edge functions efficiently
- Monitor resource usage

## Performance Optimization for Production

### Database Optimization
```sql
-- Add more indexes for common queries
CREATE INDEX idx_jobs_deadline ON public.jobs(deadline);
CREATE INDEX idx_applications_updated_at ON public.applications(updated_at);
```

### API Optimization
- Implement request caching
- Batch multiple requests where possible
- Use pagination for large datasets
- Compress responses

### Frontend Optimization
- Enable Next.js Image Optimization
- Code splitting (automatic in Next.js)
- Cache busting for static assets
- Lazy load components

## Security Hardening

### Supabase
- Enable 2FA for account
- Rotate API keys regularly
- Use service role key only on backend
- Monitor API quota usage

### Vercel
- Enable branch protection
- Require status checks to pass
- Use deployment protection rules
- Monitor for suspicious activity

## Automated Deployment Tips

### GitHub Actions (Optional)
You can add additional automated tests before deployment:

```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run lint
      - run: npm run test # if tests exist
```

## Rollback Procedure

If something goes wrong in production:

1. Go to Vercel Dashboard
2. Go to Deployments
3. Click the three dots on the previous good version
4. Click "Promote to Production"
5. Confirm the rollback

Takes ~1-2 minutes to revert.

## Support Resources

- **Vercel Docs**: https://vercel.com/docs
- **Supabase Docs**: https://supabase.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **GitHub Issues**: Create issue in your repository

---

## Quick Deployment Command Reference

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy from project directory
vercel

# Deploy and set production environment
vercel --prod

# View deployment logs
vercel logs

# Check deployment status
vercel status
```

---

**Deployment Status**: Ready for production
**Last Updated**: March 2026

Your LaunchPad application is production-ready and can be deployed immediately using Vercel!
