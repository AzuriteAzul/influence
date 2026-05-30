# Influence

<p align="center">
  <strong>The Trustpilot for Influencers — Honest Reviews, Real Discovery</strong>
</p>

<p align="center">
  <a href="#"><img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="License: MIT" /></a>
  <a href="https://nextjs.org/"><img src="https://img.shields.io/badge/Next.js-16-000?logo=next.js&logoColor=white" alt="Next.js 16" /></a>
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white" alt="TypeScript" /></a>
  <a href="https://supabase.com/"><img src="https://img.shields.io/badge/Supabase-Auth%20%2B%20PostgreSQL-3ECF8E?logo=supabase&logoColor=white" alt="Supabase" /></a>
  <a href="https://vercel.com/"><img src="https://img.shields.io/badge/Deployed%20on-Vercel-000000?logo=vercel&logoColor=white" alt="Vercel" /></a>
</p>

---

## Overview

**Influence** is a community-driven platform for discovering and reviewing digital influencers. Browse influencers by category, read honest reviews from real people, and submit new influencers for inclusion — all backed by Supabase Row-Level Security and an AI-assisted admin pipeline.

Built with **Next.js 16** (App Router), **TypeScript**, **shadcn/ui**, and **Tailwind CSS v4**, with **Supabase** handling Auth, PostgreSQL, and RLS. AI-powered influencer generation uses **DeepSeek** + **Tavily** web search to produce timeless, content-focused profiles.

> **No volatile stats.** AI-generated bios exclude follower counts and ages — only content style and niche.

---

## Features

- **Influencer Discovery** — Browse, search, and filter influencers by category, rating, or recency.
- **Review System** — Authenticated users write 1–5 star reviews with titles and body text.
- **AI-Assisted Generation** — Admins submit an influencer name; Tavily searches the web and DeepSeek generates a full profile (bio, category, social links, image).
- **Admin Pipeline** — Influencers flow through `pending → generating → pending_review → approved | rejected`. Only approved influencers appear publicly.
- **Avatar Fallbacks** — Profile images use initials-based gradient avatars when URLs are missing or broken.
- **Timeless Bios** — AI-generated descriptions exclude volatile stats (age, follower counts) and focus on content style and niche.
- **Auth** — Email/password login via Supabase Auth with middleware-protected routes (`/dashboard`, `/admin`).

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, Server Components, API Routes) |
| Language | TypeScript 5 |
| UI | shadcn/ui (`base-nova` style, `@base-ui/react` primitives) + Tailwind CSS v4 |
| Backend | Supabase (Auth, PostgreSQL, RLS) |
| AI | DeepSeek (via OpenAI-compatible API) + Tavily web search |
| Validation | Zod v4 |
| Testing | Vitest |
| Deployment | Vercel |

---

## Getting Started

### Prerequisites

- **Node.js 20+**
- A Supabase project (free tier works)
- DeepSeek API key (or any OpenAI-compatible LLM endpoint)
- Tavily API key (for web search during influencer generation)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/AzuriteAzul/influence.git
   cd influence
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment variables**

   ```bash
   cp .env.local.example .env.local
   ```

   Fill in the required values:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   TAVILY_API_KEY=your-tavily-key
   OPENAI_API_KEY=your-deepseek-key
   ```

   > **Note:** `OPENAI_API_KEY` is actually a DeepSeek API key. It's used as `Authorization: Bearer ${OPENAI_API_KEY}` against `api.deepseek.com`. The env var name is a legacy convention.

4. **Start the development server**

   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:3000`.

---

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start the Next.js development server |
| `npm run build` | Production build (also type-checks) |
| `npm run lint` | ESLint with `next/core-web-vitals` + `next/typescript` |
| `npm test` | Vitest single run |
| `npm run test:watch` | Vitest watch mode |
| `npm run test:coverage` | Vitest with coverage |

---

## Project Structure

