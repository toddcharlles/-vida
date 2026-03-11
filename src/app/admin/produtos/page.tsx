"use client";

import { useEffect, useState } from "react";
import { formatCurrency } from "@/lib/utils";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  categoryId: string;
  active: boolean;
  category: Category;
  stock: { quantity: number } | null;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", description: "", price: "", categoryId: "", minStock: "10" });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const [prods, cats] = await Promise.all([
      fetch("/api/products").then((r) => r.json()),
      fetch("/api/categories").then((r) => r.json()),
    ]);
    setProducts(Array.isArray(prods) ? prods : []);
    setCategories(Array.isArray(cats) ? cats : []);
  }

  function openNew() {
    setForm({ name: "", description: "", price: "", categoryId: categories[0]?.id || "", minStock: "10" });
    setEditingId(null);
    setShowForm(true);
  }

  function openEdit(p: Product) {
    setForm({
      name: p.name,
      description: p.description || "",
      price: p.price.toString(),
      categoryId: p.categoryId,
      minStock: "10",
    });
    setEditingId(p.id);
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (editingId) {
      await fetch(`/api/products/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    } else {
      await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    }
    setShowForm(false);
    loadData();
  }

  async function handleDelete(id: string) {
    if (!confirm("Deseja desativar este produto?")) return;
    await fetch(`/api/products/${id}`, { method: "DELETE" });
    loadData();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Produtos</h1>
        <button
          onClick={openNew}
          className="bg-violet-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-violet-700 transition"
        >
          + Novo Produto
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h2 className="font-semibold text-gray-800 mb-4">
            {editingId ? "Editar Produto" : "Novo Produto"}
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
              <select
                value={form.categoryId}
                onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-violet-500 outline-none"
                required
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Preço (R$)</label>
              <input
                type="number"
                step="0.01"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-violet-500 outline-none"
                required
              />
            </div>
            {!editingId && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estoque Mínimo</label>
                <input
                  type="number"
                  value={form.minStock}
                  onChange={(e) => setForm({ ...form, minStock: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-violet-500 outline-none"
                />
              </div>
            )}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-violet-500 outline-none"
                rows={2}
              />
            </div>
            <div className="md:col-span-2 flex gap-2">
              <button type="submit" className="bg-violet-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-violet-700 transition">
                {editingId ? "Salvar" : "Criar"}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition">
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
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Preço</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Estoque</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {products.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="font-medium text-sm text-gray-900">{p.name}</div>
                  {p.description && <div className="text-xs text-gray-500">{p.description}</div>}
                </td>
                <td className="px-4 py-3">
                  <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-violet-50 text-violet-700">
                    {p.category.name}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">{formatCurrency(p.price)}</td>
                <td className="px-4 py-3 text-sm font-medium text-gray-700">{p.stock?.quantity ?? 0}</td>
                <td className="px-4 py-3 text-right space-x-2">
                  <button onClick={() => openEdit(p)} className="text-violet-600 hover:text-violet-800 text-sm font-medium">
                    Editar
                  </button>
                  <button onClick={() => handleDelete(p.id)} className="text-red-600 hover:text-red-800 text-sm font-medium">
                    Remover
                  </button>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-500 text-sm">
                  Nenhum produto cadastrado
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
