// Mercado Pago Integration
// Configure MERCADOPAGO_ACCESS_TOKEN no .env

const MP_BASE_URL = "https://api.mercadopago.com";

function getAccessToken(): string {
  const token = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!token) throw new Error("MERCADOPAGO_ACCESS_TOKEN não configurado");
  return token;
}

export interface MPPreferenceItem {
  title: string;
  quantity: number;
  unit_price: number;
  currency_id?: string;
}

export interface MPPreference {
  id: string;
  init_point: string; // URL para pagamento
  sandbox_init_point: string;
}

// Criar preferência de pagamento (checkout)
export async function createPaymentPreference(
  items: MPPreferenceItem[],
  purchaseId: string,
  payerEmail: string
): Promise<MPPreference> {
  const res = await fetch(`${MP_BASE_URL}/checkout/preferences`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getAccessToken()}`,
    },
    body: JSON.stringify({
      items: items.map((i) => ({ ...i, currency_id: "BRL" })),
      payer: { email: payerEmail },
      external_reference: purchaseId,
      back_urls: {
        success: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/cliente/pedidos?status=success`,
        failure: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/cliente/pedidos?status=failure`,
        pending: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/cliente/pedidos?status=pending`,
      },
      auto_return: "approved",
      notification_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/mercadopago/webhook`,
    }),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Mercado Pago error: ${error}`);
  }

  return res.json();
}

// Consultar pagamento
export async function getPayment(paymentId: string) {
  const res = await fetch(`${MP_BASE_URL}/v1/payments/${paymentId}`, {
    headers: { Authorization: `Bearer ${getAccessToken()}` },
  });

  if (!res.ok) throw new Error("Erro ao consultar pagamento");
  return res.json();
}
