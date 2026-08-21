# Production Deployment Notes

**Date:** 2026-08-22  
**Production URL:** https://ostendo-ashen.vercel.app  
**Environment:** Vercel (Hobby Plan)

---

## 🎯 Your Current Setup

### URLs
- **Main App:** https://ostendo-ashen.vercel.app
- **User Portfolios:** https://ostendo-ashen.vercel.app/[username]
- **Example:** If user chooses username "john-doe", their portfolio will be at `https://ostendo-ashen.vercel.app/john-doe`

### Environment Variables (from your .env)
Your local `.env` shows:
```env
DATABASE_URL="mysql://ostendo_dev:LYj1rzC03sTaJgk4ndvtODRb@localhost:3306/ostendo"
SESSION_SECRET="bvxah+n61T5/XfNG1n5RHH3Fhm0netLMCo7H7tyZ67nlhnAs2oruE8oHPlHWwCxX"
APP_URL="http://localhost:3000"
EMAIL_PROVIDER="console"
IMGBB_API_KEYS="[9 keys]"
```

---

## ⚠️ Critical: Production Environment Variables

You MUST set these in your **Vercel Project Dashboard → Settings → Environment Variables**:

### 1. DATABASE_URL
**⚠️ DO NOT use localhost in production!**

You need a **production MySQL database**. Options:
- **PlanetScale** (recommended, free tier available): https://planetscale.com
- **Railway**: https://railway.app
- **AWS RDS**
- **DigitalOcean Managed Database**
- **Supabase** (PostgreSQL, would require schema changes)

**Production value:**
```
mysql://[prod_user]:[prod_password]@[prod_host]:3306/ostendo
```

### 2. SESSION_SECRET
**⚠️ CRITICAL:** Use the SAME value as your local environment:
```
bvxah+n61T5/XfNG1n5RHH3Fhm0netLMCo7H7tyZ67nlhnAs2oruE8oHPlHWwCxX
```

If you change this in production, all existing sessions will be invalidated and users will be logged out.

### 3. APP_URL
```
https://ostendo-ashen.vercel.app
```

**Note:** The app auto-detects the URL from Vercel headers, so this is mainly a fallback. But set it anyway for consistency.

### 4. EMAIL_PROVIDER
For production, you have two options:

**Option A: Console (Testing)**
```
console
```
Emails will be logged to Vercel function logs. Good for initial testing, but users won't receive actual emails.

**Option B: Resend (Production)**
```
resend
```
Requires additional setup:
1. Sign up at https://resend.com (free tier: 3,000 emails/month)
2. Add and verify your domain
3. Get API key
4. Add these environment variables:
   - `RESEND_API_KEY`: Your API key
   - `EMAIL_FROM`: `Ostendo <noreply@ostendo-ashen.vercel.app>`

### 5. IMGBB_API_KEYS
Copy all 9 keys from your local .env:
```
5011fa0fde810ab36f80c3ff05810af3,6ff3287021b2f6afae13340257d7a0ef,9ec35326a11371331760c114a62fd2d9,aa875468fbc966462fdeb54ae7e5949f,7441d2f5495f3c0cb8e743fa04801c58,c1a8e1cfbcdc624d1a5b072eff4250ac,6abb2b0f011fe0ebb14a7e9fc955af5d,de7d02a80c44dec3f754783e4899462c,9eef4fe44378b4405afb1dd32389cf95
```

---

## 🗄️ Database Setup (CRITICAL)

### Step 1: Create Production Database

**Recommended: PlanetScale (MySQL-compatible, free tier)**

1. Go to https://planetscale.com
2. Create account
3. Create new database: "ostendo"
4. Get connection string (will look like):
   ```
   mysql://[user]:[password]@[host].aws.psdb.cloud/ostendo?sslaccept=strict
   ```

### Step 2: Run Migrations

**⚠️ IMPORTANT:** Your production database needs all tables created.

From your local machine:
```bash
# Set production database URL temporarily
DATABASE_URL="mysql://[your-prod-connection-string]" npx prisma migrate deploy

# Generate Prisma Client
DATABASE_URL="mysql://[your-prod-connection-string]" npx prisma generate
```

### Step 3: Verify Tables

Connect to your production database and verify these tables exist:
- User
- Profile
- Portfolio
- Project
- Education
- Experience
- Skill
- SocialLink
- EmailVerification
- PasswordReset
- EmailMessage
- ContactMessage
- RateLimit

---

## 🚀 Deployment Process

### Option 1: Automatic Deployment (Recommended)

1. **Connect GitHub to Vercel** (if not already connected)
   - Go to Vercel Dashboard
   - Import Git Repository
   - Select your ostendo repository
   - Choose branch: `main` or `master`

2. **Configure Environment Variables**
   - In Vercel Dashboard → Project Settings → Environment Variables
   - Add all variables listed above
   - **Important:** Check "Production" environment

3. **Deploy**
   - Push to your connected branch:
     ```bash
     git add .
     git commit -m "Production ready with polish pass"
     git push origin main
     ```
   - Vercel will automatically build and deploy

4. **Monitor Build**
   - Watch build logs in Vercel Dashboard
   - Should complete in 2-3 minutes

