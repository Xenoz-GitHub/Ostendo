# Production Quick Reference Card

## 🌐 URLs

| Type | URL |
|------|-----|
| **Main App** | https://ostendo.vercel.app |
| **User Portfolio** | https://ostendo.vercel.app/[username] |
| **Login** | https://ostendo.vercel.app/login |
| **Signup** | https://ostendo.vercel.app/signup |
| **Dashboard** | https://ostendo.vercel.app/dashboard |
| **Robots** | https://ostendo.vercel.app/robots.txt |
| **Sitemap** | https://ostendo.vercel.app/sitemap.xml |

---

## 🔑 Environment Variables (Vercel)

| Variable | Production Value | Notes |
|----------|------------------|-------|
| `DATABASE_URL` | `mysql://[prod-db]` | ⚠️ Use production MySQL, not localhost |
| `SESSION_SECRET` | `bvxah+n61T5/XfN...` | ⚠️ MUST match local .env |
| `APP_URL` | `https://ostendo.vercel.app` | Your production domain |
| `EMAIL_PROVIDER` | `console` or `resend` | console = logs, resend = real emails |
| `IMGBB_API_KEYS` | `[9 comma-separated keys]` | Copy from local .env |
| `NODE_ENV` | `production` | Auto-set by Vercel |

**Optional (if using Resend):**
- `RESEND_API_KEY`
- `EMAIL_FROM`

---

## 🚀 Deploy Commands

```bash
# Via Git (Automatic)
git push origin main

# Via Vercel CLI (Manual)
vercel --prod

# Check deployment status
vercel ls
```

---

## 🗄️ Database Migration

```bash
# Run migrations on production database
DATABASE_URL="[prod-url]" npx prisma migrate deploy

# Generate Prisma client
npx prisma generate
```

---

## 🧪 Quick Test Checklist

After deployment, verify:
- [ ] https://ostendo.vercel.app loads (redirects to login)
- [ ] Signup works
- [ ] Can create and publish portfolio
- [ ] Public portfolio accessible: https://ostendo.vercel.app/[username]
- [ ] `/robots.txt` and `/sitemap.xml` load
- [ ] Contact form works

---

## 📊 Monitoring

**Vercel Dashboard:**
- Deployments: https://vercel.com/xenoz-githubs-projects/ostendo/deployments
- Logs: Functions tab
- Analytics: Analytics tab

**What to Watch:**
- Function execution errors
- Database connection issues
- Image upload failures
- Unusual rate limiting activity

---

## 🐛 Emergency Rollback

1. Go to Vercel Dashboard → Deployments
2. Find previous working deployment
3. Click "⋯" → "Promote to Production"

---

## 📞 Support

**Documentation:**
- Full setup: `README.md`
- Deployment: `DEPLOYMENT-NOTES.md`
- Testing: `PRODUCTION-CHECKLIST.md`
- Improvements: `POLISH-PASS-SUMMARY.md`

**Vercel Support:** https://vercel.com/support

---

**Last Updated:** 2026-08-22
