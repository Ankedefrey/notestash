# NoteStash — Complete Deployment Guide
## From zero to live in under 2 hours

---

## What you're deploying

- **Frontend + Backend**: Next.js app on Vercel (free)
- **Database**: Supabase Postgres (free tier)
- **Auth**: Supabase Auth (free tier)
- **File storage**: Supabase Storage (1GB free)
- **Total monthly cost**: R0 until ~50,000 monthly active users

---

## STEP 1 — Set up Supabase (15 min)

### 1.1 Create your project

1. Go to [supabase.com](https://supabase.com) → **Start your project**
2. Sign up with GitHub (easiest)
3. Click **New Project**
4. Fill in:
   - **Name**: `notestash`
   - **Database password**: Create a strong one and save it somewhere safe
   - **Region**: `South Africa (Cape Town)` — keeps it fast for ZA students
5. Wait ~2 minutes for it to spin up

### 1.2 Run the database schema

1. In your Supabase project, click **SQL Editor** in the left sidebar
2. Click **New Query**
3. Copy the entire contents of `supabase/migrations/001_schema.sql`
4. Paste it into the editor
5. Click **Run** (green button)
6. You should see "Success. No rows returned" — that's correct ✅

### 1.3 Set up admin email detection

Still in SQL Editor, run this (replace with YOUR email):

```sql
ALTER DATABASE postgres SET "app.admin_emails" TO 'your@email.com';
```

If you want multiple admins:
```sql
ALTER DATABASE postgres SET "app.admin_emails" TO 'you@email.com,partner@email.com';
```

### 1.4 Create the PDF storage bucket

1. Click **Storage** in left sidebar
2. Click **New bucket**
3. Name: `pdfs`
4. Toggle **Public bucket** to OFF (keep it private!)
5. Click **Create bucket**

### 1.5 Set storage access policy

In Storage → pdfs bucket → **Policies** → **New policy** → **Custom**:

```sql
-- Allow admins to upload
CREATE POLICY "Admins can upload PDFs"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'pdfs' AND
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Allow entitled users to read (via signed URL from API)
-- Note: Direct storage access is blocked; PDFs only served via /api/pdfs/[id]
```

### 1.6 Get your API keys

1. Click **Settings** (gear icon) → **API**
2. Save these three values — you'll need them in Step 3:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJh...` (long string)
   - **service_role key**: `eyJh...` (KEEP THIS SECRET — never share it)

---

## STEP 2 — Deploy to Vercel (10 min)

### 2.1 Put your code on GitHub

1. Install [GitHub Desktop](https://desktop.github.com) if you don't have it
2. Create a new repository called `notestash` (make it **private**)
3. Copy all the project files into the repo folder
4. Commit and push

### 2.2 Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) → sign up with GitHub
2. Click **Add New → Project**
3. Find your `notestash` repo and click **Import**
4. Vercel will auto-detect it as a Next.js project
5. **Don't click Deploy yet** — you need to add environment variables first

### 2.3 Add environment variables

In the Vercel deployment screen, expand **Environment Variables** and add:

| Name | Value |
|------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your anon public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Your service role key |
| `NEXT_PUBLIC_APP_URL` | `https://your-project.vercel.app` (set after first deploy) |
| `ADMIN_EMAILS` | `your@email.com` |
| `SESSION_SECRET` | Go to [generate-secret.vercel.app/32](https://generate-secret.vercel.app/32) and paste the result |

6. Click **Deploy** 🚀
7. Wait ~2 minutes
8. Your site is live at `https://notestash-xxxx.vercel.app`!

### 2.4 Set the app URL

1. Copy your Vercel URL (e.g. `https://notestash-xxxx.vercel.app`)
2. Go to Vercel → Settings → Environment Variables
3. Update `NEXT_PUBLIC_APP_URL` to your real URL
4. Re-deploy (it'll deploy automatically on next push)

### 2.5 Configure Supabase Auth redirect

1. In Supabase → **Authentication** → **URL Configuration**
2. Set **Site URL** to: `https://your-site.vercel.app`
3. Add to **Redirect URLs**: `https://your-site.vercel.app/api/auth/callback`
4. Save

---

## STEP 3 — Create your admin account (5 min)

1. Go to your live site
2. Click **Get notes** → **Create account**
3. Use the email you added as `ADMIN_EMAILS`
4. Check your email and click the confirmation link
5. Log in — you'll automatically be redirected to `/admin` ✅

---

## STEP 4 — Add your first module and PDF (10 min)

### Add STK110 (already in seed data)
The database seed already added STK110, STK120, and WST212 modules.

### Upload a PDF

1. Go to Supabase → **Storage** → **pdfs** bucket
2. Click **Upload file**
3. Upload your PDF file
4. Copy the file path (e.g. `stk110/chapter-1.pdf`)

Then in your admin dashboard:
- Go to **Modules** → STK110 → **+ Upload PDF**
- Fill in the title and paste the storage path
- Done!

> **Tip**: Create folders per module in Storage (e.g. `stk110/`, `stk120/`) to stay organised.

---

## STEP 5 — Add a custom domain (optional, R50–R150/year)

### Get a .co.za domain cheaply
- [afrihost.com](https://afrihost.com) — R79/year for .co.za
- [domains.co.za](https://domains.co.za) — R89/year
- [namecheap.com](https://namecheap.com) — ~R120/year for .com

### Connect to Vercel
1. Vercel → your project → **Settings** → **Domains**
2. Add your domain (e.g. `notestash.co.za`)
3. Follow Vercel's DNS instructions (add a CNAME or A record at your registrar)
4. SSL is automatic — Vercel handles it for free ✅

---

## Day-to-day Admin Operations

### How to add a new module
1. Go to `/admin/modules`
2. Click **+ Add module**
3. Fill in the module code (e.g. `MAT111`), name, description, price
4. Click **Add module**

### How to upload PDFs to a module
1. First upload the file in Supabase → Storage → pdfs
2. Note the file path
3. Go to `/admin/modules` → find the module → **+ Upload PDF**
4. Fill in the title and the storage path

### How to process an EFT payment
1. When you see an EFT arrive in your bank app:
2. Go to `/admin/payments` → **+ Log payment**
3. Fill in: payer name, reference, module, amount, date
4. Click **✅ Log & generate access code**
5. Copy the generated code from the green banner
6. WhatsApp or email it to the student

### How to generate an access code manually
1. Go to `/admin/codes`
2. Select the module from the dropdown
3. Click **+ Generate code**
4. Copy it and send to the student

### How to check revenue
- Go to `/admin` — revenue stats are on the overview page
- For CSV export: go to `/admin/payments` → **⬇ Export CSV**

---

## Security Checklist

- [x] PDFs only served via server-side API route with auth check
- [x] No public storage bucket links
- [x] Service role key is only used server-side (never in client code)
- [x] Row Level Security enabled on all tables
- [x] Single-session enforcement (new login kicks old session)
- [x] Dynamic watermark on every PDF page
- [x] Right-click disabled on PDF canvas
- [x] Print blocked via CSS
- [x] Signed URLs expire in 60 seconds

### What is and is NOT possible (honest section)

**✅ What we do:**
- Watermark PDFs with user email + date (screenshots are traceable)
- Prevent direct download links (no public URLs)
- Block right-click on viewer
- Block browser print (CSS @media print)
- Single-session enforcement

**❌ What's NOT possible on the web:**
- Netflix-style "screenshot = black screen" — this requires DRM (Widevine/FairPlay), which only works for video inside browser/OS pipelines. PDFs rendered on HTML canvas cannot get this protection.
- Preventing screenshots with phone cameras
- Preventing screen recording software
- DRM-protecting PDFs in a browser (it doesn't exist for PDFs)

**The realistic protection model:**
The watermark is your strongest tool. If a student shares a screenshot, their email is embedded in it — you can identify them and revoke access. This is the same model used by major textbook publishers like Pearson for their digital content.

---

## Backup Strategy

Supabase free tier includes **daily backups** for the last 7 days. For extra safety:

1. Supabase → **Settings** → **Database** → **Backups**
2. Download a manual backup before any major changes

For PDFs: keep the originals on your computer. Supabase Storage is reliable but you should always have the source files.

---

## Troubleshooting

**"PDF not loading"** — Check that the storage path in the `pdfs` table matches exactly what's in Supabase Storage. Paths are case-sensitive.

**"Admin page not loading"** — Make sure your email exactly matches `ADMIN_EMAILS` in Vercel env vars (no spaces). Re-deploy after changing env vars.

**"Email confirmation not arriving"** — Check spam. Supabase free tier uses their shared email sender. For production, connect a custom SMTP (Settings → Auth → SMTP).

**"Build failed on Vercel"** — Check the build logs. Usually a TypeScript error. You can also disable TypeScript strict mode in `tsconfig.json` temporarily.

---

## Estimated Costs (first 12 months)

| Item | Cost |
|------|------|
| Vercel (frontend + API) | Free |
| Supabase (DB + Auth + Storage 1GB) | Free |
| Domain (.co.za) | ~R80/year |
| **Total** | **~R80/year** |

When you outgrow free tiers (~50k MAU):
- Supabase Pro: $25/month (~R460)
- Vercel Pro: $20/month (~R370)
- Still very cheap for a profitable notes business!
