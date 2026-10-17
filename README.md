# my-saas-suite

Ship a suite of B2B products from one auth and billing Hub.

[![License: MIT](https://img.shields.io/github/license/saru-cyber/my-saas-suite)](./LICENSE)
[![Next.js 16](https://img.shields.io/badge/Next.js-16-000000?logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![pnpm 12](https://img.shields.io/badge/pnpm-12-F69220?logo=pnpm&logoColor=white)](https://pnpm.io/)

Clone it, generate local secrets, and run Hub plus the first product without Stripe, Postgres, or GA4 accounts. The same layout is what you take to production: one Suite domain, many product subdomains, one shared session.

## What this is

A Turborepo starter for a hub-and-spoke SaaS suite.

- **Hub** (`localhost:3000`) registers users, signs a shared JWT, and owns billing plus the Suite terms.
- **Product App** (`localhost:3001`) is the template for each product: landing page, plan gate, and a footer back to the Hub.
- **CLI** writes matching `.env.local` files, including a shared `HUB_JWT_SECRET`.

English (`/en`) is the default locale. Japanese (`/ja`) is included.

## Architecture

```
┌──────────────────────────────────────────────┐
│ Hub / Suite                         :3000    │
│ Auth · Stripe (or mock) · Terms · i18n       │
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

- **SSO shared cookie.** Hub signs `suite_session` (`userId`, `email`, `activeProducts`, `plan`). App1 verifies it in middleware and sends signed-out or unsubscribed visitors back to the Hub in the same locale.
- **Stripe mock mode.** The dummy secret `sk_test_YOUR_STRIPE_SECRET_KEY` skips Stripe, marks the user as `pro` for `app1`, and returns the product dashboard. A real secret creates a Checkout Session. The webhook acknowledges the dummy secret without calling Stripe.
- **CLI tooling.** `pnpm cli` generates `HUB_JWT_SECRET` and the internal API key with `crypto.randomBytes(32)` and writes `hub/.env.local` and `products/app1/.env.local`.
- **i18n (EN / JA).** `next-intl` routes every page under `/[locale]`. Message catalogs live in `messages/en.json` and `messages/ja.json`. Footers include an EN | JA switch.
- **Legal, GA4, and SEO.** Suite terms live on the Hub, with a prototype disclaimer and `[EDIT_REQUIRED]` placeholders. App1 loads GA4 only when `NEXT_PUBLIC_GA_MEASUREMENT_ID` is a real measurement ID, and emits the Search Console verification meta tag from `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`.

Local accounts are stored in memory, so a Hub restart clears them. The Drizzle schema is ready for Postgres when you point `DATABASE_URL` at a real database.

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
| App1 landing | http://localhost:3001/en |
| App1 dashboard | http://localhost:3001/en/dashboard |

Demo account: `demo@example.com` / `password`. Registering a new user starts on the free plan. Use **Buy App1 (Pro) (Mock)** to open the dashboard.

`pnpm cli` overwrites both `.env.local` files. Run it again only when you want new secrets. Those files are gitignored.

## Directory structure

```
.
├── hub/                  Suite Hub (port 3000)
│   ├── app/[locale]/     login and /terms
│   ├── messages/         en.json, ja.json
│   └── src/              auth, billing, user store
├── products/app1/        Product A template (port 3001)
│   ├── app/[locale]/     landing page and dashboard
│   ├── messages/         en.json, ja.json
│   └── middleware.ts     locale routing + JWT gate
├── packages/cli/         .env.local generator
├── turbo.json
├── pnpm-workspace.yaml
├── CONTRIBUTING.md
└── LICENSE
```

Add another product by copying `products/app1`, giving it a new port and `PRODUCT_ID`, and teaching the Hub checkout path about that id.

## Scripts

| Command | What it does |
| --- | --- |
| `pnpm dev` | Hub and App1 via Turborepo |
| `pnpm build` | Production build of every app |
| `pnpm cli` | Regenerate local env files and internal keys |

## License and author

MIT. Copyright (c) 2026 [Masayuki Sarugaku](https://github.com/saru-cyber).

The terms page is a prototype. Have a qualified attorney review it before production use.

Feel free to fork and build your own SaaS! 
Please read [CONTRIBUTING.md](./CONTRIBUTING.md) for the maintenance status and guidelines before opening Issues or Pull Requests.