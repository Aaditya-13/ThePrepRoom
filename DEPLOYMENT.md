# ThePrepRoom - Production Deployment Guide (Vercel & PostgreSQL)

This guide walks you through deploying **ThePrepRoom** to **Vercel** with a managed **PostgreSQL** database (e.g., Neon or Supabase).

---

## 1. Create a Free PostgreSQL Database

We recommend **Neon** (serverless Postgres) or **Supabase**:

### Option A: Neon (Recommended for Vercel)
1. Go to [neon.tech](https://neon.tech) and create a free account.
2. Create a new project called `thepreproom`.
3. Copy your connection string from the dashboard:
   - **Pooled connection string** (for `DATABASE_URL`):
     ```
     postgresql://neondb_owner:password@ep-xyz-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require
     ```
   - **Direct connection string** (for `DIRECT_URL`):
     ```
     postgresql://neondb_owner:password@ep-xyz.us-east-2.aws.neon.tech/neondb?sslmode=require
     ```

### Option B: Supabase
1. Go to [supabase.com](https://supabase.com) and create a free project.
2. Go to **Project Settings** > **Database** > **Connection string**:
   - Set `DATABASE_URL` to the **Transaction pooler** (port 6543)
   - Set `DIRECT_URL` to the **Session pooler / Direct connection** (port 5432)

---

## 2. Switch Project to PostgreSQL & Push Schema

Run the following commands locally:

```bash
# 1. Switch prisma schema to PostgreSQL
npm run db:postgres

# 2. Push schema to your remote PostgreSQL database
npx prisma db push

# 3. Seed initial colleges, topics, companies, and roles
npm run seed
```

*(To switch back to SQLite for local development anytime, simply run `npm run db:sqlite`)*

---

## 3. Deploy to Vercel

1. Push your code to your GitHub repository:
   ```bash
   git push origin main
   ```
2. Go to [vercel.com](https://vercel.com) and click **Add New Project**.
3. Import your `thepreproom` repository.
4. In the **Environment Variables** section, add the following:

| Variable | Value / Description |
|---|---|
| `DATABASE_URL` | Your pooled PostgreSQL connection string |
| `DIRECT_URL` | Your direct PostgreSQL connection string |
| `AUTH_SECRET` | A secure random string (e.g. run `openssl rand -base64 32`) |
| `NEXT_PUBLIC_APP_URL` | Your Vercel production domain (e.g. `https://thepreproom.vercel.app`) |
| `ADMIN_SECRET_KEY` | Your admin portal key (e.g., `preproom-admin-secret-2025`) |
| `ADMIN_EMAIL` | Admin email (e.g., `vedkalantri7@gmail.com`) |
| `GOOGLE_CLIENT_ID` | (Optional) Google OAuth Client ID |
| `GOOGLE_CLIENT_SECRET` | (Optional) Google OAuth Client Secret |
| `LINKEDIN_CLIENT_ID` | (Optional) LinkedIn OAuth Client ID |
| `LINKEDIN_CLIENT_SECRET` | (Optional) LinkedIn OAuth Client Secret |

5. Click **Deploy**. Vercel will automatically run `prisma generate && next build` and deploy your production app!
