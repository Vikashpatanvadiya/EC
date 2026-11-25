# Hosting — free tier

**You don't need Render.** This is one Next.js app: the "backend" is
already inside it (server actions and API routes), and Vercel runs that.
Render would only earn its place later for work that must outlive a
request — background image processing, scheduled jobs. Skip it for now.

| Piece                    | Where            | Free tier                    |
| ------------------------ | ---------------- | ---------------------------- |
| Website + API            | Vercel           | Hobby — free                 |
| Postgres database        | Neon             | Free (0.5GB, scales to zero) |
| Customer artwork storage | Supabase Storage | Free (1GB) — see §3          |

Supabase is used **only** as a private file store here. The database is
Neon; no Supabase database is created or used.

---

## 1. Neon — the database

Create a project at neon.tech (pick a region near your customers —
Singapore or Mumbai for India).

From **Dashboard → Connect**, you need **two** connection strings. Neon
shows a toggle for this:

| What to copy                           | Goes in        | Used for                |
| -------------------------------------- | -------------- | ----------------------- |
| **Pooled** connection string (default) | `DATABASE_URL` | The running app         |
| **Direct** connection string (unpooled)| `DIRECT_URL`   | Running migrations only |

The pooled one has `-pooler` in the host. Both end with
`?sslmode=require` — keep that.

Why two: Vercel runs serverless functions that each open their own
connection, which exhausts a Postgres instance quickly. The pooler
absorbs that. Migrations can't run through a pooler, so they use the
direct one. `prisma/schema.prisma` is already wired for both.

Then point your local `.env` at Neon and push the schema up:

```bash
npx prisma migrate deploy && npm run db:seed
```

---

## 2. Vercel — the website

1. vercel.com → **Add New → Project** → import `Vikashpatanvadiya/EC`.
2. Set the **Build Command** to:

   ```
   prisma generate && next build
   ```

   Prisma Client has to be regenerated during each build or the deploy
   ships a stale client.

3. Add the environment variables below, then deploy.
4. Set the function region to Mumbai (`bom1`) so it sits near Neon.
   Cross-continent database round trips are the most common reason a
   Vercel app feels slow.

### Environment variables

| Variable                    | Value                                     |
| --------------------------- | ----------------------------------------- |
| `DATABASE_URL`              | Neon **pooled** string                    |
| `DIRECT_URL`                | Neon **direct** string                    |
| `AUTH_SECRET`               | `openssl rand -base64 32`                 |
| `AUTH_URL`                  | `https://your-app.vercel.app`             |
| `NEXT_PUBLIC_APP_URL`       | `https://your-app.vercel.app`             |
| `SUPABASE_URL`              | Supabase Project URL (§3)                 |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase `service_role` key — secret (§3) |
| `SUPABASE_STORAGE_BUCKET`   | `designs`                                 |
| `SEED_ADMIN_EMAIL`          | Your real admin email                     |
| `SEED_ADMIN_PASSWORD`       | A strong password you choose              |

`AUTH_URL` and `NEXT_PUBLIC_APP_URL` only exist after the first deploy
gives you a URL — deploy once, set them, redeploy.

Payment is off for now. Add `STRIPE_SECRET_KEY`,
`NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` and `STRIPE_WEBHOOK_SECRET` when you
want it; until then checkout places orders as "Awaiting payment" for you
to confirm in admin.

---

## 3. Customer artwork storage — the one thing Neon can't do

Neon is Postgres only. It has no object storage, and uploaded photographs
must not go in the database or on disk:

- **Vercel's filesystem is read-only and wiped between requests.** An
  upload written to disk in production fails, and anything that did get
  written would vanish on the next deploy.

So artwork goes to **Supabase Storage**, which supports genuinely
private buckets — the right call when the files are customers' personal
photographs. This is already implemented; it needs only keys.

Set it up:

1. supabase.com → **New project** (any region; this one stores files
   only, so it is not latency-critical). You can ignore the database it
   creates — the app never touches it.
2. **Storage → New bucket → `designs`**, and leave **Public switched
   off**.
3. **Project Settings → API** → copy the **Project URL** and the
   **`service_role`** key.

> The `service_role` key bypasses all row-level security. It is a
> server-only secret — never put it in a `NEXT_PUBLIC_*` variable.

The app picks Supabase automatically whenever `SUPABASE_URL` and
`SUPABASE_SERVICE_ROLE_KEY` are set, and falls back to local disk for
development when they are not.

`src/lib/storage.ts` is the only file that touches storage — it exposes
`saveUpload` / `readUpload` / `deleteUpload`, so changing provider later
means reimplementing those three and nothing else.

Files stay private in transit too: artwork is served only through
`/api/uploads/[key]`, which checks the caller owns the order, holds the
cart, or is an admin.

---

## 4. Things that will bite you

- **Change the admin password.** The seeded default (`changeme123`) is in
  this repository. Set `SEED_ADMIN_PASSWORD` before seeding production.
- **Neon free tier scales to zero** after inactivity. The first request
  after idle takes a second or two to wake. Fine for now.
- **Vercel Hobby is non-commercial.** Once you are genuinely taking
  money, their terms want you on Pro.
- **`.env` is gitignored** and must stay that way — it holds your Stripe
  secret and auth secret. Set real values in the Vercel dashboard, never
  in the repo.

---

## Order of operations

1. Neon project → copy pooled + direct connection strings
2. Put them in local `.env` → `npx prisma migrate deploy && npm run db:seed`
3. Supabase project → private `designs` bucket → copy URL + service_role key
4. Import the repo on Vercel → set build command → add env vars → deploy
5. Set `AUTH_URL` / `NEXT_PUBLIC_APP_URL` to the deployed URL → redeploy
6. Sign in as admin and change the password
