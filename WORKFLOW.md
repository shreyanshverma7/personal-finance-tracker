# Claude Code Workflow Reference
**Project:** Personal Finance Tracker (Next.js 15 + Prisma + SQLite + NextAuth)

---

## Daily Rhythm

```
Start session    →  /resume-session
New feature      →  /feature <name>
Pre-PR           →  /verify pre-pr
Problem solved   →  /learn
End session      →  /save-session
```

---

## Slash Commands

| Command | When to use |
|---|---|
| `/feature <name>` | Any non-trivial feature — runs full Explore → Plan → Implement → Review → Verify flow |
| `/verify` | Before pushing a PR (`/verify pre-pr` for full security scan) |
| `/verify quick` | Fast check: build + types only |
| `/save-session` | End of session or before hitting context limits |
| `/resume-session` | Start of a new session — loads last saved state |
| `/learn` | After solving a non-trivial problem — saves the pattern |

---

## Agents — spawn proactively, don't wait to be asked

| Agent | Model | Trigger |
|---|---|---|
| `planner` | Opus | Feature spans 3+ files — plan before writing any code |
| `typescript-reviewer` | Sonnet | After editing `.ts`/`.tsx` files |
| `security-reviewer` | Sonnet | After any API route, auth, or DB query change |
| `build-error-resolver` | Sonnet | When `npm run build` or tsc fails |
| `prisma-reviewer` | Sonnet | When `schema.prisma` or migrations change |

Run `typescript-reviewer` + `security-reviewer` in parallel after each feature phase.

---

## Hooks — fire automatically

| Trigger | What happens |
|---|---|
| `Edit`/`MultiEdit` `.ts`/`.tsx` | ESLint on that file (sync) |
| `Edit`/`MultiEdit` `.ts`/`.tsx` | tsc --noEmit (async, non-blocking) |
| `Write` a `.md`/`.txt` file | Warns if not an allowed file |
| `Bash` with build/dev commands | Warns if not in tmux |
| `Bash` with `git push` | Reminds about PR workflow |
| End of every response | console.log scan + session metadata written |

---

## Session System — what each layer is for

| Layer | How it works | Use it for |
|---|---|---|
| **Auto-memory** (`~/.claude/projects/.../memory/`) | Written by Claude when it learns facts | Permanent project facts, preferences, tech decisions |
| **Stop hook log** (`~/.claude/sessions/YYYY-MM-DD-<project>.md`) | Written automatically after every response | Lightweight audit trail — files touched, rough task list |
| **`/save-session`** (`~/.claude/sessions/*.tmp`) | Written intentionally at session end | Rich synthesis: what worked, what failed, exact next step |

**Rule:** Stop hook is automatic (ignore it). `/save-session` is intentional (run at end of day). Memory is managed by Claude.

---

## Git Workflow (non-negotiable)

1. **Always ask for branch name before starting** — never create branches silently
2. Branch prefixes: `feature/` `fix/` `ui/` `refactor/` `perf/` `chore/` `hotfix/`
3. Conventional commits: `feat(scope): desc`, `fix(scope): desc`, etc.
4. Never commit or push directly to `master`
5. Never use `--no-verify`
6. After merge: delete branch → pull master

**PR checklist before pushing:**
- [ ] `npm run build` passes
- [ ] `/verify pre-pr` clean
- [ ] No `console.log` in source

---

## Key Project Conventions

- **API auth:** `getServerSession(authOptions)` must be first line of every protected route
- **Data scoping:** Every DB query filters by `session.user.id` — no exceptions
- **Validation:** API uses `transactionSchema` (z.coerce), forms use `transactionFormSchema` (strict) — both in `src/lib/validators.ts`
- **DB client:** Always import from `src/lib/db.ts`, never `new PrismaClient()`
- **Next.js 15 params:** Always `await params` in route handlers
- **SQLite:** No enums — use string literals `"INCOME"` | `"EXPENSE"`
- **shadcn/ui:** Never edit `src/components/ui/` manually — use `npx shadcn@latest add <name>`
- **Client fetching:** `useEffect` + `fetch` + `refreshKey` counter — no React Query

---

## Rules loaded automatically (`~/.claude/rules/`)

| File | Enforces |
|---|---|
| `git-workflow.md` | Branch naming, commits, PR process |
| `agents.md` | When to invoke which agent |
| `no-docs.md` | Never create `.md` documentation files |
| `coding-style.md` | Immutability, 800-line limit, TypeScript standards |
| `security.md` | `getServerSession` first, `userId` on every query, Zod at boundaries |

---

## Infrastructure map

```
~/.claude/
├── settings.json        ← hooks config
├── rules/               ← always-loaded behavioral rules (5 files)
├── agents/              ← subagents Claude can spawn (5 agents)
├── commands/            ← slash commands (5 commands)
├── scripts/
│   └── session-end.js   ← Stop hook session writer
└── sessions/            ← auto logs + /save-session files
```
