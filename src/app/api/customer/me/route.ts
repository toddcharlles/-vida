import { NextResponse } from "next/server";
import { getCustomerSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const session = await getCustomerSession();
    if (!session) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const customer = await prisma.customer.findUnique({
      where: { id: session.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        tokens: true,
        referralCode: true,
        createdAt: true,
        _count: { select: { referrals: true, purchases: true } },
      },
    });

    if (!customer) {
      return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 });
    }

    return NextResponse.json({ customer });
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
