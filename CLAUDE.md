# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Clawdbot Mission Control — a Next.js 16 dashboard for managing a bot system. Built with React 19, TypeScript 5, and Tailwind CSS 4. Dark mode by default using oklch color space.

## Commands

```bash
pnpm dev        # Start dev server (port 3000)
pnpm build      # Production build
pnpm start      # Start production server
pnpm lint       # Run ESLint
```

No test framework is configured yet.

## Architecture

- **Next.js App Router** with flat route structure under `src/app/`. Each route is a directory with `page.tsx`.
- **Root layout** (`src/app/layout.tsx`): Fixed sidebar (256px) + scrollable main content area. Uses Geist font.
- **Sidebar** (`src/components/sidebar.tsx`): Client component using `usePathname()` for active route highlighting. 9 navigation items.
- **UI components** (`src/components/ui/`): shadcn/ui (new-york style) with Radix UI primitives. Configured in `components.json`.
- **Utility** (`src/lib/utils.ts`): `cn()` function combining clsx + tailwind-merge for class merging.

### Routes

| Route | Status |
|-------|--------|
| `/` (Dashboard) | Implemented — stats grid, recent activity, upcoming crons, system status |
| `/crons` | Implemented — cron job management with enable/disable, run now, status display |
| `/agents`, `/costs`, `/logs`, `/memory`, `/settings`, `/skills`, `/tasks` | Stub pages |

All page data is currently mock/hardcoded — no backend integration yet.

## Key Conventions

- **Path alias**: `@/*` maps to `src/*`
- **Component variants**: Use CVA (class-variance-authority) for component variants, following existing shadcn patterns
- **Client components**: Mark with `"use client"` only when using hooks or browser APIs; default to server components
- **Styling**: Tailwind utility classes with CSS custom properties defined in `globals.css`. Use `cn()` for conditional/merged classes.
- **shadcn components**: Add new ones via `npx shadcn@latest add <component>` — do not manually create UI primitives
