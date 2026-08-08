# Deployment runbook — Phase 1 completion

Goal: a working app at `https://ostendo.vercel.app/` with a hosted MySQL database.

**Status check before starting:** the repo only contains the original scaffold commit —
nothing from development is committed yet, and no remote is connected. Complete
step 1 first.

---

## 1. Commit and push to GitHub

```bash
git add -A
git commit -m "Ostendo MVP: auth, onboarding, portfolio builder, templates, publishing"
```

- Create an empty repo on GitHub (no README, no .gitignore — we have one).
  Name it `ostendo` or `ostendo-app`.
- Connect it:

```bash
git remote add origin https://github.com/<you>/<repo>.git
git branch -M main
git push -u origin main
```

Sensitive files are already ignored (`.env*`, `credentials*.txt`). Verify with
`git status` — nothing secret should be listed. If you ever see
`credentials(grab-it).txt` in `git status`, stop and fix .gitignore first.

## 2. Hosted MySQL (free tier)

Local MySQL cannot be reached from Vercel. Use one of these (free tier):

| Provider | Type | Notes |
|---|---|---|
| TiDB Cloud Serverless | MySQL-compatible | True MySQL wire protocol, generous free tier, good for Prisma. Recommended. |
| Aiven for MySQL | MySQL | Free tier is small; good backup option. |
| Railway | MySQL | Free trial; expires. Fine for testing. |

Steps (TiDB Cloud example):
1. Create account → Create Serverless Cluster.
2. Region: Singapore or closest. Let it start.
3. Get the connection string, e.g.
   `mysql://<user>:<password>@<host>:4000/<db>?sslaccept=strict`.
4. Create a database: `CREATE DATABASE ostendo;`

## 3. Migrate the schema (and optionally your local data)

Run migrations against the production database from your machine:

```bash
set DATABASE_URL=mysql://<user>:<password>@<host>:<port>/ostendo
npx prisma migrate deploy
```

`migrate deploy` applies all committed migrations — same table state as local.

Optional — copy your local development accounts to production:

```bash
mysqldump --host=localhost --port=3306 -u ostendo_dev -p --no-create-info ostendo user Profile Project Education Experience Skill SocialLink Portfolio EmailMessage ContactMessage > data.sql
mysql --host=<host> --port=<port> -u <user> -p ostendo < data.sql
```

(Passwords are bcrypt hashes — they migrate as-is.)

## 4. Vercel

1. Go to https://vercel.com → New Project → Import the GitHub repo.
2. Framework preset: Next.js (auto-detected).
3. Environment variables (Vercel project → Settings → Environment Variables,
   add for Production):

| Variable | Value |
|---|---|
| `DATABASE_URL` | Your hosted MySQL connection string (from step 2) |
| `SESSION_SECRET` | Same long random string as your local `.env` (reuse it — sessions must survive redeploys) |
| `IMGBB_API_KEYS` | Comma-separated list of all your ImgBB keys (same as local `.env`) |
| `APP_URL` | `https://ostendo.vercel.app` |
| `EMAIL_PROVIDER` | Optional. `console` (default) logs emails to the server log. Set a real provider later. |

4. Build command: `prisma migrate deploy && next build` (runs migrations on every
   deploy; fine while you're the only deployer).
5. Deploy.

## 5. Verification checklist

- [ ] `https://ostendo.vercel.app/` loads (redirects to login/signup)
- [ ] Sign up with a test account → verify email flow
- [ ] Onboarding → username → profile → add a project → template → publish
- [ ] `https://ostendo.vercel.app/<username>` renders publicly, no login
- [ ] Share the URL in a chat — preview card (name, photo, headline) appears
- [ ] Contact form on the public page stores a message → shows under Dashboard → Messages
- [ ] Image upload works (ImgBB keys)

## 6. Notes

- The app derives its public URL from the request host, so if you later add a
  custom domain, nothing needs to change.
- `EMAIL_PROVIDER=console` means verification/password emails are only visible
  in Vercel's function logs. Before asking real users to sign up, wire up a real
  transactional email provider (free tiers exist) in `src/lib/email.ts`.
- PWA: the dashboard already has a manifest + service worker (`public/sw.js`),
  so it's installable once deployed over HTTPS.
