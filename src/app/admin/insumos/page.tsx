"use client";

import { useEffect, useState } from "react";
import { formatCurrency } from "@/lib/utils";

interface Supply {
  id: string;
  name: string;
  unit: string;
  quantity: number;
  minStock: number;
  costPerUnit: number;
  totalCost: number;
}

export default function SuppliesPage() {
  const [supplies, setSupplies] = useState<Supply[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", unit: "kg", quantity: "0", minStock: "0", costPerUnit: "0", totalCost: "0" });
  const [movForm, setMovForm] = useState<{ supplyId: string; type: string; quantity: string; notes: string } | null>(null);

  useEffect(() => { loadSupplies(); }, []);

  async function loadSupplies() {
    const data = await fetch("/api/supplies").then((r) => r.json());
    setSupplies(Array.isArray(data) ? data : []);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/supplies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setShowForm(false);
    setForm({ name: "", unit: "kg", quantity: "0", minStock: "0", costPerUnit: "0", totalCost: "0" });
    loadSupplies();
  }

  async function handleMovement(e: React.FormEvent) {
    e.preventDefault();
    if (!movForm) return;
    await fetch(`/api/supplies/${movForm.supplyId}/movement`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: movForm.type, quantity: movForm.quantity, notes: movForm.notes }),
    });
    setMovForm(null);
    loadSupplies();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Insumos</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-violet-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-violet-700 transition"
        >
          + Novo Insumo
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h2 className="font-semibold text-gray-800 mb-4">Novo Insumo</h2>
          <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-violet-500 outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Unidade</label>
              <select
                value={form.unit}
                onChange={(e) => setForm({ ...form, unit: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-violet-500 outline-none"
              >
                <option value="kg">Quilogramas (kg)</option>
                <option value="litros">Litros</option>
                <option value="unidades">Unidades</option>
                <option value="gramas">Gramas</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Qtd. Inicial</label>
              <input
                type="number"
                step="0.01"
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-violet-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estoque Mínimo</label>
              <input
                type="number"
                step="0.01"
                value={form.minStock}
                onChange={(e) => setForm({ ...form, minStock: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-violet-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Custo/Unidade (R$)</label>
              <input
                type="number"
                step="0.01"
                value={form.costPerUnit}
                onChange={(e) => setForm({ ...form, costPerUnit: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-violet-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Custo Total (R$)</label>
              <input
                type="number"
                step="0.01"
                value={form.totalCost}
                onChange={(e) => setForm({ ...form, totalCost: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-violet-500 outline-none"
              />
            </div>
            <div className="sm:col-span-2 lg:col-span-4 flex gap-2">
              <button type="submit" className="bg-violet-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-violet-700 transition">
                Criar
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition">
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {movForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h2 className="font-semibold text-gray-800 mb-4">Movimentação de Insumo</h2>
          <form onSubmit={handleMovement} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
              <select
                value={movForm.type}
                onChange={(e) => setMovForm({ ...movForm, type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-violet-500 outline-none"
              >
                <option value="entrada">Entrada</option>
                <option value="saida">Saída</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantidade</label>
              <input
                type="number"
                step="0.01"
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

      {supplies.length > 0 && (
        <div className="bg-violet-50 rounded-xl border border-violet-200 p-5 mb-6">
          <h2 className="font-semibold text-violet-800 mb-2">Investimento Total em Insumos</h2>
          <p className="text-2xl font-bold text-violet-700">
            {formatCurrency(supplies.reduce((sum, s) => sum + s.totalCost, 0))}
          </p>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden overflow-x-auto">
        <table className="w-full min-w-[700px]">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Insumo</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Unidade</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Quantidade</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Mín.</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Custo/Un</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Custo Total</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {supplies.map((s) => {
              const low = s.quantity <= s.minStock;
              return (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{s.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{s.unit}</td>
                  <td className="px-4 py-3 text-sm font-bold text-gray-700">{s.quantity}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{s.minStock}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{formatCurrency(s.costPerUnit)}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-700">{formatCurrency(s.totalCost)}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      low ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"
                    }`}>
                      {low ? "Baixo" : "OK"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => setMovForm({ supplyId: s.id, type: "entrada", quantity: "", notes: "" })}
                      className="text-violet-600 hover:text-violet-800 text-sm font-medium"
                    >
                      Movimentar
                    </button>
                  </td>
                </tr>
              );
            })}
            {supplies.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-gray-500 text-sm">
                  Nenhum insumo cadastrado
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
