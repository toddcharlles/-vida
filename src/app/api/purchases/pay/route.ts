import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireCustomer } from "@/lib/auth";
import { createPaymentPreference } from "@/lib/mercadopago";

// POST - gerar link de pagamento para uma compra
export async function POST(request: NextRequest) {
  try {
    const customer = await requireCustomer();
    const { purchaseId } = await request.json();

    const purchase = await prisma.purchase.findUnique({
      where: { id: purchaseId, customerId: customer.id },
      include: { items: { include: { product: true } } },
    });

    if (!purchase) {
      return NextResponse.json({ error: "Compra não encontrada" }, { status: 404 });
    }

    if (purchase.status !== "pendente") {
      return NextResponse.json({ error: "Compra já foi processada" }, { status: 400 });
    }

    const customerData = await prisma.customer.findUnique({ where: { id: customer.id } });

    const preference = await createPaymentPreference(
      purchase.items.map((item) => ({
        title: item.product.name,
        quantity: item.quantity,
        unit_price: item.price,
      })),
      purchase.id,
      customerData?.email || customer.email
    );

    await prisma.purchase.update({
      where: { id: purchaseId },
      data: { paymentId: preference.id },
    });

    return NextResponse.json({
      paymentUrl: preference.init_point,
      sandboxUrl: preference.sandbox_init_point,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    // If Mercado Pago is not configured, return helpful message
    if (message.includes("MERCADOPAGO_ACCESS_TOKEN")) {
      return NextResponse.json({
        error: "Mercado Pago não configurado. Configure MERCADOPAGO_ACCESS_TOKEN no .env",
        hint: "Para testes, use o sandbox do Mercado Pago",
      }, { status: 503 });
    }
    return NextResponse.json({ error: "Erro: " + message }, { status: 500 });
  }
}
