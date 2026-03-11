"use client";

import { useEffect, useState, useCallback } from "react";
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
  const [filterStatus, setFilterStatus] = useState("todos");
  const [search, setSearch] = useState("");

  const load = useCallback(() => {
    fetch("/api/commissions")
      .then((r) => r.json())
      .then((d) => {
        setCommissions(d.commissions || []);
        setTotal(d.totalCommissions || 0);
        setPending(d.pendingCommissions || 0);
        setLoading(false);
      });
  }, []);

  useEffect(() => { load(); }, [load]);

  async function updateStatus(id: string, status: string) {
    await fetch(`/api/commissions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    load();
  }

  async function markAllAsPaid() {
    if (!confirm("Marcar todas as comissoes liberadas como pagas?")) return;
    const liberadas = commissions.filter((c) => c.status === "liberada");
    for (const c of liberadas) {
      await fetch(`/api/commissions/${c.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "paga" }),
      });
    }
    load();
  }

  const filtered = commissions.filter((c) => {
    if (filterStatus !== "todos" && c.status !== filterStatus) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        c.vendor.name.toLowerCase().includes(q) ||
        c.purchase.customer.name.toLowerCase().includes(q) ||
        c.purchase.store.name.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const paidTotal = commissions.filter((c) => c.status === "paga").reduce((s, c) => s + c.amount, 0);

  if (loading) return <div className="text-center py-12 text-gray-500">Carregando...</div>;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Comissoes</h1>
        {commissions.some((c) => c.status === "liberada") && (
          <button
            onClick={markAllAsPaid}
            className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"
          >
            Pagar Todas Liberadas
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border p-4 sm:p-6">
          <p className="text-sm text-gray-500">Total Comissoes</p>
          <p className="text-2xl font-bold text-emerald-600">{formatCurrency(total)}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-4 sm:p-6">
          <p className="text-sm text-gray-500">Pendente/Liberada</p>
          <p className="text-2xl font-bold text-yellow-600">{formatCurrency(pending)}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-4 sm:p-6">
          <p className="text-sm text-gray-500">Ja Pagas</p>
          <p className="text-2xl font-bold text-green-600">{formatCurrency(paidTotal)}</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar vendedor, cliente ou loja..."
          className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-violet-500 outline-none"
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-violet-500 outline-none"
        >
          <option value="todos">Todos</option>
          <option value="pendente">Pendente</option>
          <option value="liberada">Liberada</option>
          <option value="paga">Paga</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <p className="text-center py-12 text-gray-500">Nenhuma comissao encontrada</p>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Data</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Vendedor</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Cliente</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Loja</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Venda</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Comissao</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Acao</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50">
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
                  <td className="px-4 py-3 text-right">
                    {c.status === "pendente" && (
                      <button
                        onClick={() => updateStatus(c.id, "liberada")}
                        className="text-blue-600 hover:text-blue-800 text-xs font-medium mr-2"
                      >
                        Liberar
                      </button>
                    )}
                    {c.status === "liberada" && (
                      <button
                        onClick={() => updateStatus(c.id, "paga")}
                        className="text-green-600 hover:text-green-800 text-xs font-medium"
                      >
                        Marcar Paga
                      </button>
                    )}
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
