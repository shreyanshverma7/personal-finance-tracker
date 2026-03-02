import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { accountSchema } from "@/lib/validators";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const accounts = await db.account.findMany({
    where: { userId: session.user.id },
    include: {
      transactions: {
        select: {
          amount: true,
          type: true,
        },
      },
    },
    orderBy: { name: "asc" },
  });

  // Calculate current balance for each account
  const accountsWithBalance = accounts.map((account) => {
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
    return {
      ...accountData,
      currentBalance,
    };
  });

  return NextResponse.json(accountsWithBalance);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const validated = accountSchema.parse(body);

    // Check for duplicate account name
    const existing = await db.account.findFirst({
      where: { userId: session.user.id, name: validated.name },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Account with this name already exists" },
        { status: 400 }
      );
    }

    const account = await db.account.create({
      data: {
        ...validated,
        userId: session.user.id,
      },
    });

    return NextResponse.json(
      { ...account, currentBalance: account.initialBalance },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
