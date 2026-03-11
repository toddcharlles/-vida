import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

// GET - listar comissões (vendedor vê as dele, admin vê todas)
export async function GET() {
  try {
    const user = await requireAuth();

    const where = user.role === "admin" ? {} : { vendorId: user.id };

    const commissions = await prisma.commission.findMany({
      where,
      include: {
        purchase: {
          select: {
            id: true,
            total: true,
            createdAt: true,
            customer: { select: { name: true } },
            store: { select: { name: true } },
          },
        },
        vendor: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const totals = await prisma.commission.aggregate({
      where,
      _sum: { amount: true },
    });

    const pendingTotal = await prisma.commission.aggregate({
      where: { ...where, status: "pendente" },
      _sum: { amount: true },
    });

    return NextResponse.json({
      commissions,
      totalCommissions: totals._sum.amount || 0,
      pendingCommissions: pendingTotal._sum.amount || 0,
    });
  } catch {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
}