```
influence/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── admin/              # Admin-only endpoints (generate, approve, reject)
│   │   │   ├── influencers/        # Public influencer CRUD + search
│   │   │   ├── reviews/            # Public review endpoints
│   │   │   └── categories/         # Category listing
│   │   ├── admin/                  # Admin dashboard pages
│   │   ├── dashboard/              # User dashboard pages
│   │   ├── influencers/            # Public influencer pages
│   │   ├── login/                  # Auth pages
│   │   ├── submit/                 # Influencer submission page
│   │   ├── layout.tsx              # Root layout (Navbar + Footer)
│   │   └── page.tsx                # Homepage
│   ├── components/
│   │   ├── layout/                 # Navbar, Footer, SearchBar
│   │   ├── reviews/                # ReviewList, ReviewForm
│   │   └── ui/                     # shadcn/ui components (Avatar, Badge, Button, etc.)
│   ├── lib/
│   │   ├── constants.ts           # SITE_NAME, SITE_DESCRIPTION, PAGE_SIZE, REVIEW_PAGE_SIZE
│   │   ├── utils.ts                # cn(), generateSlug(), getInitials(), formatDate()
│   │   ├── validations.ts          # Zod schemas for API input
│   │   └── supabase/
│   │       ├── client.ts           # Browser client (anon key)
│   │       ├── server.ts           # Server client (anon key, reads cookies)
│   │       ├── admin.ts            # Admin client (service role, bypasses RLS)
│   │       └── middleware.ts       # Session refresh + route protection
│   ├── types/
│   │   └── index.ts                # Influencer, Review, Profile, PaginatedResponse<T>
│   └── middleware.ts               # Next.js middleware (auth redirect)
├── .env.local.example              # Environment variable template
├── components.json                 # shadcn/ui config (base-nova style)
├── next.config.ts                  # Next.js config
├── AGENTS.md                       # AI agent instructions
└── package.json
```

---

## Key Conventions

- **`SITE_NAME` and `SITE_DESCRIPTION`** in `src/lib/constants.ts` are the single source of truth for the brand. Always import them — never hardcode the app name.
- **Logo icon is `Zap`** from lucide-react (not `Star`).
- **Three Supabase clients** — use the right one:
  - `createClient()` from `@/lib/supabase/client` — Client Components only (anon key)
  - `await createClient()` from `@/lib/supabase/server` — Server Components & API routes (anon key, reads cookies)
  - `createAdminClient()` from `@/lib/supabase/admin` — API routes that bypass RLS (service role key, synchronous)
- **Influencer status flow:** `pending → generating → pending_review → approved | rejected`. Only `approved` influencers appear on public listings.
- **Avatar fallback:** Use `Avatar` + `AvatarFallback` with `getInitials()` from `@/lib/utils`. Never use raw `<img>` tags for profile images — `AvatarFallback` renders automatically on broken URLs.
- **Review author display:** Priority is `display_name → username → "Anonymous"`. Email is never included in profile data.
- **Tailwind v4:** No `tailwind.config.ts`. Configuration lives in `src/app/globals.css` via `@theme inline`. Dark mode uses `.dark` class.
- **shadcn/ui uses `@base-ui/react`** (not Radix). Components like `Avatar` import from `@base-ui/react/avatar`.
- **Zod v4** schemas in `src/lib/validations.ts` for API input validation. No inferred types are exported — infer inline if needed.
- **Pagination:** `PAGE_SIZE` (12) and `REVIEW_PAGE_SIZE` (10) from `src/lib/constants.ts`. API responses use `PaginatedResponse<T>`.

---

## Deployment

Influence is deployed on **Vercel**.

1. Push your code to GitHub.
2. Import the repository in Vercel.
3. Add all environment variables from `.env.local.example` to the Vercel project settings.
4. Ensure your Supabase project's **Auth Settings → URL Configuration** includes your Vercel production domain in the redirect URLs.

---

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/your-feature`).
3. Make your changes and ensure `npm run lint` and `npm test` pass.
4. Open a pull request with a clear description of what changed and why.

If you are adding new API routes, remember to:

- Add a Zod schema in `src/lib/validations.ts` for input validation.
- Use the correct Supabase client (`client`, `server`, or `admin`) based on the route's auth requirements.
- Update `src/types/index.ts` if you introduce new data shapes.

---

## License

This project is licensed under the **MIT License**. See [LICENSE](./LICENSE) for details.

---

<p align="center">
  <sub>Built for honest influencer discovery.</sub>
</p>