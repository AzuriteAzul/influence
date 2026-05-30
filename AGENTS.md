# AGENTS.md

## Stack
Next.js 16 (App Router), React 19, Supabase, shadcn/ui (`base-nova` style, `@base-ui/react` primitives), Tailwind CSS v4, Zod v4, TypeScript, Vitest.

## Commands
- `npm run dev` — dev server on http://localhost:3000
- `npm run build` — production build (also type-checks)
- `npm run lint` — ESLint (flat config, `eslint-config-next` core-web-vitals + typescript)
- `npm test` — Vitest single run
- `npm run test:watch` — Vitest watch mode
- `npm run test:coverage` — Vitest with coverage

## Paths
- `@/*` → `./src/*` (tsconfig paths)
- shadcn components in `@/components/ui`, generated via `components.json` (RSC enabled, lucide icons)
- Tests in `src/__tests__/` (pattern: `src/**/*.test.ts`)

## Environment
Copy `.env.local.example` → `.env.local` and set:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `TAVILY_API_KEY` — used by the admin influencer generation endpoint
- `OPENAI_API_KEY` — actually a DeepSeek API key; used as `Authorization: Bearer ${OPENAI_API_KEY}` against `api.deepseek.com`

## Supabase clients — when to use each

| Factory | File | Key used | When |
|---|---|---|---|
| `createClient()` | `@/lib/supabase/client` | Anon | Client Components only |
| `await createClient()` | `@/lib/supabase/server` | Anon | Server Components, API routes (reads) |
| `createAdminClient()` | `@/lib/supabase/admin` | Service role | API routes that bypass RLS (writes from public endpoints, admin operations) |

The admin client is synchronous (no `await`). The server client requires `await` (accesses `cookies()`).

## Auth flow
- Middleware (`src/middleware.ts`) refreshes Supabase session on every request via `updateSession` from `@/lib/supabase/middleware`.
- Protected routes: `/dashboard` and `/admin` (prefix match). Unauthenticated users are redirected to `/login?redirect=<original>`.
- Login uses email/password via Supabase Auth. Auth callback at `/auth/callback?code=...`.
- User profiles are in the `profiles` table with an `is_admin` boolean.

## Influencer status state machine
`pending` → `generating` → `pending_review` → `approved` | `rejected`

Only `approved` influencers appear on public listings. Admin panels manage all statuses.

## Review author display
Review APIs return a `profiles` object on each review with `{ id, display_name, username, avatar_url }`. Frontend displays author name using priority: `username → display_name → "Anonymous"`. Email is never included in profile data.

## Branding
- `SITE_NAME` and `SITE_DESCRIPTION` in `@/lib/constants` are the single source of truth. Import them — never hardcode the brand name.
- Logo icon is `Zap` from lucide-react (not `Star`).

## Tailwind v4 notes
No `tailwind.config.ts`. Tailwind is configured entirely via `src/app/globals.css` (`@import "tailwindcss"` + `@theme inline` block). CSS variables for shadcn theming (neutral base, indigo/violet accent). Dark mode uses `.dark` class variant.

## shadcn/ui notes
- Uses `@base-ui/react` primitives (not Radix). Components like `Avatar` use `AvatarPrimitive.Root`, `AvatarPrimitive.Image`, `AvatarPrimitive.Fallback` from `@base-ui/react/avatar`.
- When `AvatarImage` fails to load, `AvatarFallback` renders automatically — no `onError` handler needed.

## API route structure
- Public: `/api/influencers`, `/api/influencers/[slug]`, `/api/influencers/[slug]/reviews`, `/api/categories`, `/api/reviews/[id]`, `/api/reviews/user`, `/api/influencers/user`
- Admin: `/api/admin/influencers`, `/api/admin/influencers/generate`, `/api/admin/influencers/[id]`, `/api/admin/influencers/[id]/approve`, `/api/admin/influencers/[id]/reject`, `/api/admin/reviews`, `/api/admin/reviews/[id]`, `/api/admin/stats`

## Conventions
- Zod schemas in `src/lib/validations.ts` for API input validation. No inferred types are exported — infer inline if needed.
- Pagination uses `PAGE_SIZE` (12) and `REVIEW_PAGE_SIZE` (10) from `src/lib/constants.ts`.
- Slugs are generated with `generateSlug()` in `src/lib/utils.ts`, with collision avoidance via timestamp suffix.
- API responses use `PaginatedResponse<T>` shape from `src/types/index.ts`.
- `getInitials(name)` in `src/lib/utils.ts` derives initials for avatar fallbacks (handles empty strings, single-word names, multi-word names).

## Testing
- Vitest with `globals: true` and `environment: "node"`. Config in `vitest.config.ts`.
- `@` path alias resolves to `./src` in tests.
- API route tests mock Supabase clients with `vi.hoisted()` for factory variables (required due to `vi.mock` hoisting).
- No component tests yet — only lib functions and API routes.