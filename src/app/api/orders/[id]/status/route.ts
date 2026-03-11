import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getSession();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    const { id } = await params;
    const { status } = await request.json();
    const validStatuses = ["pendente", "aprovado", "separado", "entregue", "cancelado"];

    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Status inválido" }, { status: 400 });
    }

    // If marking as "entregue", deduct from stock
    if (status === "entregue") {
      const order = await prisma.order.findUnique({
        where: { id },
        include: { items: { include: { product: { include: { stock: true } } } } },
      });

      if (order && order.status !== "entregue") {
        for (const item of order.items) {
          if (item.product.stock) {
            await prisma.$transaction([
              prisma.stock.update({
                where: { id: item.product.stock.id },
                data: { quantity: { decrement: item.quantity } },
              }),
              prisma.stockMovement.create({
                data: {
                  stockId: item.product.stock.id,
                  type: "venda",
                  quantity: item.quantity,
                  notes: `Pedido #${id.slice(-6)}`,
                },
              }),
            ]);
          }
        }
      }
    }

    const order = await prisma.order.update({
      where: { id },
      data: { status },
      include: { items: { include: { product: true } }, user: { select: { name: true } } },
    });

    return NextResponse.json(order);
  } catch {
    return NextResponse.json({ error: "Erro ao atualizar status" }, { status: 500 });
  }
}
