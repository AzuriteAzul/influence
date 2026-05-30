# Contributing to Influence

Thanks for your interest in contributing! This guide will help you get started.

## Setup

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

   Fill in the required values in `.env.local` (see `.env.local.example` for details).

4. **Start the development server**

   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:3000`.

## Development Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the Next.js development server |
| `npm run build` | Production build (also type-checks) |
| `npm run lint` | Run ESLint |

## Code Style

- **TypeScript** — All code is written in TypeScript. Use strict types; avoid `any`.
- **React** — Follow the existing component patterns. Use Server Components by default; add `"use client"` only when needed.
- **Styling** — Tailwind CSS v4 via utility classes. No `tailwind.config.ts`; theme is in `src/app/globals.css`.
- **Components** — shadcn/ui with `@base-ui/react` primitives. Add new components via `npx shadcn@latest add <component>`.
- **Imports** — Use `@/` path aliases (e.g., `@/components/ui/button`).
- **Naming** — `SITE_NAME` and `SITE_DESCRIPTION` from `@/lib/constants` are the single source of truth. Never hardcode the brand name.

## Pull Request Process

1. **Create a branch** from `main` with a descriptive name (e.g., `feat/add-search`, `fix/review-display`).
2. **Make your changes** following the code style above.
3. **Test locally** — Run `npm run build` to verify no type errors or build failures.
4. **Lint** — Run `npm run lint` and fix any issues.
5. **Open a PR** — Fill out the PR template with a description, type of change, and checklist.
6. **Review** — Address review feedback and push updates as needed.

## Reporting Issues

- Use the **Bug Report** template for bugs.
- Use the **Feature Request** template for new ideas.
- Provide as much detail as possible — steps to reproduce, expected behavior, and environment.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.