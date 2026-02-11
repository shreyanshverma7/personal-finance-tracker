import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const now = new Date();
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  // All-time totals
  const allTransactions = await db.transaction.findMany({
    where: { userId },
    select: { amount: true, type: true },
  });

  const totalIncome = allTransactions
    .filter((t) => t.type === "INCOME")
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = allTransactions
    .filter((t) => t.type === "EXPENSE")
    .reduce((sum, t) => sum + t.amount, 0);
  const totalBalance = totalIncome - totalExpenses;

  // Current month
  const monthTransactions = await db.transaction.findMany({
    where: {
      userId,
      date: { gte: currentMonthStart, lte: currentMonthEnd },
    },
    select: { amount: true, type: true },
  });

  const monthIncome = monthTransactions
    .filter((t) => t.type === "INCOME")
    .reduce((sum, t) => sum + t.amount, 0);
  const monthExpenses = monthTransactions
    .filter((t) => t.type === "EXPENSE")
    .reduce((sum, t) => sum + t.amount, 0);

  // Category breakdown (current month expenses)
  const categoryExpenses = await db.transaction.findMany({
    where: {
      userId,
      type: "EXPENSE",
      date: { gte: currentMonthStart, lte: currentMonthEnd },
    },
    include: { category: true },
  });

  const categoryMap = new Map<string, { name: string; value: number; color: string }>();
  for (const t of categoryExpenses) {
    const existing = categoryMap.get(t.categoryId);
    if (existing) {
      existing.value += t.amount;
    } else {
      categoryMap.set(t.categoryId, {
        name: t.category.name,
        value: t.amount,
        color: t.category.color,
      });
    }
  }
  const categoryBreakdown = Array.from(categoryMap.values());

  // Monthly trend (last 6 months)
  const monthlyTrend = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthStart = new Date(d.getFullYear(), d.getMonth(), 1);
    const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);

    const transactions = await db.transaction.findMany({
      where: {
        userId,
        date: { gte: monthStart, lte: monthEnd },
      },
      select: { amount: true, type: true },
    });

    const income = transactions
      .filter((t) => t.type === "INCOME")
      .reduce((sum, t) => sum + t.amount, 0);
    const expenses = transactions
      .filter((t) => t.type === "EXPENSE")
      .reduce((sum, t) => sum + t.amount, 0);

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    monthlyTrend.push({
      month: monthNames[d.getMonth()],
      income,
      expenses,
    });
  }

  // Recent transactions
  const recentTransactions = await db.transaction.findMany({
    where: { userId },
    include: { category: true },
    orderBy: { date: "desc" },
    take: 5,
  });

  return NextResponse.json({
    totalBalance,
    monthIncome,
    monthExpenses,
    monthNet: monthIncome - monthExpenses,
    categoryBreakdown,
    monthlyTrend,
    recentTransactions,
  });
}
