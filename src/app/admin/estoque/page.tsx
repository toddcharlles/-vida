"use client";

import { useEffect, useState } from "react";
import { formatCurrency } from "@/lib/utils";

interface Supply {
  id: string;
  name: string;
  unit: string;
  quantity: number;
}

interface RecipeItem {
  id: string;
  quantityPerBatch: number;
  supply: Supply;
}

interface StockItem {
  id: string;
  quantity: number;
  minStock: number;
  product: {
    id: string;
    name: string;
    price: number;
    costPerBatch: number;
    costPerUnit: number;
    maxProduction: number;
    limitingIngredient: string | null;
    category: { name: string };
    recipeItems: RecipeItem[];
  };
}

export default function StockPage() {
  const [stock, setStock] = useState<StockItem[]>([]);
  const [movForm, setMovForm] = useState<{
    stockId: string;
    type: string;
    quantity: string;
    notes: string;
    product: StockItem["product"] | null;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => { loadStock(); }, []);

  async function loadStock() {
    const data = await fetch("/api/stock").then((r) => r.json());
    setStock(Array.isArray(data) ? data : []);
  }

  async function handleMovement(e: React.FormEvent) {
    e.preventDefault();
    if (!movForm) return;
    setLoading(true);
    setError(null);

    const res = await fetch(`/api/stock/${movForm.stockId}/movement`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: movForm.type, quantity: movForm.quantity, notes: movForm.notes }),
    });

    const result = await res.json();
    setLoading(false);

    if (!res.ok) {
      const msg = result.details
        ? `${result.error}:\n${result.details.join("\n")}`
        : result.error;
      setError(msg);
      return;
    }

    setMovForm(null);
    loadStock();
  }

  // Calculate supply consumption preview
  function getConsumptionPreview() {
    if (!movForm || movForm.type !== "producao" || !movForm.product?.recipeItems?.length) return null;
    const qty = parseInt(movForm.quantity) || 0;
    if (qty <= 0) return null;

    const batches = qty / 10;
    return movForm.product.recipeItems.map((ri) => {
      const needed = ri.quantityPerBatch * batches;
      let availableInUnit = ri.supply.quantity;
      let displayUnit = ri.supply.unit === "unidades" ? "un" : "g";
      let displayAvailable = ri.supply.quantity;

      if (ri.supply.unit === "kg") {
        availableInUnit = ri.supply.quantity * 1000;
        displayAvailable = ri.supply.quantity;
        displayUnit = "g";
      }

      const sufficient = availableInUnit >= needed;
      return {
        name: ri.supply.name,
        needed,
        displayUnit,
        displayAvailable: ri.supply.unit === "kg"
          ? `${displayAvailable.toFixed(2)} kg (${(displayAvailable * 1000).toFixed(0)}g)`
          : `${displayAvailable} ${ri.supply.unit}`,
        sufficient,
      };
    });
  }

  const preview = getConsumptionPreview();
  const allSufficient = preview ? preview.every((p) => p.sufficient) : true;
  const qty = parseInt(movForm?.quantity || "0") || 0;
  const batches = qty / 10;
  const totalCost = movForm?.product ? movForm.product.costPerBatch * batches : 0;

  const filtered = stock.filter((s) =>
    s.product.name.toLowerCase().includes(search.toLowerCase()) ||
    s.product.category.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Estoque de Produtos</h1>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Buscar produto ou categoria..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-sm px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-violet-500 outline-none"
        />
      </div>

      {/* Production form */}
      {movForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 mb-6">
          <h2 className="font-semibold text-gray-800 mb-1">
            Registrar Movimentação - {movForm.product?.name}
          </h2>
          {movForm.product && (
            <p className="text-xs text-gray-500 mb-4">
              Custo/batelada: {formatCurrency(movForm.product.costPerBatch)} |
              Custo/unidade: {formatCurrency(movForm.product.costPerUnit)} |
              Produção máx: {movForm.product.maxProduction} un
              {movForm.product.limitingIngredient && ` (limitado por ${movForm.product.limitingIngredient})`}
            </p>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-red-700 whitespace-pre-line">{error}</p>
            </div>
          )}

          <form onSubmit={handleMovement} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                <select
                  value={movForm.type}
                  onChange={(e) => setMovForm({ ...movForm, type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-violet-500 outline-none"
                >
                  <option value="producao">Produção (entrada + abate insumos)</option>
                  <option value="venda">Venda (saída)</option>
                  <option value="ajuste">Ajuste (entrada manual)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantidade {movForm.type === "producao" && "(múltiplo de 10)"}
                </label>
                <input
                  type="number"
                  min="1"
                  step={movForm.type === "producao" ? "10" : "1"}
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
            </div>

            {/* Supply consumption preview */}
            {movForm.type === "producao" && preview && preview.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <h3 className="font-semibold text-amber-800 text-sm mb-2">
                  Consumo de insumos para {qty} unidades ({batches} batelada{batches !== 1 ? "s" : ""})
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[400px] text-sm">
                    <thead>
                      <tr className="border-b border-amber-200">
                        <th className="text-left py-1 text-xs font-medium text-amber-700">Insumo</th>
                        <th className="text-right py-1 text-xs font-medium text-amber-700">Consumo</th>
                        <th className="text-right py-1 text-xs font-medium text-amber-700">Disponível</th>
                        <th className="text-center py-1 text-xs font-medium text-amber-700">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {preview.map((p) => (
                        <tr key={p.name} className="border-b border-amber-100">
                          <td className="py-1.5 text-amber-900">{p.name}</td>
                          <td className="py-1.5 text-right text-amber-900 font-medium">
                            {p.needed % 1 === 0 ? p.needed : p.needed.toFixed(1)} {p.displayUnit}
                          </td>
                          <td className="py-1.5 text-right text-amber-700">{p.displayAvailable}</td>
                          <td className="py-1.5 text-center">
                            <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                              p.sufficient ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                            }`}>
                              {p.sufficient ? "OK" : "Insuficiente"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-3 flex flex-wrap gap-4 text-sm">
                  <span className="text-amber-800">
                    <strong>Custo total:</strong> {formatCurrency(totalCost)}
                  </span>
                  <span className="text-amber-800">
                    <strong>Custo/unidade:</strong> {formatCurrency(totalCost / (qty || 1))}
                  </span>
                </div>
              </div>
            )}

            {movForm.type === "producao" && movForm.product?.recipeItems?.length === 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm text-yellow-700">
                  Este produto não possui receita cadastrada. A produção será registrada sem abater insumos.
                </p>
              </div>
            )}

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={loading || (movForm.type === "producao" && !allSufficient && (movForm.product?.recipeItems?.length || 0) > 0)}
                className="bg-violet-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-violet-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Registrando..." : "Confirmar Movimentação"}
              </button>
              <button
                type="button"
                onClick={() => { setMovForm(null); setError(null); }}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Stock table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden overflow-x-auto">
        <table className="w-full min-w-[700px]">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Produto</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Categoria</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Estoque</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Mín.</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Prod. Máx</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Custo/Un</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((s) => {
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
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {s.product.maxProduction > 0 ? (
                      <span title={`Limitado por: ${s.product.limitingIngredient || "—"}`}>
                        {s.product.maxProduction} un
                      </span>
                    ) : "—"}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {s.product.costPerUnit > 0 ? formatCurrency(s.product.costPerUnit) : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      low ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"
                    }`}>
                      {low ? "Baixo" : "OK"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => setMovForm({
                        stockId: s.id,
                        type: "producao",
                        quantity: "",
                        notes: "",
                        product: s.product,
                      })}
                      className="text-violet-600 hover:text-violet-800 text-sm font-medium"
                    >
                      Movimentar
                    </button>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-gray-500 text-sm">
                  Nenhum produto no estoque.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
