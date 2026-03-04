# NoteStash 📚

> Study notes that actually make sense. Pay by EFT, get a code, start studying.

## Stack
- **Next.js 14** (App Router) — frontend + API routes
- **Supabase** — Postgres database, Auth, and file Storage
- **Tailwind CSS** — styling
- **PDF.js** — secure in-browser PDF viewer

## Quick start (local development)

```bash
# 1. Install dependencies
npm install

# 2. Copy env template
cp .env.local.example .env.local

# 3. Fill in your Supabase credentials in .env.local

# 4. Run the DB migration in Supabase SQL Editor (supabase/migrations/001_schema.sql)

# 5. Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Deployment

See **[DEPLOYMENT.md](./DEPLOYMENT.md)** for the full step-by-step guide.

## Project structure

```
app/
  page.tsx              # Landing page
  (auth)/
    login/              # Login page
    register/           # Register page
  dashboard/
    page.tsx            # Student portal
    view/[pdfId]/       # Secure PDF viewer
  admin/
    page.tsx            # Admin overview
    modules/            # Module management
    codes/              # Access code management
    payments/           # EFT payment logging
    activity/           # Session & event logs
  api/
    auth/callback/      # Supabase auth callback
    pdfs/[pdfId]/       # Secure PDF URL endpoint
    codes/redeem/       # Code redemption
    sessions/heartbeat/ # Session keepalive
    admin/              # Admin API routes

components/
  PdfViewerClient.tsx   # PDF.js viewer with watermark
  RedeemCode.tsx        # Code redemption form
  LogoutButton.tsx      # Auth logout

lib/
  supabase/
    client.ts           # Browser Supabase client
    server.ts           # Server Supabase client + admin client
  types.ts              # TypeScript types
  utils.ts              # Code generator, hashing, etc.

supabase/
  migrations/
    001_schema.sql      # Full DB schema + RLS policies + seed data
```

## Security model

- PDFs served via server-side signed URLs (60s expiry)
- Dynamic canvas watermark (user email + date)
- RLS policies on all database tables
- Single-session enforcement (new login revokes old session)
- No public bucket links

See DEPLOYMENT.md for full security documentation.
