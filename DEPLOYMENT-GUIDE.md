# Deployment Guide - Ostendo Portfolio Platform

## Quick Start - Apply Security Updates

### Step 1: Apply Database Migrations

```powershell
# Navigate to project directory
cd "c:\Users\John Lloyd\OneDrive\Music\WEBAPP"

# Generate and apply migrations
npx prisma migrate dev --name add_security_improvements

# You should see output like:
# ✔ Generated Prisma Client
# ✔ Applied migration add_security_improvements
```

### Step 2: Restart Development Server

```powershell
# Stop current server (Ctrl+C)
# Then start again
npm run dev
```

### Step 3: Test Rate Limiting

Open your browser and test:

1. **Login Rate Limiting**
   - Go to http://localhost:3000/login
   - Try logging in 6 times with wrong password
   - Should see "Too many login attempts" message

2. **Signup Rate Limiting**
   - Go to http://localhost:3000/signup
   - Try signing up 4 times rapidly
   - Should see rate limit message

3. **Contact Form**
   - Visit any published portfolio
   - Try submitting contact form 6 times
   - Should see rate limit message

---

## Production Deployment Checklist

### Prerequisites
- [ ] MySQL database (8.0+)
- [ ] Node.js 18+ installed
- [ ] Vercel account (or other hosting)
- [ ] Domain name (optional)

### 1. Environment Setup

Create `.env.production` file:

```env
# Database (use your production MySQL)
DATABASE_URL="mysql://username:password@host:3306/database_name"

# Generate secure session secret (64+ characters)
SESSION_SECRET="[use: openssl rand -base64 64]"

# Your production URL
APP_URL="https://yourdomain.com"

# Email provider (use transactional email service)
EMAIL_PROVIDER="console"  # Change to your email service

# Production mode
NODE_ENV="production"
```

### 2. Database Setup

```powershell
# Run migrations on production database
npx prisma migrate deploy

# Verify migrations applied
npx prisma migrate status
```

### 3. Build and Test

```powershell
# Build production bundle
npm run build

# Test production build locally
npm run start

# Visit http://localhost:3000 and test functionality
```

### 4. Deploy to Vercel

```powershell
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod

# Add environment variables in Vercel dashboard:
# - DATABASE_URL
# - SESSION_SECRET
# - APP_URL
# - EMAIL_PROVIDER
```

---

## Post-Deployment Setup

### 1. Set Up Cleanup Cron Job

Create cleanup script in your project:

**File**: `scripts/cleanup-tokens.js`
```javascript
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function cleanup() {
  const now = new Date()
  
  // Cleanup expired email verifications
  const emailTokens = await prisma.emailVerification.deleteMany({
    where: { expiresAt: { lt: now } }
  })
  
  // Cleanup expired password resets
  const passwordTokens = await prisma.passwordReset.deleteMany({
    where: { expiresAt: { lt: now } }
  })
  
  // Cleanup expired rate limits
  const rateLimits = await prisma.rateLimit.deleteMany({
    where: { expiresAt: { lt: now } }
  })
  
  console.log('Cleanup complete:', {
    emailTokens: emailTokens.count,
    passwordTokens: passwordTokens.count,
    rateLimits: rateLimits.count
  })
  
  await prisma.$disconnect()
}

cleanup().catch(console.error)
```

**Run daily using:**

**Option A - Windows Task Scheduler**
```powershell
# Create task that runs daily at 3 AM
schtasks /create /tn "Ostendo Token Cleanup" /tr "node c:\path\to\scripts\cleanup-tokens.js" /sc daily /st 03:00
```

**Option B - Vercel Cron (if using Vercel)**

Create API route: `src/app/api/cron/cleanup/route.ts`
```typescript
import { NextRequest } from 'next/server'
import { cleanupExpiredRateLimits } from '@/lib/rate-limit'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  const now = new Date()
  
  // Cleanup expired tokens
  await Promise.all([
    db.emailVerification.deleteMany({ where: { expiresAt: { lt: now } } }),
    db.passwordReset.deleteMany({ where: { expiresAt: { lt: now } } }),
    cleanupExpiredRateLimits()
  ])

  return Response.json({ success: true, timestamp: now })
}
```

Add to `vercel.json`:
```json
{
  "crons": [{
    "path": "/api/cron/cleanup",
    "schedule": "0 3 * * *"
  }]
}
```

### 2. Set Up Monitoring

**Option A - Simple Uptime Monitoring**
- Use UptimeRobot (free): https://uptimerobot.com
- Monitor your main URL every 5 minutes
- Get alerts via email/SMS when down

**Option B - Advanced Monitoring**
```powershell
# Install error tracking
npm install @sentry/nextjs

# Follow Sentry setup: https://docs.sentry.io/platforms/javascript/guides/nextjs/
```

### 3. Database Backups

**MySQL Backup Script** (run daily):
```powershell
# Windows PowerShell backup script
$timestamp = Get-Date -Format "yyyy-MM-dd-HHmmss"
$backupFile = "ostendo-backup-$timestamp.sql"

mysqldump -u username -p database_name > $backupFile

# Optionally upload to cloud storage
```

