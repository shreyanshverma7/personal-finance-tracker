# Personal Finance Tracker

Full-stack web app for manually tracking income/expenses, viewing spending insights, and managing budgets. Built for a small trusted user base (5-10 people). Currency: INR (₹).

## Tech Stack

- **Framework**: Next.js 15 (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS v4, shadcn/ui (Radix primitives)
- **Database**: Prisma 5 + SQLite
- **Auth**: NextAuth.js v4 (credentials provider, JWT strategy)
- **Forms**: react-hook-form + Zod + @hookform/resolvers
- **Charts**: Recharts
- **Other**: date-fns, lucide-react (icons), sonner (toasts), next-themes (dark mode)

## Commands

```bash
npm run dev        # Start dev server (localhost:3000)
npm run build      # Production build (also runs lint + typecheck)
npm run lint       # ESLint
npx prisma migrate dev --name <name>   # Create/apply migration
npx prisma generate                     # Regenerate Prisma client
npx prisma studio                       # Database GUI (localhost:5555)
```

No test framework is configured yet.

## Project Structure

```
src/
├── app/
│   ├── (auth)/          # Public: login, register (centered layout)
│   ├── (dashboard)/     # Protected: dashboard, transactions, categories, settings
│   └── api/             # REST endpoints: auth, transactions, categories, dashboard
├── components/
│   ├── ui/              # shadcn/ui primitives (DO NOT edit manually)
│   ├── forms/           # Auth forms (login, register)
│   ├── layout/          # Sidebar, mobile nav, theme toggle
│   ├── transactions/    # Transaction list, dialog, delete dialog
│   ├── dashboard/       # Stats card, dashboard content
│   └── charts/          # Recharts wrappers (pie, line)
├── lib/
│   ├── auth.ts          # NextAuth config
│   ├── auth-utils.ts    # getCurrentUser(), requireAuth()
│   ├── db.ts            # Prisma singleton
│   ├── validators.ts    # Zod schemas + inferred types
│   └── utils.ts         # cn(), formatCurrency(), formatDate()
├── types/               # TypeScript interfaces, NextAuth augmentation
└── middleware.ts         # Route protection matcher
prisma/
└── schema.prisma        # User, Transaction, Category, Budget models
```

## Key Conventions

- **Route groups**: `(auth)` = public, `(dashboard)` = protected via `requireAuth()` in layout
- **API auth**: Every protected route calls `getServerSession(authOptions)` first
- **Data scoping**: All queries filter by `session.user.id` — no cross-user access
- **Validation**: API routes use `transactionSchema` (with `z.coerce`), forms use `transactionFormSchema` (strict types) — both in `src/lib/validators.ts`
- **Client fetching**: No React Query — uses `useEffect` + `fetch` + `refreshKey` counter for re-fetches after mutations
- **Next.js 15 params**: Route handler params are `Promise`-based — must `await params`
- **SQLite**: No enums — `type` fields are strings (`"INCOME"` | `"EXPENSE"`)
- **shadcn/ui components** in `src/components/ui/` are generated — add new ones with `npx shadcn@latest add <name>`

## Environment

Copy `.env.example` to `.env`. Required variables:
- `DATABASE_URL` — SQLite path (default: `file:./dev.db`)
- `NEXTAUTH_SECRET` — Session encryption key
- `NEXTAUTH_URL` — App URL (default: `http://localhost:3000`)

## Phase 2 (Deferred)

Account model, budget tracking UI, data export.

## Additional Documentation

Check these files for detailed patterns when modifying the codebase:

- **`.claude/docs/architectural_patterns.md`** — API route structure, form patterns, auth flow, data fetching, component composition, database conventions, theming setup
