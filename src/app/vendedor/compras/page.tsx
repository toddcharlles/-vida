"use client";

import { useEffect, useState, useCallback } from "react";
import { formatCurrency, formatDate } from "@/lib/utils";

interface PurchaseItem {
  quantity: number;
  price: number;
  product: { name: string };
}

interface Purchase {
  id: string;
  status: string;
  total: number;
  tokensEarned: number;
  tokensUsed: number;
  commissionValue: number;
  createdAt: string;
  customer: { name: string; email: string; phone: string | null };
  items: PurchaseItem[];
}

const STATUS: Record<string, { label: string; color: string }> = {
  pendente: { label: "Pendente", color: "bg-yellow-100 text-yellow-800" },
  pago: { label: "Pago", color: "bg-blue-100 text-blue-800" },
  separado: { label: "Separado", color: "bg-purple-100 text-purple-800" },
  retirado: { label: "Retirado", color: "bg-green-100 text-green-800" },
  cancelado: { label: "Cancelado", color: "bg-red-100 text-red-800" },
};

export default function VendedorComprasPage() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasStore, setHasStore] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState("todos");
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    const res = await fetch("/api/vendor/purchases");
    if (res.status === 404) {
      setHasStore(false);
      setLoading(false);
      return;
    }
    const data = await res.json();
    setPurchases(data.purchases || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function updateStatus(id: string, status: string) {
    await fetch(`/api/purchases/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    load();
  }

  const filtered = purchases.filter((p) => {
    if (filterStatus !== "todos" && p.status !== filterStatus) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        p.customer.name.toLowerCase().includes(q) ||
        p.id.slice(-6).includes(q)
      );
    }
    return true;
  });

  if (loading) return <div className="text-center py-12 text-gray-500">Carregando...</div>;

  if (!hasStore) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">Cadastre sua loja para ver compras.</p>
        <a href="/vendedor/loja" className="px-6 py-2.5 bg-violet-600 text-white rounded-lg font-medium">
          Cadastrar Loja
        </a>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Compras na Minha Loja</h1>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por cliente ou codigo..."
          className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-violet-500 outline-none"
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-violet-500 outline-none"
        >
          <option value="todos">Todos os status</option>
          {Object.entries(STATUS).map(([key, val]) => (
            <option key={key} value={key}>{val.label}</option>
          ))}
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <div className="bg-white rounded-xl border p-4">
          <p className="text-xs text-gray-500">Total Compras</p>
          <p className="text-xl font-bold text-gray-800">{purchases.length}</p>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <p className="text-xs text-gray-500">Aguardando</p>
          <p className="text-xl font-bold text-yellow-600">
            {purchases.filter((p) => p.status === "pago").length}
          </p>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <p className="text-xs text-gray-500">Faturamento</p>
          <p className="text-xl font-bold text-emerald-600">
            {formatCurrency(purchases.filter((p) => p.status === "retirado").reduce((s, p) => s + p.total, 0))}
          </p>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <p className="text-xs text-gray-500">Comissoes</p>
          <p className="text-xl font-bold text-violet-600">
            {formatCurrency(purchases.filter((p) => p.status === "retirado").reduce((s, p) => s + p.commissionValue, 0))}
          </p>
        </div>
      </div>

      {/* Lista */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border p-8 text-center text-gray-500">
          Nenhuma compra encontrada
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((p) => {
            const st = STATUS[p.status] || { label: p.status, color: "bg-gray-100 text-gray-800" };
            const expanded = expandedId === p.id;

            return (
              <div key={p.id} className="bg-white rounded-xl border overflow-hidden">
                <div
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-2 cursor-pointer hover:bg-gray-50"
                  onClick={() => setExpandedId(expanded ? null : p.id)}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="shrink-0">
                      <span className="text-sm font-bold text-gray-800">#{p.id.slice(-6)}</span>
                      <p className="text-xs text-gray-500">{formatDate(p.createdAt)}</p>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-700 truncate">{p.customer.name}</p>
                      <p className="text-xs text-gray-500">{p.items.length} item(ns)</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-sm font-bold">{formatCurrency(p.total)}</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${st.color}`}>{st.label}</span>
                  </div>
                </div>

                {expanded && (
                  <div className="border-t p-4 bg-gray-50">
                    <div className="text-sm text-gray-600 mb-3">
                      <p>Cliente: <strong>{p.customer.name}</strong></p>
                      <p>Email: {p.customer.email}</p>
                      {p.customer.phone && <p>Tel: {p.customer.phone}</p>}
                    </div>

                    <div className="overflow-x-auto mb-3">
                      <table className="w-full text-sm min-w-[300px]">
                        <thead>
                          <tr className="text-xs text-gray-500">
                            <th className="text-left pb-2">Produto</th>
                            <th className="text-left pb-2">Qtd</th>
                            <th className="text-left pb-2">Preco</th>
                            <th className="text-left pb-2">Subtotal</th>
                          </tr>
                        </thead>
                        <tbody>
                          {p.items.map((item, i) => (
                            <tr key={i} className="border-t border-gray-200">
                              <td className="py-2 font-medium">{item.product.name}</td>
                              <td className="py-2">{item.quantity}</td>
                              <td className="py-2">{formatCurrency(item.price)}</td>
                              <td className="py-2">{formatCurrency(item.price * item.quantity)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {p.status === "pago" && (
                        <button
                          onClick={() => updateStatus(p.id, "separado")}
                          className="bg-purple-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-purple-700"
                        >
                          Marcar como Separado
                        </button>
                      )}
                      {p.status === "separado" && (
                        <button
                          onClick={() => updateStatus(p.id, "retirado")}
                          className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-green-700"
                        >
                          Marcar como Retirado
                        </button>
                      )}
                      {(p.status === "pendente" || p.status === "pago") && (
                        <button
                          onClick={() => { if (confirm("Cancelar esta compra?")) updateStatus(p.id, "cancelado"); }}
                          className="bg-red-100 text-red-700 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-red-200"
                        >
                          Cancelar
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
