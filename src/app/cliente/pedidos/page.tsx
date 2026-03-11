"use client";

import { useEffect, useState } from "react";
import { formatCurrency, formatDate } from "@/lib/utils";

interface Purchase {
  id: string;
  status: string;
  total: number;
  tokensEarned: number;
  tokensUsed: number;
  paymentStatus: string | null;
  createdAt: string;
  store: { name: string; address: string };
  items: { quantity: number; price: number; product: { name: string } }[];
}

const PURCHASE_STATUS: Record<string, { label: string; color: string }> = {
  pendente: { label: "Pendente Pagamento", color: "bg-yellow-100 text-yellow-800" },
  pago: { label: "Pago", color: "bg-blue-100 text-blue-800" },
  separado: { label: "Separado", color: "bg-purple-100 text-purple-800" },
  retirado: { label: "Retirado", color: "bg-green-100 text-green-800" },
  cancelado: { label: "Cancelado", color: "bg-red-100 text-red-800" },
};

export default function PedidosPage() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/purchases")
      .then((r) => r.json())
      .then((d) => {
        setPurchases(d.purchases || []);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="text-center py-12 text-gray-500">Carregando...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">📦 Meus Pedidos</h1>

      {purchases.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-3">📦</div>
          <p className="text-gray-500">Nenhum pedido ainda</p>
          <a
            href="/cliente/comprar"
            className="mt-3 inline-block px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm"
          >
            Fazer primeira compra
          </a>
        </div>
      ) : (
        <div className="space-y-4">
          {purchases.map((purchase) => {
            const status = PURCHASE_STATUS[purchase.status] || {
              label: purchase.status,
              color: "bg-gray-100 text-gray-800",
            };
            return (
              <div
                key={purchase.id}
                className="bg-white rounded-xl shadow-sm border p-6"
              >
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-3">
                  <div>
                    <p className="text-sm text-gray-500">
                      Pedido #{purchase.id.slice(-6)}
                    </p>
                    <p className="text-xs text-gray-400">
                      {formatDate(purchase.createdAt)}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${status.color}`}
                  >
                    {status.label}
                  </span>
                </div>

                <div className="mb-3">
                  <p className="text-sm text-gray-600">
                    📍 {purchase.store.name} - {purchase.store.address}
                  </p>
                </div>

                <div className="border-t pt-3 space-y-1">
                  {purchase.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between text-sm"
                    >
                      <span className="text-gray-600">
                        {item.quantity}x {item.product.name}
                      </span>
                      <span className="text-gray-800">
                        {formatCurrency(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-t mt-3 pt-3 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                  <div className="text-sm">
                    {purchase.tokensUsed > 0 && (
                      <span className="text-yellow-600 mr-3">
                        -{purchase.tokensUsed} tokens usados
                      </span>
                    )}
                    {purchase.tokensEarned > 0 && (
                      <span className="text-emerald-600">
                        +{purchase.tokensEarned} tokens
                        {purchase.status !== "retirado" && " (ao retirar)"}
                      </span>
                    )}
                  </div>
                  <span className="font-bold text-lg">
                    {formatCurrency(purchase.total)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