---

## Security Hardening

### 1. Secure Environment Variables

**Never commit to git:**
```
.env
.env.local
.env.production
```

**Use Vercel environment variables** or similar for production.

### 2. Review IMGBB API Keys

The `.env` file contains multiple ImgBB API keys. For production:

```env
# Option A: Use a dedicated cloud storage service
# AWS S3, Cloudinary, or Vercel Blob

# Option B: Rotate keys regularly
# Generate new keys every 90 days
```

### 3. Enable HTTPS Only

In `src/lib/session.ts`, verify:
```typescript
secure: process.env.NODE_ENV === 'production'  // ✅ Already set
```

### 4. Set Security Headers

Add to `next.config.ts`:
```typescript
const nextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ]
  },
}
```

---

## Performance Optimization

### 1. Enable Database Connection Pooling

Update `DATABASE_URL`:
```env
DATABASE_URL="mysql://user:pass@host:3306/db?connection_limit=10&pool_timeout=30"
```

### 2. Monitor Rate Limit Table Size

```sql
-- Check rate limit table size weekly
SELECT 
  COUNT(*) as total_records,
  COUNT(CASE WHEN expiresAt < NOW() THEN 1 END) as expired_records
FROM RateLimit;

-- If expired > 1000, run manual cleanup
DELETE FROM RateLimit WHERE expiresAt < NOW();
```

### 3. Optimize Images

```powershell
# Install image optimization package
npm install sharp

# Next.js will automatically optimize images in <Image> components
```

---

## Troubleshooting

### Migration Failed

```powershell
# Check migration status
npx prisma migrate status

# If stuck, reset and reapply
npx prisma migrate reset
npx prisma migrate dev
```

### Rate Limiting Not Working

```powershell
# Check if RateLimit table exists
npx prisma studio
# Look for RateLimit table

# Check database connection
node -e "const {PrismaClient} = require('@prisma/client'); new PrismaClient().\$connect().then(() => console.log('Connected')).catch(console.error)"
```

### High Database Load

```sql
-- Check slow queries
SHOW FULL PROCESSLIST;

-- Check index usage
SHOW INDEX FROM User;
SHOW INDEX FROM Project;
SHOW INDEX FROM RateLimit;
```

### Rate Limit Table Growing Too Large

```sql
-- Check table size
SELECT 
  table_name,
  ROUND(((data_length + index_length) / 1024 / 1024), 2) AS "Size (MB)"
FROM information_schema.TABLES
WHERE table_name = 'RateLimit';

-- If > 100MB, increase cleanup frequency
```

---

## Production Testing Checklist

- [ ] All migrations applied successfully
- [ ] Environment variables set correctly
- [ ] Rate limiting works (test all endpoints)
- [ ] Database indexes working (check EXPLAIN queries)
- [ ] Email sending works (test verification, password reset)
- [ ] Public portfolios load fast (< 1s)
- [ ] Dashboard loads fast (< 2s)
- [ ] Mobile experience is smooth
- [ ] All forms validate properly
- [ ] Images upload successfully
- [ ] Contact form works
- [ ] Cleanup cron job scheduled
- [ ] Backups configured
- [ ] Monitoring set up
- [ ] Error logging works

---

## Maintenance Schedule

### Daily
- [ ] Check error logs
- [ ] Monitor uptime
- [ ] Review rate limit hits

### Weekly
- [ ] Check database size
- [ ] Review slow queries
- [ ] Check RateLimit table size
- [ ] Review user signups/activity

### Monthly
- [ ] Update dependencies
- [ ] Review security logs
- [ ] Optimize database if needed
- [ ] Backup verification
- [ ] Performance review

### Quarterly
- [ ] Security audit
- [ ] Dependency security scan
- [ ] Update Node.js/packages
- [ ] Review and rotate API keys
- [ ] Capacity planning

---

## Support & Resources

### Documentation
- Prisma Docs: https://www.prisma.io/docs
- Next.js Docs: https://nextjs.org/docs
- Vercel Docs: https://vercel.com/docs

### Security
- OWASP Top 10: https://owasp.org/www-project-top-ten/
- Node.js Security: https://nodejs.org/en/docs/guides/security/

### Community
- Next.js Discord: https://nextjs.org/discord
- Prisma Slack: https://slack.prisma.io

---

## Emergency Contacts

Create an emergency runbook:

```
Database Issues:
1. Check connection: [command]
2. Check logs: [location]
3. Restart: [command]
4. Contact: [DBA contact]

Security Incident:
1. Disable affected endpoints
2. Review logs: [location]
3. Contact: [security team]
4. Document incident

Performance Issues:
1. Check database: [query]
2. Check rate limits: [query]
3. Check Vercel metrics: [URL]
4. Scale if needed: [command]
```

---

**Last Updated**: 2026-08-21  
**Version**: 1.0  
**Next Review**: After production deployment
