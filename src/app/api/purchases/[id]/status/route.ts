import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

// PATCH - atualizar status da compra (vendedor da loja ou admin)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    const { status } = await request.json();

    const purchase = await prisma.purchase.findUnique({
      where: { id },
      include: { store: true },
    });

    if (!purchase) {
      return NextResponse.json({ error: "Compra não encontrada" }, { status: 404 });
    }

    // Only admin or the store vendor can update
    if (user.role !== "admin" && purchase.store.vendorId !== user.id) {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 });
    }

    const updated = await prisma.purchase.update({
      where: { id },
      data: { status },
    });

    // When customer picks up (retirado), release commission and award tokens
    if (status === "retirado" && purchase.status !== "retirado") {
      // Award tokens to customer
      await prisma.customer.update({
        where: { id: purchase.customerId },
        data: { tokens: { increment: purchase.tokensEarned } },
      });
      await prisma.tokenTransaction.create({
        data: {
          customerId: purchase.customerId,
          type: "compra",
          amount: purchase.tokensEarned,
          description: `Tokens por compra #${id.slice(-6)}`,
          purchaseId: id,
        },
      });

      // Create commission for vendor
      await prisma.commission.create({
        data: {
          purchaseId: id,
          vendorId: purchase.store.vendorId,
          amount: purchase.commissionValue,
          status: "liberada",
        },
      });
    }

    return NextResponse.json({ purchase: updated });
  } catch (error) {
    return NextResponse.json({ error: "Erro: " + error }, { status: 500 });
  }
}
