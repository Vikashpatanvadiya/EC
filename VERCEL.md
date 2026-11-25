# Vercel setup — step by step

Database (Neon) is already live and seeded. This is what's left.

---

## 1. Import the repo

1. [vercel.com/new](https://vercel.com/new) → **Import Git Repository**
2. Pick `Vikashpatanvadiya/EC`
3. Framework preset: **Next.js** (detected automatically)
4. **Root Directory:** leave as `./`

## 2. Override the build command

This is the one setting that is not the default, and the deploy fails
without it.

**Settings → General → Build & Development Settings → Build Command →
Override:**

```
prisma generate && next build
```

Prisma Client is generated from the schema at install time. Vercel caches
`node_modules`, so without this the deploy can ship a client that doesn't
match the schema.

## 3. Environment variables

**Settings → Environment Variables.** Add each for
**Production, Preview and Development**.

| Variable | Where to get it |
| --- | --- |
| `DATABASE_URL` | Neon → Connect → **pooled** string (host has `-pooler`) |
| `DIRECT_URL` | Same string with `-pooler` removed from the host |
| `AUTH_SECRET` | Generate: `openssl rand -base64 32` — a **new** one for production |
| `AUTH_URL` | `https://<your-app>.vercel.app` (after first deploy) |
| `NEXT_PUBLIC_APP_URL` | `https://<your-app>.vercel.app` (after first deploy) |
| `SUPABASE_URL` | Supabase → Project Settings → API → Project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API Keys → **secret** key |
| `SUPABASE_STORAGE_BUCKET` | `designs` |

Leave the Stripe variables out for now — checkout places orders as
"Awaiting payment" for you to confirm in admin, which is what you asked
for. Add them when you want card payment.

> Do **not** add `SEED_ADMIN_PASSWORD` to Vercel. Seeding already ran
> against Neon from your machine; the admin account exists.

### The chicken-and-egg bit

`AUTH_URL` and `NEXT_PUBLIC_APP_URL` need the deployed URL, which does
not exist until you deploy. So:

1. Deploy once with the other variables set
2. Copy the URL Vercel gives you
3. Add those two variables
4. **Redeploy** (Deployments → ⋯ → Redeploy)

Sign-in will not work correctly until `AUTH_URL` matches the real
domain — that is expected on the first deploy, not a bug.

## 4. Region

**Settings → Functions → Region.** Your Neon database is in
**US East (Ohio)**, so pick **Washington D.C. (`iad1`)** — the closest
Vercel region to it.

Put the function next to the *database*, not next to your customers. Each
page render makes several database round trips but only one trip to the
browser, so distance to the database costs far more.

> If most of your customers are in India, the better fix later is to move
> the Neon project to Singapore or Mumbai **and** set Vercel to that
> region. Moving only one of them makes things worse.

## 5. Deploy

Push to `main` and Vercel builds automatically. Every push to `main` is a
production deploy; branches get preview URLs.

---

## After the first successful deploy

1. Visit `https://<your-app>.vercel.app` — the shop should load with all
   nine designs (they come from Neon).
2. Sign in at `/login` with the admin account seeded earlier.
3. Go to `/admin` and confirm the orders screen loads.
4. Place a test order with an **image upload** — this is the one path
   that proves Supabase Storage is wired correctly. If the upload fails,
   `SUPABASE_SERVICE_ROLE_KEY` is wrong or the `designs` bucket is
   missing.

## If a deploy fails

| Symptom | Cause |
| --- | --- |
| `@prisma/client did not initialize` | Build command override missing (§2) |
| `Can't reach database server` | `DATABASE_URL` not the pooled string, or `?sslmode=require` was dropped |
| `prepared statement already exists` | Using the direct string as `DATABASE_URL` — it must be the pooled one |
| Sign-in loops back to `/login` | `AUTH_URL` doesn't match the deployed domain |
| Upload fails, rest works | `designs` bucket missing or not private, or the key is the publishable one instead of the secret |
