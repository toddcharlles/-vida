import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getPayment } from "@/lib/mercadopago";

// Webhook do Mercado Pago para receber notificações de pagamento
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Mercado Pago envia type=payment quando um pagamento é atualizado
    if (body.type === "payment" && body.data?.id) {
      const payment = await getPayment(String(body.data.id));
      const purchaseId = payment.external_reference;

      if (!purchaseId) return NextResponse.json({ ok: true });

      const purchase = await prisma.purchase.findUnique({ where: { id: purchaseId } });
      if (!purchase) return NextResponse.json({ ok: true });

      let newStatus = purchase.status;
      if (payment.status === "approved") {
        newStatus = "pago";
      } else if (payment.status === "rejected" || payment.status === "cancelled") {
        newStatus = "cancelado";
      }

      await prisma.purchase.update({
        where: { id: purchaseId },
        data: {
          paymentId: String(body.data.id),
          paymentStatus: payment.status,
          status: newStatus,
        },
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Webhook MP error:", error);
    return NextResponse.json({ ok: true }); // Always return 200 to MP
  }
}
