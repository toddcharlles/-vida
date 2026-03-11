"use client";

import { useEffect, useState } from "react";
import { formatCurrency, formatDate } from "@/lib/utils";

interface GoldenStick {
  id: string;
  code: string;
  edition: string;
  prize: string;
  prizeType: string;
  prizeValue: number;
  claimed: boolean;
  claimedById: string | null;
  claimedAt: string | null;
  createdAt: string;
}

const PRIZE_TYPES = [
  { value: "caixa", label: "Caixa de Picolé" },
  { value: "freezer", label: "Freezer" },
  { value: "dinheiro", label: "Dinheiro" },
  { value: "tokens", label: "Tokens" },
];

export default function PalitosPage() {
  const [sticks, setSticks] = useState<GoldenStick[]>([]);
  const [form, setForm] = useState({ code: "", edition: "", prize: "", prizeType: "tokens", prizeValue: "" });
  const [showForm, setShowForm] = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    const data = await fetch("/api/liga/golden-sticks").then((r) => r.json());
    setSticks(Array.isArray(data) ? data : []);
  }

  async function create(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/liga/golden-sticks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setForm({ code: "", edition: "", prize: "", prizeType: "tokens", prizeValue: "" });
      setShowForm(false);
      load();
    } else {
      const err = await res.json();
      alert(err.error);
    }
  }

  const claimed = sticks.filter((s) => s.claimed).length;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Palitos Dourados</h1>
          <p className="text-sm text-gray-500">{sticks.length} palitos | {claimed} resgatados</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-amber-700 transition">
          + Novo Palito Dourado
        </button>
      </div>

      {showForm && (
        <form onSubmit={create} className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Código</label>
            <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="GOLD-001" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 outline-none" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Edição</label>
            <input value={form.edition} onChange={(e) => setForm({ ...form, edition: e.target.value })} placeholder="Edição 1/500" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 outline-none" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Prêmio</label>
            <select value={form.prizeType} onChange={(e) => setForm({ ...form, prizeType: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 outline-none">
              {PRIZE_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descrição do Prêmio</label>
            <input value={form.prize} onChange={(e) => setForm({ ...form, prize: e.target.value })} placeholder="1 caixa com 30 picolés" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 outline-none" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Valor (R$ ou tokens)</label>
            <input type="number" step="0.01" value={form.prizeValue} onChange={(e) => setForm({ ...form, prizeValue: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 outline-none" required />
          </div>
          <div className="flex items-end gap-2">
            <button type="submit" className="bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-amber-700">Criar</button>
            <button type="button" onClick={() => setShowForm(false)} className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium">Cancelar</button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Código</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Edição</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Prêmio</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Valor</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sticks.map((s) => (
              <tr key={s.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-mono font-bold text-amber-700">{s.code}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{s.edition}</td>
                <td className="px-4 py-3 text-sm text-gray-700">{s.prize}</td>
                <td className="px-4 py-3 text-sm font-medium text-gray-700">
                  {s.prizeType === "tokens" ? `${s.prizeValue} tokens` : formatCurrency(s.prizeValue)}
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    s.claimed ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"
                  }`}>
                    {s.claimed ? `Resgatado ${s.claimedAt ? formatDate(s.claimedAt) : ""}` : "Disponível"}
                  </span>
                </td>
              </tr>
            ))}
            {sticks.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500 text-sm">Nenhum palito dourado criado.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
