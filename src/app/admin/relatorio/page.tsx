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

interface RecipeItem {
  id: string;
  quantityPerBatch: number;
  supply: Supply;
}

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  costPerBatch: number;
  costPerUnit: number;
  maxProduction: number;
  limitingIngredient: string | null;
  category: { name: string };
  stock: { quantity: number } | null;
  recipeItems: RecipeItem[];
}

interface ReportData {
  supplies: Supply[];
  totalInvestment: number;
  products: Product[];
}

export default function ReportPage() {
  const [data, setData] = useState<ReportData | null>(null);

  useEffect(() => {
    fetch("/api/report")
      .then((r) => r.json())
      .then(setData);
  }, []);

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600"></div>
      </div>
    );
  }

  const proteinProducts = data.products.filter((p) => p.recipeItems.length > 0);

  return (
    <div className="max-w-5xl w-full">
      <h1 className="text-2xl font-bold text-gray-800 mb-2">MAIS VIDA ICE</h1>
      <p className="text-gray-500 text-sm mb-8">
        Relatorio de materiais comprados, custo total, estimativa de producao e sobras por sabor.
        Paleta mexicana de 100ml, 10 unidades por batelada de 1 litro.
      </p>

      {/* 1. Resumo dos materiais comprados */}
      <section className="mb-10">
        <h2 className="text-lg font-bold text-gray-800 mb-4">1. Resumo dos Materiais Comprados</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="bg-violet-50 rounded-xl border border-violet-200 p-5">
            <p className="text-sm text-violet-600 font-medium mb-1">Total Investido</p>
            <p className="text-3xl font-bold text-violet-700">{formatCurrency(data.totalInvestment)}</p>
          </div>
          <div className="bg-blue-50 rounded-xl border border-blue-200 p-5">
            <p className="text-sm text-blue-600 font-medium mb-1">Itens em Estoque</p>
            <p className="text-3xl font-bold text-blue-700">{data.supplies.length}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden overflow-x-auto">
          <table className="w-full min-w-[500px]">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Item</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Quantidade</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Custo Total</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Custo/Un</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.supplies.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{s.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {s.quantity} {s.unit}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-700">{formatCurrency(s.totalCost)}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {formatCurrency(s.costPerUnit)}/{s.unit === "unidades" ? "un" : s.unit}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 2. Insumos ainda nao comprados */}
      <section className="mb-10">
        <h2 className="text-lg font-bold text-gray-800 mb-4">2. Insumos Ainda Nao Comprados</h2>
        <div className="bg-yellow-50 rounded-xl border border-yellow-200 p-5">
          <ul className="space-y-2 text-sm text-yellow-800">
            <li><strong>Base liquida:</strong> Agua filtrada e leite integral</li>
            <li><strong>Adocamento low carb:</strong> Eritritol, xilitol ou blend culinario com stevia</li>
            <li><strong>Linha Energy/Hydrate:</strong> Agua de coco, limao/maracuja, guarana em po, sal marinho, gengibre</li>
            <li><strong>Frutas frescas:</strong> Banana, morango, manga (opcional)</li>
          </ul>
        </div>
      </section>

      {/* 3. Premissas */}
      <section className="mb-10">
        <h2 className="text-lg font-bold text-gray-800 mb-4">3. Premissas das Estimativas</h2>
        <div className="bg-gray-50 rounded-xl border border-gray-200 p-5">
          <ul className="space-y-1 text-sm text-gray-700">
            <li>Paleta mexicana de 100ml</li>
            <li>Cada receita rende 10 paletas por batelada de 1 litro</li>
            <li>Custos calculados somente com itens comprados</li>
            <li>Nao incluidos: agua, leite, adocante low carb, energia eletrica, mao de obra ou transporte</li>
          </ul>
        </div>
      </section>

      {/* 4. Fichas tecnicas por sabor */}
      <section className="mb-10">
        <h2 className="text-lg font-bold text-gray-800 mb-4">4. Fichas Tecnicas por Sabor</h2>

        <div className="space-y-6">
          {proteinProducts.map((p, idx) => (
            <div key={p.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-violet-600 to-violet-500 px-5 py-4">
                <h3 className="font-bold text-white text-lg">
                  4.{idx + 1} {p.name}
                </h3>
                {p.description && (
                  <p className="text-violet-100 text-sm mt-1">{p.description}</p>
                )}
              </div>

              <div className="p-5">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-5">
                  <div className="bg-green-50 rounded-lg p-3 text-center">
                    <p className="text-xs text-green-600 font-medium mb-1">Custo/Batelada</p>
                    <p className="text-lg font-bold text-green-700">{formatCurrency(p.costPerBatch)}</p>
                    <p className="text-xs text-green-500">10 paletas</p>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-3 text-center">
                    <p className="text-xs text-blue-600 font-medium mb-1">Custo/Paleta</p>
                    <p className="text-lg font-bold text-blue-700">{formatCurrency(p.costPerUnit)}</p>
                  </div>
                  <div className="bg-violet-50 rounded-lg p-3 text-center">
                    <p className="text-xs text-violet-600 font-medium mb-1">Preco Venda</p>
                    <p className="text-lg font-bold text-violet-700">{formatCurrency(p.price)}</p>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-3 text-center">
                    <p className="text-xs text-orange-600 font-medium mb-1">Producao Max</p>
                    <p className="text-lg font-bold text-orange-700">{p.maxProduction}</p>
                    <p className="text-xs text-orange-500">paletas</p>
                  </div>
                </div>

                {p.limitingIngredient && (
                  <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2 mb-4">
                    <p className="text-sm text-red-700">
                      <strong>Ingrediente limitante:</strong> {p.limitingIngredient}
                    </p>
                  </div>
                )}

                <h4 className="font-semibold text-gray-700 text-sm mb-3">Receita por Batelada (10 paletas)</h4>
                <div className="bg-gray-50 rounded-lg overflow-hidden overflow-x-auto">
                  <table className="w-full min-w-[300px]">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left px-4 py-2 text-xs font-medium text-gray-500 uppercase">Ingrediente</th>
                        <th className="text-right px-4 py-2 text-xs font-medium text-gray-500 uppercase">Quantidade</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {p.recipeItems.map((ri) => (
                        <tr key={ri.id}>
                          <td className="px-4 py-2 text-sm text-gray-700">{ri.supply.name}</td>
                          <td className="px-4 py-2 text-sm text-gray-600 text-right">
                            {ri.quantityPerBatch} {ri.supply.unit === "unidades" ? "un" : "g"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {p.price > 0 && p.costPerUnit > 0 && (
                  <div className="mt-4 bg-green-50 border border-green-200 rounded-lg px-4 py-2">
                    <p className="text-sm text-green-700">
                      <strong>Margem bruta:</strong> {formatCurrency(p.price - p.costPerUnit)} por paleta
                      ({((1 - p.costPerUnit / p.price) * 100).toFixed(0)}%)
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Leitura executiva */}
      <section className="mb-10">
        <h2 className="text-lg font-bold text-gray-800 mb-4">5. Leitura Executiva</h2>
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden overflow-x-auto">
          <table className="w-full min-w-[500px]">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Cenario</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Max Teorico</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Observacao</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {proteinProducts.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{p.name}</td>
                  <td className="px-4 py-3 text-sm font-bold text-violet-700">{p.maxProduction} paletas</td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    Limitado por {p.limitingIngredient || "estoque"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 6. Recomendacoes */}
      <section className="mb-10">
        <h2 className="text-lg font-bold text-gray-800 mb-4">6. Recomendacoes</h2>
        <div className="bg-violet-50 rounded-xl border border-violet-200 p-5">
          <ul className="space-y-3 text-sm text-violet-800">
            <li className="flex items-start gap-2">
              <span className="mt-0.5 font-bold text-violet-600">1.</span>
              Usar o whey isolado para no maximo 60 paletas low carb no primeiro teste.
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 font-bold text-violet-600">2.</span>
              Reservar o Ovomaltine para linha posterior indulgente/fit, nao como produto principal low carb.
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 font-bold text-violet-600">3.</span>
              Comprar na sequencia: leite, adocante low carb e ingredientes da linha Energy/Hydrate.
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 font-bold text-violet-600">4.</span>
              Iniciar por Protein Chocolate Low Carb e/ou Protein Peanut Cream Low Carb para validar aceitacao em academias.
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 font-bold text-violet-600">5.</span>
              Se a aceitacao for boa, o proximo gargalo de compra sera novamente o whey isolado.
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
}
