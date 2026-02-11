# Architectural Patterns

## API Route Pattern

Every protected API route follows this structure:
1. Auth check via `getServerSession(authOptions)` → 401 if missing
2. Input validation via Zod `.parse()` → 400 on ZodError
3. Ownership verification (filter by `userId`) → 404 if not found
4. Prisma operation → return JSON response
5. Catch-all error handler → 500

Reference implementations:
- `src/app/api/transactions/route.ts:8-93` (GET with filters + POST)
- `src/app/api/transactions/[id]/route.ts:14-92` (GET/PUT/DELETE with ownership check)
- `src/app/api/categories/route.ts:7-61`

### Ownership Verification

All data access is scoped to `session.user.id`. Queries always include `userId` in `where` clauses. See `src/app/api/transactions/[id]/route.ts:7-12` — the `getTransaction` helper enforces this.

### Pagination

GET endpoints returning lists use `PaginatedResponse<T>` (`src/types/index.ts:31-37`):
```
{ data, total, page, pageSize, totalPages }
```
Implemented via `Promise.all([findMany, count])` — see `src/app/api/transactions/route.ts:40-57`.

### Dynamic Route Params (Next.js 15)

Route params are `Promise`-based: `{ params }: { params: Promise<{ id: string }> }` — must `await params` before use. See `src/app/api/transactions/[id]/route.ts:15-17`.

---

## Dual Zod Schema Pattern

Two schemas exist for transactions:
- `transactionSchema` (API): uses `z.coerce` for string-to-type conversion from HTTP requests
- `transactionFormSchema` (Forms): uses strict types matching `useForm` generics

Both defined in `src/lib/validators.ts:20-36`. The `TransactionInput` type is inferred from the form schema (`validators.ts:49`).

---

## Form Pattern (react-hook-form + Zod + shadcn)

All forms follow:
1. `useForm<T>({ resolver: zodResolver(schema), defaultValues })` — `src/components/forms/login-form.tsx:25-28`
2. `form.reset()` in `useEffect` for edit mode — `src/components/transactions/transaction-dialog.tsx:62-84`
3. `form.watch("field")` for dependent dropdowns — `src/components/transactions/transaction-dialog.tsx:60`
4. shadcn `<Form>` + `<FormField>` + `<FormItem>` composition for each field
5. `onSubmit`: fetch → toast success/error → close dialog → trigger refresh

---

## Client Data Fetching Pattern

No data-fetching library (React Query, SWR). Instead:

### Fetch-on-mount + filter dependencies
`useEffect` with filter state in dependency array triggers refetch. `AbortController` cleans up in-flight requests. See `src/components/transactions/transaction-list.tsx:48-75`.

### Refresh-key pattern
After mutations (create/edit/delete), increment a `refreshKey` counter to trigger the fetch `useEffect`:
- Definition: `src/components/transactions/transaction-list.tsx:42`
- Trigger: `src/components/transactions/transaction-list.tsx:99-101`
- Dependency: line 75 (in the useEffect deps array)

### Simple fetch-on-mount
Dashboard uses a straightforward pattern: `src/components/dashboard/dashboard-content.tsx:20-29`.

---

## Auth Flow

### Three-layer protection
1. **Middleware** (`src/middleware.ts:1-10`): NextAuth middleware on `/dashboard/*`, `/transactions/*`, `/categories/*`, `/settings/*`
2. **Layout** (`src/app/(dashboard)/layout.tsx:10`): `await requireAuth()` server-side redirect
3. **API routes**: `getServerSession()` check in each handler

### Session augmentation
User `id` added to JWT token and session via callbacks in `src/lib/auth.ts:51-63`. Types extended in `src/types/next-auth.d.ts`.

### Registration
Atomic `db.$transaction` creates user + 11 default categories. See `src/app/api/auth/register/route.ts:38-56`.

---

## Database Access

### Prisma singleton
`src/lib/db.ts` — stores client on `globalThis` to prevent connection leaks during hot reload.

### Schema conventions
- All IDs: `cuid()` strings
- Timestamps: `createdAt` + `updatedAt` on every model
- Cascade deletes from User
- No enums (SQLite limitation) — `type` fields are `String` with app-level validation
- Composite unique constraints: `Category[userId, name]`, `Budget[userId, categoryId, month, year]`
- Indexes on query-hot paths: `Transaction[userId, date]`, `Transaction[categoryId]`

See `prisma/schema.prisma`.

---

## Component Composition

### Page → Client Component delegation
Server component pages render a heading + delegate to a `"use client"` component for interactivity:
- `src/app/(dashboard)/transactions/page.tsx` → `<TransactionList />`
- `src/app/(dashboard)/dashboard/page.tsx` → `<DashboardContent />`

### Dialog-based CRUD
List components own dialog state and pass `open`, `onOpenChange`, `onSuccess` props:
- `src/components/transactions/transaction-list.tsx:84-101` (state management)
- Lines 278-291 (dialog rendering)

### Toast notifications
All user-facing operations use `toast.success()` / `toast.error()` from sonner. Configured in `src/app/layout.tsx:30`.

---

## Theming

- `next-themes` with `attribute="class"` — `src/components/providers.tsx:10`
- Tailwind v4 dark variant via `@custom-variant dark (&:is(.dark *))` in `src/app/globals.css:5`
- Toggle component: `src/components/layout/theme-toggle.tsx`
- `suppressHydrationWarning` on `<html>` — `src/app/layout.tsx:26`
