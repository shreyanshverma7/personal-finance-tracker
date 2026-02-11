import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { transactionSchema } from "@/lib/validators";
import { Prisma } from "@prisma/client";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const searchParams = req.nextUrl.searchParams;
  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = parseInt(searchParams.get("pageSize") || "10");
  const type = searchParams.get("type");
  const categoryId = searchParams.get("categoryId");
  const search = searchParams.get("search");
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");
  const sortBy = searchParams.get("sortBy") || "date";
  const sortOrder = searchParams.get("sortOrder") || "desc";

  const where: Prisma.TransactionWhereInput = {
    userId: session.user.id,
  };

  if (type) where.type = type;
  if (categoryId) where.categoryId = categoryId;
  if (search) {
    where.description = { contains: search };
  }
  if (startDate || endDate) {
    where.date = {};
    if (startDate) (where.date as Prisma.DateTimeFilter).gte = new Date(startDate);
    if (endDate) (where.date as Prisma.DateTimeFilter).lte = new Date(endDate);
  }

  const [data, total] = await Promise.all([
    db.transaction.findMany({
      where,
      include: { category: true },
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    db.transaction.count({ where }),
  ]);

  return NextResponse.json({
    data,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const validated = transactionSchema.parse(body);

    const category = await db.category.findFirst({
      where: { id: validated.categoryId, userId: session.user.id },
    });

    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 400 });
    }

    const transaction = await db.transaction.create({
      data: {
        ...validated,
        userId: session.user.id,
      },
      include: { category: true },
    });

    return NextResponse.json(transaction, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
