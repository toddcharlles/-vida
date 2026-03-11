import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

// GET - listar compras na loja do vendedor
export async function GET() {
  try {
    const user = await requireAuth();

    const store = await prisma.store.findUnique({ where: { vendorId: user.id } });
    if (!store) {
      return NextResponse.json({ error: "Loja nao encontrada" }, { status: 404 });
    }

    const purchases = await prisma.purchase.findMany({
      where: { storeId: store.id },
      include: {
        customer: { select: { name: true, email: true, phone: true } },
        items: { include: { product: { select: { name: true } } } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ purchases, store });
  } catch {
    return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
  }
}
