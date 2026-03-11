"use client";

import { useEffect, useState } from "react";

interface StockItem {
  id: string;
  quantity: number;
  minStock: number;
  product: { name: string; category: { name: string } };
}

export default function StockPage() {
  const [stock, setStock] = useState<StockItem[]>([]);
  const [movForm, setMovForm] = useState<{ stockId: string; type: string; quantity: string; notes: string } | null>(null);

  useEffect(() => { loadStock(); }, []);

  async function loadStock() {
    const data = await fetch("/api/stock").then((r) => r.json());
    setStock(Array.isArray(data) ? data : []);
  }

  async function handleMovement(e: React.FormEvent) {
    e.preventDefault();
    if (!movForm) return;
    await fetch(`/api/stock/${movForm.stockId}/movement`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: movForm.type, quantity: movForm.quantity, notes: movForm.notes }),
    });
    setMovForm(null);
    loadStock();
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Estoque de Produtos</h1>

      {movForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h2 className="font-semibold text-gray-800 mb-4">Registrar Movimentação</h2>
          <form onSubmit={handleMovement} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
              <select
                value={movForm.type}
                onChange={(e) => setMovForm({ ...movForm, type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-violet-500 outline-none"
              >
                <option value="producao">Produção (entrada)</option>
                <option value="venda">Venda (saída)</option>
                <option value="ajuste">Ajuste (entrada)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantidade</label>
              <input
                type="number"
                value={movForm.quantity}
                onChange={(e) => setMovForm({ ...movForm, quantity: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-violet-500 outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Observação</label>
              <input
                value={movForm.notes}
                onChange={(e) => setMovForm({ ...movForm, notes: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-violet-500 outline-none"
              />
            </div>
            <div className="md:col-span-3 flex gap-2">
              <button type="submit" className="bg-violet-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-violet-700 transition">
                Registrar
              </button>
              <button type="button" onClick={() => setMovForm(null)} className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition">
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Produto</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Categoria</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Quantidade</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Mín.</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {stock.map((s) => {
              const low = s.quantity <= s.minStock;
              return (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{s.product.name}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-violet-50 text-violet-700">
                      {s.product.category.name}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm font-bold text-gray-700">{s.quantity}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{s.minStock}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      low ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"
                    }`}>
                      {low ? "Baixo" : "OK"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => setMovForm({ stockId: s.id, type: "producao", quantity: "", notes: "" })}
                      className="text-violet-600 hover:text-violet-800 text-sm font-medium"
                    >
                      Movimentar
                    </button>
                  </td>
                </tr>
              );
            })}
            {stock.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500 text-sm">
                  Nenhum produto no estoque. Cadastre produtos primeiro.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
