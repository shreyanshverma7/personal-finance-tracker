import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { accountSchema } from "@/lib/validators";

async function getAccount(id: string, userId: string) {
  return db.account.findFirst({
    where: { id, userId },
    include: {
      transactions: {
        select: {
          amount: true,
          type: true,
        },
      },
    },
  });
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const account = await getAccount(id, session.user.id);

  if (!account) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Calculate current balance
  const income = account.transactions
    .filter((t) => t.type === "INCOME")
    .reduce((sum, t) => sum + t.amount, 0);

  const expense = account.transactions
    .filter((t) => t.type === "EXPENSE")
    .reduce((sum, t) => sum + t.amount, 0);

  const currentBalance = account.initialBalance + income - expense;

  // Remove transactions from response, add currentBalance
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { transactions, ...accountData } = account;
  return NextResponse.json({ ...accountData, currentBalance });
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const existing = await db.account.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const body = await req.json();
    const validated = accountSchema.parse(body);

    // Check for duplicate name (excluding current account)
    const duplicate = await db.account.findFirst({
      where: {
        userId: session.user.id,
        name: validated.name,
        id: { not: id },
      },
    });

    if (duplicate) {
      return NextResponse.json(
        { error: "Account with this name already exists" },
        { status: 400 }
      );
    }

    const account = await db.account.update({
      where: { id },
      data: validated,
    });

    // Calculate current balance for response
    const transactions = await db.transaction.findMany({
      where: { accountId: id },
      select: { amount: true, type: true },
    });

    const income = transactions
      .filter((t) => t.type === "INCOME")
      .reduce((sum, t) => sum + t.amount, 0);

    const expense = transactions
      .filter((t) => t.type === "EXPENSE")
      .reduce((sum, t) => sum + t.amount, 0);

    const currentBalance = account.initialBalance + income - expense;

    return NextResponse.json({ ...account, currentBalance });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const existing = await db.account.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Check if account has any transactions
  const transactionCount = await db.transaction.count({
    where: { accountId: id },
  });

  if (transactionCount > 0) {
    return NextResponse.json(
      {
        error: `Cannot delete account with ${transactionCount} transaction(s). Please reassign or delete transactions first.`,
      },
      { status: 400 }
    );
  }

  await db.account.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
