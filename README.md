# my-saas-suite

Ship a suite of B2B products from one auth and billing Hub.

[![License: MIT](https://img.shields.io/github/license/saru-cyber/my-saas-suite)](./LICENSE)
[![Next.js 16](https://img.shields.io/badge/Next.js-16-000000?logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![pnpm 12](https://img.shields.io/badge/pnpm-12-F69220?logo=pnpm&logoColor=white)](https://pnpm.io/)

Clone it, generate local secrets, and run Hub plus the first product without Stripe, Postgres, or GA4 accounts. The same layout is what you take to production: one Suite domain, many product subdomains, one shared session.

## What this is

A Turborepo starter for a hub-and-spoke SaaS suite.

- **Hub** (`localhost:3000`) registers users, signs a shared JWT, and owns billing, the account page, admin settings, and the Suite terms.
- **Product App** (`localhost:3001`) is the template for each product: landing page, plan gate, and a footer back to the Hub.
- **CLI** writes matching `.env.local` files, including a shared `HUB_JWT_SECRET`.

English (`/en`) is the default locale. Japanese (`/ja`) is included.

## Architecture

```
┌──────────────────────────────────────────────┐
│ Hub / Suite                         :3000    │
│ Auth · Account · Admin · Stripe · Terms      │
│ Cookie: suite_session                        │
└────────────────────┬─────────────────────────┘
                     │ JWT (HS256) · shared cookie
         ┌───────────┴───────────┐
         ▼                       ▼
┌─────────────────┐     ┌─────────────────┐
│ Product A       │     │ Product B       │
│ products/app1   │     │ copy this app   │
│ :3001           │     │ next subdomain  │
│ LP · Dashboard  │     │ LP · Dashboard  │
└─────────────────┘     └─────────────────┘
```

Production maps the same split onto subdomains (`hub.your-suite.com`, `app1.your-suite.com`) and sets `COOKIE_DOMAIN` to the parent domain. On localhost the cookie is host-only, so Hub on port 3000 and App1 on port 3001 already share it.

## Key features

- **SSO shared cookie.** Hub signs `suite_session` (`userId`, `email`, `activeProducts`, `plan`, and `role`). App1 verifies the first four claims in middleware and sends signed-out or unsubscribed visitors back to the Hub login page (`/{locale}/login`) in the same locale. Extra claims such as `role` can be ignored by a product app.
- **Account page.** A signed-in user opens `/en/dashboard` (or `/ja/dashboard`) for the current plan, product links, and the billing portal. An admin also gets a link to settings.
- **Admin settings.** `/en/admin/settings` allows `role: admin` only. A signed-out visitor is redirected to `/[locale]/login`. A signed-in member is redirected to `/[locale]/dashboard`. Auth, Stripe, and appearance tabs save in place and show a toast. Rows live in `system_settings` when Postgres is reachable, and in process memory otherwise. A missing row falls back to `.env`. Checkout and the billing portal still follow `STRIPE_SECRET_KEY` in the environment, so the dummy secret stays in mock mode until that value changes.
- **Stripe mock mode.** The dummy secret `sk_test_YOUR_STRIPE_SECRET_KEY` skips Stripe, marks the user as `pro` for `app1`, and returns the product dashboard. A real secret creates a Checkout Session. The webhook acknowledges the dummy secret without calling Stripe.
- **CLI tooling.** `pnpm cli` generates `HUB_JWT_SECRET` and the internal API key with `crypto.randomBytes(32)` and writes `hub/.env.local` and `products/app1/.env.local`.
- **i18n (EN / JA).** `next-intl` routes every page under `/[locale]`. Message catalogs live in `messages/en.json` and `messages/ja.json`. Footers include an EN | JA switch.
- **Legal, GA4, and SEO.** Suite terms live on the Hub, with a prototype disclaimer and `[EDIT_REQUIRED]` placeholders. App1 loads GA4 only when `NEXT_PUBLIC_GA_MEASUREMENT_ID` is a real measurement ID, and emits the Search Console verification meta tag from `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`.

Local accounts are stored in memory, so a Hub restart clears them. Admin settings use the same fallback: Postgres stores them in `system_settings` when `DATABASE_URL` connects, and the Hub process keeps them in memory when it does not. The Drizzle schema covers `users` and `system_settings`.

## Quick start

Requires Node.js and pnpm 12 (`packageManager` is `pnpm@12.14.0`).

```bash
pnpm install
pnpm cli
pnpm dev
```

| App | URL |
| --- | --- |
| Hub | http://localhost:3000/en |
| Developer navigation | http://localhost:3000/en/dev |
| Hub account | http://localhost:3000/en/dashboard |
| Hub admin settings | http://localhost:3000/en/admin/settings |
| App1 landing | http://localhost:3001/en |
| App1 dashboard | http://localhost:3001/en/dashboard |

Use `/ja` in place of `/en` for Japanese. Developer navigation (`/en/dev`) is a local index of every screen. It returns 404 when `NODE_ENV` is `production`. Every screen and its access rule is listed in [Available Routes & Screens](#available-routes--screens).

Demo account: `demo@example.com` / `password`. This user is an admin and can open both the account page and the admin settings console. A user who registers in the app is a member: the account page is available, and admin settings redirects that user to the account page. Registration starts on the free plan. Use **Buy App1 (Pro) (Mock)** on the Hub home to add `app1` and open the product dashboard. Sign in again after a role change. A session issued before `role` existed is treated as a member.

`pnpm cli` overwrites both `.env.local` files. Run it again only when you want new secrets. Those files are gitignored.

## Available Routes & Screens

`[locale]` is `en` or `ja`. English is the default, so `/` opens `/en`. Hub middleware only selects the locale. Sign-in checks run in the account page and in `hub/app/[locale]/admin/layout.tsx`. App1 middleware gates `/{locale}/dashboard` only; the landing page stays public.

```text
my-saas-suite
├ hub（親ポータル・認証・決済 :3000）
│ ├ LP (/[locale])
│ ├ 開発者用ナビゲーション (/[locale]/dev)
│ ├ ログイン・新規登録 (/[locale]/login)
│ ├ ユーザーマイページ (/[locale]/dashboard)
│ ├ 管理者設定 (/[locale]/admin/settings)
│ └ 法務ページ (/[locale]/terms, /privacy, /legal/merchant)
│
└ products/app1（子プロダクト :3001）
  ├ LP (/[locale])
  └ プロダクトダッシュボード (/[locale]/dashboard)
```

### Hub (`http://localhost:3000`)

| Path | Screen | Access |
| --- | --- | --- |
| `/[locale]` | Suite landing page | No sign-in |
| `/[locale]/dev` | Developer navigation | No sign-in. Available only when `NODE_ENV` is not `production` (set `DEV_PORTAL_ENABLED=false` to hide it in development too). Production returns 404. |
| `/[locale]/login` | Sign in and registration | No sign-in. A successful login sets `suite_session`. |
| `/[locale]/dashboard` | Account page | Sign-in required. Shows the plan, active products, and the billing portal. |
| `/[locale]/admin/settings` | Admin settings | `role: admin` only. A signed-out visitor is redirected to `/[locale]/login`. A signed-in member is redirected to `/[locale]/dashboard`. |
| `/[locale]/terms` | Terms of service | No sign-in |
| `/[locale]/privacy` | Privacy policy | No sign-in. Placeholder (coming soon). |
| `/[locale]/legal/merchant` | Specified Commercial Transactions disclosure (特定商取引法に基づく表記) | No sign-in. Placeholder (coming soon). |

### Product App1 (`http://localhost:3001`)

| Path | Screen | Access |
| --- | --- | --- |
| `/[locale]` | App1 landing page | No sign-in |
| `/[locale]/dashboard` | App1 dashboard | Sign-in required, and `activeProducts` must include `app1`. Otherwise the visitor is redirected to the Hub login page at `http://localhost:3000/[locale]/login`. |

The App1 page repeats the same check as middleware. A session without `app1` in `activeProducts` does not open the dashboard. Role (`admin` or `member`) is not part of this gate.

## Directory structure

```
.
├── hub/                  Suite Hub (port 3000)
│   ├── app/[locale]/     home, dev portal, account, terms
│   ├── app/[locale]/admin/settings
│   ├── messages/         en.json, ja.json
│   └── src/              auth, billing, settings, user store
├── products/app1/        Product A template (port 3001)
│   ├── app/[locale]/     landing page and dashboard
│   ├── messages/         en.json, ja.json
│   └── middleware.ts     locale routing + JWT gate
├── docs/                 external requirements template
├── packages/cli/         .env.local generator
├── DESIGN.md             UI rules for Hub and products
├── turbo.json
├── pnpm-workspace.yaml
├── CONTRIBUTING.md
└── LICENSE
```

The steps for a new product are in [Adding a new product](#adding-a-new-product). Shared clauses for an external brief are in [docs/PRODUCT_REQUIREMENTS_TEMPLATE.md](./docs/PRODUCT_REQUIREMENTS_TEMPLATE.md).

## Adding a new product

Build the Next.js app on its own, then copy it to `products/<app-name>`. The workspace already includes `products/*`, and `pnpm dev` starts every package `dev` script it finds there.

### 1. Build and test it alone

Finish the product as a normal Next.js app and test it before it joins the Suite. Use `next-intl` with `/en` and `/ja`. Do not add a sign-up or login screen. The Hub owns both.

### 2. Copy it under `products/`

Copy the directory to `products/<app-name>` and set a unique `name` in that app's `package.json`. Leave `pnpm-workspace.yaml` as it is.

### 3. Apply the session guard

Copy these files from `products/app1` when the new app does not already have them:

- `middleware.ts`
- `src/auth/session.ts`
- `src/auth/claims.ts`
- `i18n/routing.ts`

Set `PRODUCT_ID` in `src/auth/session.ts` to the new id, such as `app2`. The guard reads `suite_session`, checks the HS256 signature with `HUB_JWT_SECRET`, and opens `/{locale}/dashboard` only when `activeProducts` contains that id. Any other visitor to that path is sent to `{NEXT_PUBLIC_HUB_URL}/{locale}/login`, the Hub login page in the same locale. The public landing page stays open, as it does in App1.

### 4. Assign a port and sync env

Point `dev` and `start` at a free port:

```json
"dev": "next dev --port 3002",
"start": "next start --port 3002"
```

`pnpm cli` rewrites `hub/.env.local` and `products/app1/.env.local` and puts the same `HUB_JWT_SECRET` in both. It does not write an env file for any other product. After it runs, create `products/<app-name>/.env.local` with that secret, plus `NEXT_PUBLIC_HUB_URL`, `COOKIE_DOMAIN`, the new `PRODUCT_ID`, and `NEXT_PUBLIC_APP_URL` on the new port. Run `pnpm cli` again only when you want new Hub and App1 secrets.

### Register it on the Hub

Add the id to `hub/src/products/catalog.ts` and to `PRODUCT_IDS` in `hub/src/billing/stripe.ts`, and point the launch URL at `http://localhost:<port>/{locale}/dashboard`. The account page lists a product only after that registration. The product guard still sends the user back to the Hub until `activeProducts` contains the id.

Paste [docs/PRODUCT_REQUIREMENTS_TEMPLATE.md](./docs/PRODUCT_REQUIREMENTS_TEMPLATE.md) into a brief before you hand the product to another team.

## Scripts

| Command | What it does |
| --- | --- |
| `pnpm dev` | Hub, App1, and any other app under `products/*` via Turborepo |
| `pnpm build` | Production build of every app |
| `pnpm cli` | Regenerate local env files and internal keys |

## License and author

MIT. Copyright (c) 2026 [Masayuki Sarugaku](https://github.com/saru-cyber).

The terms page is a prototype. Have a qualified attorney review it before production use.

Feel free to fork and build your own SaaS! 
Please read [CONTRIBUTING.md](./CONTRIBUTING.md) for the maintenance status and guidelines before opening Issues or Pull Requests.