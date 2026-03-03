# Migration: Make Account Required for Transactions

**Date:** 2026-03-03
**Ticket:** SCRUM-13
**Migration:** `20260303212622_make_account_id_required`

## Overview

This migration makes the `accountId` field required for all transactions. Previously, transactions could exist without being linked to an account (`accountId` was nullable). After this migration, every transaction must be associated with an account.

## Migration Process

### 1. Data Migration (Run First)

**Script:** `prisma/migrate-transactions-to-accounts.ts`

This script:
- Creates a default "General" account (type: BANK, initialBalance: 0) for each user
- Assigns all existing transactions with `accountId = null` to the user's "General" account
- Verifies that no orphaned transactions remain

**How to run:**
```bash
npm run migrate:accounts
```

**Output:**
- Lists each user processed
- Shows number of transactions assigned to "General" account
- Confirms successful migration

### 2. Schema Migration (Run Second)

**Migration:** `20260303212622_make_account_id_required`

This Prisma migration:
- Changes `accountId` from `String?` (nullable) to `String` (required)
- Updates the `account` relation from `Account?` to `Account`
- Recreates the Transaction table with the NOT NULL constraint

**How to run:**
```bash
npx prisma migrate dev --name make_account_id_required
```

This migration was already applied automatically after the data migration.

## Database Changes

### Before
```prisma
model Transaction {
  // ...
  accountId   String?  // Nullable
  account     Account? @relation(...)  // Nullable relation
}
```

### After
```prisma
model Transaction {
  // ...
  accountId   String   // Required
  account     Account  @relation(...)  // Required relation
}
```

## Impact on Application

### API Changes
- **Transaction creation:** Now requires `accountId` field
- **Transaction queries:** Account data is always available (no null checks needed in API layer)

### UI Changes
- Transaction form already has account selector (implemented in SCRUM-11)
- Transaction list displays account names (implemented in SCRUM-12)
- All null-safe rendering patterns remain for defensive coding

### Default Account
- Users can see and use the "General" account like any other account
- Users can rename the "General" account
- Users can delete the "General" account after reassigning transactions to other accounts
- The "General" account is not special in the database—it's just a regular account created during migration

## Rollback (If Needed)

If you need to rollback this migration:

1. Revert the schema change:
```prisma
accountId   String?
account     Account? @relation(...)
```

2. Create a new migration:
```bash
npx prisma migrate dev --name revert_account_id_required
```

**Warning:** This would allow transactions without accounts again, which may break the UI expectations.

## Verification

After migration, verify:

✅ All transactions have an `accountId`
```sql
SELECT COUNT(*) FROM Transaction WHERE accountId IS NULL;
-- Should return 0
```

✅ "General" accounts exist for users with transactions
```sql
SELECT userId, name, type FROM Account WHERE name = 'General';
```

✅ Transaction form requires account selection
✅ Transaction list displays account names
✅ Dashboard shows account balances correctly

## Related Tickets

- **SCRUM-8:** Add Account model to Prisma schema
- **SCRUM-10:** Implement Account CRUD API endpoints
- **SCRUM-11:** Add account selector to transaction form & dashboard balance cards
- **SCRUM-12:** Display account name on transaction list
- **SCRUM-13:** Migrate existing transactions to accounts (this migration)
- **SCRUM-14:** Testing and polish for Account Model

## Notes

- Migration script is idempotent—running it multiple times is safe
- Script checks if "General" account exists before creating
- Script only updates transactions with `accountId = null`
- Users who already had accounts set up are not affected
- The migration preserves all existing transaction data
