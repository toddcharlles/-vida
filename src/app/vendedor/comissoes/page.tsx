"use client";

import { useEffect, useState } from "react";
import { formatCurrency, formatDate } from "@/lib/utils";

interface Commission {
  id: string;
  amount: number;
  status: string;
  createdAt: string;
  purchase: {
    id: string;
    total: number;
    customer: { name: string };
    store: { name: string };
  };
}

export default function VendedorComissoesPage() {
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/commissions")
      .then((r) => r.json())
      .then((d) => {
        setCommissions(d.commissions || []);
        setTotal(d.totalCommissions || 0);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="text-center py-12 text-gray-500">Carregando...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">💰 Minhas Comissões</h1>

      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl p-6 text-white mb-8">
        <p className="text-sm opacity-90">Total de comissões</p>
        <p className="text-3xl font-bold">{formatCurrency(total)}</p>
        <p className="text-sm mt-1 opacity-80">15% de cada venda na sua loja</p>
      </div>

      {commissions.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Nenhuma comissão ainda</p>
          <p className="text-sm text-gray-400 mt-1">
            Suas comissões aparecem quando clientes retiram pedidos na sua loja
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border divide-y">
          {commissions.map((c) => (
            <div key={c.id} className="p-4 flex justify-between items-center">
              <div>
                <p className="font-medium text-gray-800">
                  {c.purchase.customer.name}
                </p>
                <p className="text-xs text-gray-500">
                  {c.purchase.store.name} - {formatDate(c.createdAt)}
                </p>
                <p className="text-xs text-gray-400">
                  Venda: {formatCurrency(c.purchase.total)}
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold text-emerald-600">
                  {formatCurrency(c.amount)}
                </p>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    c.status === "liberada"
                      ? "bg-blue-100 text-blue-800"
                      : c.status === "paga"
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {c.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
