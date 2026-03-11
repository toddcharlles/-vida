"use client";

import { useEffect, useState } from "react";
import { formatCurrency, formatDate } from "@/lib/utils";

interface Commission {
  id: string;
  amount: number;
  status: string;
  createdAt: string;
  vendor: { name: string };
  purchase: {
    id: string;
    total: number;
    createdAt: string;
    customer: { name: string };
    store: { name: string };
  };
}

const STATUS_COLORS: Record<string, string> = {
  pendente: "bg-yellow-100 text-yellow-800",
  liberada: "bg-blue-100 text-blue-800",
  paga: "bg-green-100 text-green-800",
};

export default function ComissoesPage() {
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [total, setTotal] = useState(0);
  const [pending, setPending] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/commissions")
      .then((r) => r.json())
      .then((d) => {
        setCommissions(d.commissions || []);
        setTotal(d.totalCommissions || 0);
        setPending(d.pendingCommissions || 0);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="text-center py-12 text-gray-500">Carregando...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">💰 Comissões</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <p className="text-sm text-gray-500">Total Comissões</p>
          <p className="text-2xl font-bold text-emerald-600">{formatCurrency(total)}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <p className="text-sm text-gray-500">Pendente Liberação</p>
          <p className="text-2xl font-bold text-yellow-600">{formatCurrency(pending)}</p>
        </div>
      </div>

      {commissions.length === 0 ? (
        <p className="text-center py-12 text-gray-500">Nenhuma comissão registrada</p>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Data</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Vendedor</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Cliente</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Loja</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Valor Compra</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Comissão</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {commissions.map((c) => (
                <tr key={c.id}>
                  <td className="px-4 py-3 text-gray-600">{formatDate(c.createdAt)}</td>
                  <td className="px-4 py-3 font-medium">{c.vendor.name}</td>
                  <td className="px-4 py-3 text-gray-600">{c.purchase.customer.name}</td>
                  <td className="px-4 py-3 text-gray-600">{c.purchase.store.name}</td>
                  <td className="px-4 py-3">{formatCurrency(c.purchase.total)}</td>
                  <td className="px-4 py-3 font-bold text-emerald-600">{formatCurrency(c.amount)}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[c.status] || ""}`}>
                      {c.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
