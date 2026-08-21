# Ostendo — Student Portfolio Platform

A modern, production-ready web application that enables students to create professional portfolio websites with custom URLs, templates, and design customization.

**Production URL:** https://ostendo.vercel.app  
**Portfolio Format:** https://ostendo.vercel.app/[username]

## Features

- 🎨 **Multiple Templates** — Choose from Minimal, Developer, Creative, or Editorial layouts
- 🎯 **Visual Editor** — Drag-and-drop editor with live preview
- 🎨 **Design System** — Customize colors, fonts, spacing, and button styles
- 📱 **Responsive & PWA** — Works beautifully on all devices, installable as an app
- 🔐 **Authentication** — Secure email/password auth with email verification
- 📧 **Contact Forms** — Built-in contact form with spam protection
- ⚡ **Performance** — Built with Next.js 16 App Router for optimal speed
- ♿ **Accessible** — WCAG 2.2 AA compliant with keyboard navigation
- 🔍 **SEO Optimized** — Dynamic meta tags, OpenGraph, structured data, and sitemaps

## Tech Stack

- **Framework:** Next.js 16.3.0 with App Router
- **Frontend:** React 19, TypeScript, Tailwind CSS v4
- **Backend:** Next.js Server Actions
- **Database:** MySQL with Prisma ORM
- **Authentication:** Custom JWT with jose
- **Validation:** Zod
- **Icons:** Lucide React
- **Image Hosting:** ImgBB

## Getting Started

### Prerequisites

- Node.js 20+ and npm
- MySQL database
- ImgBB API key (for image uploads)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/ostendo.git
   cd ostendo
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and configure:
   - `DATABASE_URL` — Your MySQL connection string
   - `SESSION_SECRET` — Generate a random 32+ character string
   - `APP_URL` — Your application URL (e.g., `http://localhost:3000`)
   - `IMGBB_API_KEYS` — Your ImgBB API key(s)
   - `EMAIL_PROVIDER` — Use `"console"` for development

4. **Set up the database**
   ```bash
   npx prisma migrate deploy
   npx prisma generate
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open** [http://localhost:3000](http://localhost:3000)

## Available Scripts

- `npm run dev` — Start development server
- `npm run build` — Build for production
- `npm start` — Start production server
- `npm run lint` — Run ESLint
- `npm run typecheck` — Run TypeScript type checking

## Project Structure

```
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── migrations/            # Database migrations
├── public/
│   ├── icons/                 # PWA icons
│   └── sw.js                  # Service worker
├── src/
│   ├── actions/               # Server Actions (mutations)
│   ├── app/                   # Next.js App Router pages
│   │   ├── (auth)/           # Auth pages (login, signup, etc.)
│   │   ├── dashboard/        # Authenticated user dashboard
│   │   ├── [username]/       # Public portfolio pages
│   │   └── api/              # API routes
│   ├── components/
│   │   ├── auth/             # Auth forms
│   │   ├── dashboard/        # Dashboard components
│   │   ├── editor/           # Visual editor
│   │   ├── forms/            # Form components
│   │   ├── portfolio/        # Portfolio display components
│   │   └── ui/               # Reusable UI primitives
│   └── lib/
│       ├── auth.ts           # Authentication utilities
│       ├── db.ts             # Prisma client
│       ├── validation.ts     # Zod schemas
│       └── ...               # Other utilities
└── ...
```

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the project in Vercel
3. Add environment variables in the Vercel dashboard
4. Deploy

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- AWS (EC2, ECS, or Amplify)
- DigitalOcean App Platform

Make sure to:
1. Set all required environment variables
2. Configure MySQL database connection
3. Run `npx prisma migrate deploy` after deployment
4. Set `NODE_ENV=production`

## Security

- All user inputs are validated with Zod schemas
- Passwords are hashed with bcryptjs (10 rounds)
- Sessions use JWT with HttpOnly cookies
- Rate limiting on authentication and contact forms
- SQL injection prevented by Prisma's parameterized queries
- XSS protection through React's automatic escaping
- CSRF protection via SameSite cookie attribute

## License

This project is private and proprietary.

## Support

For questions or issues, please open an issue in the repository.
