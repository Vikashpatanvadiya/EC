# EXQUISITE CRAFT

Custom phone case shop — Next.js 15 (App Router), Postgres via Prisma,
Auth.js credentials, Stripe checkout.

## Running it

```bash
npm run dev
```

The app expects Postgres on `localhost:5432` and a database called
`exquisite_craft`. It was created with:

```bash
createdb exquisite_craft
```

Then:

```bash
npx prisma migrate dev && npm run db:seed
```

### Accounts created by the seed

| Role     | Email                       | Password      |
| -------- | --------------------------- | ------------- |
| Admin    | `admin@exquisitecraft.in`   | `changeme123` |

Override with `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD`. **Change the
admin password before this goes anywhere public.**

## Environment

Copy `.env.example` to `.env` and fill it in. `DATABASE_URL` and
`AUTH_SECRET` are required; Stripe keys are optional.

### Moving to Supabase

Point `DATABASE_URL` at the Supabase connection string and run
`npx prisma migrate deploy`. Nothing else changes — the schema is plain
Postgres.

### Stripe

Checkout works **without** Stripe keys: orders are placed as
`PENDING_PAYMENT` for you to confirm from the admin panel. Add test keys
to switch on real card payment:

```
STRIPE_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
```

For the webhook locally:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

## What's in it

**Storefront** — landing page, `/shop` catalogue, product pages with a
brand → model picker (54 models across 8 brands, with per-model
surcharges), customer artwork upload plus a free-text brief, cart,
checkout, order confirmation, and order history under `/account`.

**Admin** (`/admin`, admins only) — order list with status filters and
revenue totals, order detail showing the customer's uploaded artwork and
brief with a download link, status and internal-note editing, and a
products screen for prices and visibility.

## Notes on a few decisions

- **Money is stored in paise** as integers throughout. It becomes rupees
  only at display time, so there is no float rounding in totals.
- **Order lines are denormalised** (`productName`, `modelName`,
  `unitPaise`). Renaming or repricing a product later doesn't rewrite the
  history of what someone bought.
- **Customer uploads live in `storage/uploads`, outside `public/`**, and
  are served only through `/api/uploads/[key]`, which checks the caller
  owns the order, holds the cart, or is an admin. The filename on disk is
  random, never the customer's. Swapping to Supabase Storage means
  reimplementing the three functions in `src/lib/storage.ts`.
- **Guest carts** live under a cookie token and are adopted by the
  account on sign-in, so nothing is lost at login.
- **Middleware is convenience, not the lock.** It only checks a session
  cookie exists; the real role check happens in the admin layout and in
  `requireAdmin()` inside every admin action.
- **The Stripe webhook only advances `PENDING_PAYMENT` orders**, so a
  replayed event can't move a shipped order backwards.

## Scripts

| Command              | Does                          |
| -------------------- | ----------------------------- |
| `npm run dev`        | Dev server                    |
| `npm run build`      | Production build              |
| `npm run db:seed`    | Re-seed products and models   |
| `npm run db:studio`  | Prisma Studio                 |
| `npm run db:migrate` | Create/apply a migration      |
