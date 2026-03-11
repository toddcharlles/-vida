import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireCustomer } from "@/lib/auth";

const TOKENS_PER_REAL = 1; // 1 token por R$1 gasto

// GET - listar compras do cliente
export async function GET() {
  try {
    const customer = await requireCustomer();

    const purchases = await prisma.purchase.findMany({
      where: { customerId: customer.id },
      include: {
        store: { select: { name: true, address: true } },
        items: { include: { product: { select: { name: true } } } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ purchases });
  } catch {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
}

// POST - criar compra
export async function POST(request: NextRequest) {
  try {
    const customer = await requireCustomer();
    const { storeId, items, useTokens } = await request.json();

    if (!storeId || !items || items.length === 0) {
      return NextResponse.json({ error: "Loja e itens são obrigatórios" }, { status: 400 });
    }

    // Verify store exists
    const store = await prisma.store.findUnique({ where: { id: storeId } });
    if (!store || !store.active) {
      return NextResponse.json({ error: "Loja não encontrada" }, { status: 404 });
    }

    // Calculate total
    let total = 0;
    const purchaseItems: { productId: string; quantity: number; price: number }[] = [];

    for (const item of items) {
      const product = await prisma.product.findUnique({ where: { id: item.productId } });
      if (!product || !product.active) continue;

      purchaseItems.push({
        productId: product.id,
        quantity: item.quantity,
        price: product.price,
      });
      total += product.price * item.quantity;
    }

    // Apply token discount if requested
    let tokensUsed = 0;
    if (useTokens && useTokens > 0) {
      const customerData = await prisma.customer.findUnique({ where: { id: customer.id } });
      const available = customerData?.tokens || 0;
      // Each token = R$0.50 of discount, max 30% of total
      const maxDiscount = total * 0.3;
      const maxTokens = Math.min(available, Math.floor(maxDiscount / 0.5));
      tokensUsed = Math.min(useTokens, maxTokens);
      total -= tokensUsed * 0.5;
    }

    const tokensEarned = Math.floor(total * TOKENS_PER_REAL);
    const commissionValue = total * 0.15; // 15% comissão

    const purchase = await prisma.purchase.create({
      data: {
        customerId: customer.id,
        storeId,
        total,
        tokensEarned,
        tokensUsed,
        commissionRate: 0.15,
        commissionValue,
        items: { create: purchaseItems },
      },
      include: {
        items: { include: { product: { select: { name: true } } } },
        store: { select: { name: true } },
      },
    });

    // Deduct used tokens
    if (tokensUsed > 0) {
      await prisma.customer.update({
        where: { id: customer.id },
        data: { tokens: { decrement: tokensUsed } },
      });
      await prisma.tokenTransaction.create({
        data: {
          customerId: customer.id,
          type: "resgate",
          amount: -tokensUsed,
          description: `Resgate de ${tokensUsed} tokens na compra #${purchase.id.slice(-6)}`,
          purchaseId: purchase.id,
        },
      });
    }

    return NextResponse.json({
      purchase,
      message: `Compra criada! Agora finalize o pagamento.`,
      tokensEarned,
      tokensUsed,
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Erro: " + error }, { status: 500 });
  }
}
