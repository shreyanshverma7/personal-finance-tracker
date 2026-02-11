import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { registerSchema } from "@/lib/validators";

const DEFAULT_CATEGORIES = [
  { name: "Salary", type: "INCOME", color: "#22c55e" },
  { name: "Freelance", type: "INCOME", color: "#3b82f6" },
  { name: "Investment", type: "INCOME", color: "#a855f7" },
  { name: "Other Income", type: "INCOME", color: "#64748b" },
  { name: "Food & Dining", type: "EXPENSE", color: "#ef4444" },
  { name: "Transportation", type: "EXPENSE", color: "#f97316" },
  { name: "Bills & Utilities", type: "EXPENSE", color: "#eab308" },
  { name: "Shopping", type: "EXPENSE", color: "#ec4899" },
  { name: "Entertainment", type: "EXPENSE", color: "#8b5cf6" },
  { name: "Healthcare", type: "EXPENSE", color: "#06b6d4" },
  { name: "Rent", type: "EXPENSE", color: "#0ea5e9" },
  { name: "Groceries", type: "EXPENSE", color: "#84cc16" },
  { name: "Credit Card & Loan", type: "EXPENSE", color: "#f43f5e" },
  { name: "Other Expense", type: "EXPENSE", color: "#64748b" },
];

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validated = registerSchema.parse(body);

    const existingUser = await db.user.findUnique({
      where: { email: validated.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(validated.password, 10);

    const user = await db.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email: validated.email,
          name: validated.name,
          passwordHash,
        },
      });

      await tx.category.createMany({
        data: DEFAULT_CATEGORIES.map((cat) => ({
          ...cat,
          userId: newUser.id,
          isDefault: true,
        })),
      });

      return newUser;
    });

    return NextResponse.json(
      { user: { id: user.id, email: user.email, name: user.name } },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
