# Git Workflow & Collaboration Rules for This Project

I am a solo developer working on a personal finance tracker. Even though I am the only developer,
I want to follow a professional, structured Git workflow to keep the codebase clean, trackable,
and easy to iterate on. You must follow these rules strictly every time we work on something new.

---

## CORE PRINCIPLE

**Never work directly on the master branch.**

Every piece of work — whether a new feature, a bug fix, a refactor, or even a small tweak —
must go through its own branch and a pull request. No exceptions.

---

## BRANCH NAMING CONVENTIONS

Use the following prefixes depending on the type of work:

| Type              | Prefix        | Example                                |
|-------------------|---------------|----------------------------------------|
| New feature       | `feature/`    | `feature/csv-import`                   |
| Bug fix           | `fix/`        | `fix/transaction-delete-error`         |
| UI/UX improvement | `ui/`         | `ui/dashboard-responsive-layout`       |
| Refactor          | `refactor/`   | `refactor/auth-middleware`             |
| Performance       | `perf/`       | `perf/transaction-query-optimization`  |
| Documentation     | `docs/`       | `docs/setup-instructions`             |
| Config/infra      | `chore/`      | `chore/update-dependencies`            |
| Hotfix (urgent)   | `hotfix/`     | `hotfix/login-crash-production`        |

Branch names must be:

- All lowercase
- Words separated by hyphens (kebab-case)
- Short but descriptive (max 4-5 words after the prefix)

---

## WORKFLOW STEPS (Follow This Every Time)

### Starting a New Task:

```
1. Always start from an up-to-date master:
   git checkout master
   git pull origin master

2. Create a new branch:
   git checkout -b feature/your-feature-name

3. Confirm the active branch before writing any code:
   git branch
```

### During Development:

```
4. Make small, focused commits as you complete logical units of work.
   DO NOT make one giant commit at the end.

5. Commit message format (Conventional Commits standard):
   <type>(<scope>): <short description>

   Examples:
   feat(transactions): add delete confirmation modal
   fix(auth): resolve session expiry redirect loop
   ui(dashboard): improve mobile chart responsiveness
   refactor(db): extract query logic into repository layer
   chore(deps): upgrade prisma to v5.10

6. Each commit should:
   - Be a single logical change
   - Pass linting (no broken code)
   - Have a clear, descriptive message in present tense
```

### Before Raising a Pull Request:

```
7. Pull latest master into your branch to catch conflicts early:
   git fetch origin
   git rebase origin/master

8. Review your own changes:
   git diff origin/master

9. Make sure the project builds without errors:
   npm run build
   npm run lint
```

### Raising the Pull Request:

```
10. Push your branch to GitHub:
    git push origin feature/your-feature-name

11. Create a pull request on GitHub with the following structure:
```

---

## PR Template

### PR Title

`<type>: <short description of what this PR does>`

Example: `feat: add CSV import with field mapping`

### What does this PR do?

A 2-3 sentence description of the changes made.

### Type of Change

- [ ] New feature
- [ ] Bug fix
- [ ] Refactor
- [ ] UI/UX improvement
- [ ] Documentation
- [ ] Other: ___

### Changes Made

- Bullet point list of specific changes
- Each bullet = one logical change

### How to Test

Step-by-step instructions to manually verify this works:

1. Go to...
2. Click on...
3. Expect...

### Screenshots (if UI change)

Before / After screenshots if applicable.

### Checklist

- [ ] Code builds without errors (`npm run build`)
- [ ] No TypeScript errors
- [ ] No ESLint warnings
- [ ] Tested manually
- [ ] No `console.log` statements left in
- [ ] Environment variables documented if new ones added

---

```
12. After PR is created, review it once yourself on GitHub before merging.
13. Merge using "Squash and Merge" for feature branches to keep master history clean.
14. Delete the branch after merging.
15. Pull the updated master locally:
    git checkout master
    git pull origin master
```

---

## COMMIT TYPE REFERENCE (Conventional Commits)

| Type       | When to Use                                      |
|------------|--------------------------------------------------|
| `feat`     | A new feature                                    |
| `fix`      | A bug fix                                        |
| `ui`       | Visual/layout changes with no logic change       |
| `refactor` | Code restructure, no behavior change             |
| `perf`     | Performance improvement                          |
| `test`     | Adding or fixing tests                           |
| `docs`     | Documentation changes                            |
| `chore`    | Dependency updates, config changes, tooling      |
| `revert`   | Reverting a previous commit                      |

---

## RULES FOR CLAUDE CODE TO FOLLOW

1. **Before starting any task**, always ask:
   "Should I create a new branch for this? What would you like to call it?"
   Then create the branch before writing a single line of code.

2. **Remind me to pull latest master** before branching if we're starting a new session.

3. **Make incremental commits** as features are built, not one big commit at the end.

4. **Generate the PR description** for me when the feature is complete, following the
   PR template above. I'll copy it into GitHub.

5. **Flag if I try to work directly on master.** If I say something like "just fix this
   quickly on master", remind me to create a branch instead.

6. **Never push to master directly.** All changes go through branches and PRs.

7. **After completing work**, always remind me of the next steps:
   - Run build + lint
   - Push the branch
   - Create the PR using the generated description
   - Review and merge on GitHub
   - Delete the branch
   - Pull updated master

---

## EXAMPLE SESSION START

When I say "I want to add [feature]" or "fix [bug]", your first response should be:

```
"Got it. Here's the branch we'll work on:
  git checkout master
  git pull origin master
  git checkout -b feature/csv-import
Shall I go ahead and start building once you've run this?"
```

Then proceed with implementation only after I confirm the branch is active.

---

## CURRENT PROJECT CONTEXT

- Project: Personal Finance Tracker
- Stack: Next.js 15, TypeScript, Prisma, SQLite, Tailwind CSS, shadcn/ui
- Repo: Connected to GitHub
- Main branch: `master`
- Deployment: Vercel

Always keep this workflow in mind throughout our entire session.