### Option 2: Manual Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy to production
vercel --prod
```

---

## ✅ Post-Deployment Verification

### Immediate Checks (first 5 minutes)

1. **Basic Load**
   - Visit https://ostendo-ashen.vercel.app
   - Should redirect to login
   - No visible errors

2. **Signup Flow**
   - Go to https://ostendo-ashen.vercel.app/signup
   - Create a test account
   - Should redirect to onboarding

3. **Dashboard Access**
   - Complete onboarding (choose username)
   - Should see dashboard

4. **Public Portfolio**
   - Add some content (project, bio)
   - Choose template
   - Publish portfolio
   - Visit https://ostendo-ashen.vercel.app/[your-username]
   - Should be publicly accessible (test in incognito)

5. **SEO Files**
   - Visit https://ostendo-ashen.vercel.app/robots.txt
   - Visit https://ostendo-ashen.vercel.app/sitemap.xml
   - Both should load without errors

### Detailed Testing (next 30 minutes)

Follow the complete checklist in `PRODUCTION-CHECKLIST.md`

---

## 🐛 Common Issues & Solutions

### Issue: "DATABASE_URL not found"
**Cause:** Environment variable not set in Vercel  
**Fix:** Add DATABASE_URL in Vercel Dashboard → Environment Variables → Redeploy

### Issue: "Session expired" immediately after login
**Cause:** SESSION_SECRET mismatch or not set  
**Fix:** 
1. Verify SESSION_SECRET in Vercel matches your local .env
2. Redeploy
3. Clear browser cookies

### Issue: Images fail to upload
**Cause:** IMGBB_API_KEYS not set or invalid  
**Fix:** 
1. Verify all 9 keys are in Vercel environment variables
2. Test keys at https://api.imgbb.com

### Issue: Build fails with TypeScript errors
**Expected:** Some pre-existing type errors are non-blocking  
**Action:** Build should still succeed despite type warnings

### Issue: Email verification emails not received
**If using `console` provider:**
- Check Vercel Function Logs → Should see email content logged
- This is expected behavior for `console` provider

**If using `resend` provider:**
- Verify RESEND_API_KEY is set
- Check Resend dashboard for delivery status
- Ensure EMAIL_FROM domain is verified

---

## 📊 Monitoring Production

### Vercel Dashboard
- **Deployments:** See all deployments and their status
- **Functions:** Monitor function execution times
- **Logs:** Real-time logs from your app
- **Analytics:** Traffic and performance (basic metrics included)

### What to Monitor
- Error rate in function logs
- Database connection issues
- Image upload failures
- Rate limiting triggers (indicates potential abuse)

---

## 🔐 Security Notes

### What's Already Secure ✅
- HTTPS enforced (automatic on Vercel)
- Security headers configured
- SQL injection protection (Prisma)
- XSS protection (React + sanitization utilities)
- CSRF protection (SameSite cookies)
- Rate limiting on auth endpoints
- Password hashing (bcrypt, 10 rounds)

### Recommended Next Steps 🔜
1. **Set up Sentry** for error tracking
2. **Enable 2FA** for critical accounts
3. **Set up database backups** (automated on most platforms)
4. **Monitor rate limit logs** for abuse patterns

---

## 📈 Performance Expectations

### First Load (Cold Start)
- **Homepage:** 1-2 seconds
- **Dashboard:** 2-3 seconds
- **Public Portfolio:** 1-2 seconds

### Subsequent Loads
- **Homepage:** < 500ms
- **Dashboard:** < 1 second
- **Public Portfolio:** < 500ms

### Database Queries
- Most queries: < 100ms
- Complex dashboard queries: < 200ms

If you see slower performance:
1. Check database connection latency
2. Enable Vercel Analytics for detailed metrics
3. Consider database query optimization

---

## 🎨 Your Portfolio Examples

Once deployed, your users will have portfolios like:

- **Minimal Template:** https://ostendo-ashen.vercel.app/john-smith
- **Developer Template:** https://ostendo-ashen.vercel.app/jane-developer
- **Creative Template:** https://ostendo-ashen.vercel.app/alex-creative
- **Editorial Template:** https://ostendo-ashen.vercel.app/sam-writer

Each with their own:
- Custom URL
- Template choice
- Color scheme
- Content (projects, education, experience)
- Contact form

---

## 🆘 Need Help?

**Check Vercel Logs First:**
1. Go to Vercel Dashboard
2. Select your project
3. Click "Functions" tab
4. Check recent function executions for errors

**Common Log Locations:**
- Auth errors: Check login/signup function logs
- Database errors: Look for "Prisma" in logs
- Image upload errors: Check /api/upload function logs

**Documentation:**
- See `PRODUCTION-CHECKLIST.md` for complete testing checklist
- See `README.md` for development setup
- See `POLISH-PASS-SUMMARY.md` for recent improvements

---

## ✅ Ready to Deploy?

**Pre-flight Checklist:**
- [ ] Production MySQL database created and accessible
- [ ] All migrations run on production database (`prisma migrate deploy`)
- [ ] All environment variables set in Vercel Dashboard
- [ ] SESSION_SECRET matches local environment
- [ ] Git repository connected to Vercel (or Vercel CLI installed)
- [ ] Latest code committed and pushed

**If all checked:** You're ready to deploy! 🚀

**Next step:** Push to your connected branch or run `vercel --prod`

---

**Last Updated:** 2026-08-22
