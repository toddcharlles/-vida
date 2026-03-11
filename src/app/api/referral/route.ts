import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireCustomer } from "@/lib/auth";

// GET - dados de indicação do cliente
export async function GET() {
  try {
    const customer = await requireCustomer();

    const customerData = await prisma.customer.findUnique({
      where: { id: customer.id },
      select: {
        referralCode: true,
        referrals: {
          select: { id: true, name: true, createdAt: true },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    const tokensFromReferrals = await prisma.tokenTransaction.aggregate({
      where: { customerId: customer.id, type: "indicacao" },
      _sum: { amount: true },
    });

    return NextResponse.json({
      referralCode: customerData?.referralCode,
      referrals: customerData?.referrals || [],
      totalTokensFromReferrals: tokensFromReferrals._sum.amount || 0,
    });
  } catch {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
}
