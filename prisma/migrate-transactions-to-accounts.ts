/**
 * Data migration script: Migrate existing transactions to accounts
 *
 * This script:
 * 1. Creates a default "General" account for each user who doesn't have one
 * 2. Assigns all transactions with null accountId to the user's "General" account
 *
 * Run this BEFORE making accountId required in the schema.
 *
 * Usage: npx tsx prisma/migrate-transactions-to-accounts.ts
 */

import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function main() {
  console.log("Starting transaction-to-account migration...\n");

  // Get all users
  const users = await db.user.findMany({
    select: { id: true, email: true },
  });

  console.log(`Found ${users.length} user(s)\n`);

  for (const user of users) {
    console.log(`Processing user: ${user.email}`);

    // Check if user already has a "General" account
    let generalAccount = await db.account.findFirst({
      where: {
        userId: user.id,
        name: "General",
      },
    });

    // Create "General" account if it doesn't exist
    if (!generalAccount) {
      generalAccount = await db.account.create({
        data: {
          userId: user.id,
          name: "General",
          type: "BANK",
          initialBalance: 0,
        },
      });
      console.log(`  ✓ Created "General" account (${generalAccount.id})`);
    } else {
      console.log(`  ℹ "General" account already exists (${generalAccount.id})`);
    }

    // Note: This query will not work if accountId is already required in the schema
    // If migration has already been run, we skip this step
    try {
      // @ts-ignore - Ignore type error if accountId is already required
      const transactionsWithoutAccount = await db.transaction.findMany({
        where: {
          userId: user.id,
          accountId: null,
        },
        select: { id: true },
      });

      if (transactionsWithoutAccount.length > 0) {
        // Assign all transactions without account to "General" account
        // @ts-ignore - Ignore type error if accountId is already required
        const result = await db.transaction.updateMany({
          where: {
            userId: user.id,
            accountId: null,
          },
          data: {
            accountId: generalAccount.id,
          },
        });

        console.log(`  ✓ Assigned ${result.count} transaction(s) to "General" account`);
      } else {
        console.log(`  ℹ No transactions without account`);
      }
    } catch (error) {
      // If query fails (likely because accountId is already required), skip
      console.log(`  ℹ Migration already applied (accountId is required)`);
    }

    console.log();
  }

  // Verify: Check if any transactions still have null accountId
  try {
    // @ts-ignore - Ignore type error if accountId is already required
    const orphanedTransactions = await db.transaction.count({
      where: { accountId: null },
    });

    if (orphanedTransactions === 0) {
      console.log("✅ Migration completed successfully!");
      console.log("All transactions are now linked to accounts.\n");
      console.log("Next steps:");
      console.log("1. Update schema.prisma: Change 'accountId String?' to 'accountId String'");
      console.log("2. Run: npx prisma migrate dev --name make_account_id_required");
    } else {
      console.log(`⚠️  Warning: ${orphanedTransactions} transaction(s) still have null accountId`);
      console.log("Please investigate before making accountId required.");
    }
  } catch (error) {
    console.log("✅ Migration already completed!");
    console.log("accountId is now required in the schema.");
  }
}

main()
  .catch((e) => {
    console.error("❌ Migration failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
