import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireCustomer } from "@/lib/auth";

// GET - histórico de tokens do cliente
export async function GET() {
  try {
    const customer = await requireCustomer();

    const customerData = await prisma.customer.findUnique({
      where: { id: customer.id },
      select: { tokens: true },
    });

    const transactions = await prisma.tokenTransaction.findMany({
      where: { customerId: customer.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json({
      balance: customerData?.tokens || 0,
      transactions,
    });
  } catch {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
}
