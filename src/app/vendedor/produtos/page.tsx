"use client";

import { useEffect, useState, useCallback } from "react";
import { formatCurrency } from "@/lib/utils";

interface Category {
  name: string;
}

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: Category;
}

interface StoreProduct {
  id: string;
  productId: string;
  price: number | null;
  available: boolean;
  product: Product;
}

export default function MeusProdutosPage() {
  const [storeProducts, setStoreProducts] = useState<StoreProduct[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasStore, setHasStore] = useState(true);
  const [adding, setAdding] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [customPrice, setCustomPrice] = useState("");

  const loadProducts = useCallback(async () => {
    const res = await fetch("/api/vendor/store/products");
    if (res.status === 404) {
      setHasStore(false);
      setLoading(false);
      return;
    }
    const data = await res.json();
    setStoreProducts(data.storeProducts || []);
    setAllProducts(data.allProducts || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const addedProductIds = new Set(storeProducts.map((sp) => sp.productId));
  const availableToAdd = allProducts.filter((p) => !addedProductIds.has(p.id));

  async function handleAdd() {
    if (!selectedProduct) return;
    setAdding(true);

    const res = await fetch("/api/vendor/store/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId: selectedProduct,
        price: customPrice || null,
      }),
    });

    if (res.ok) {
      setSelectedProduct("");
      setCustomPrice("");
      await loadProducts();
    } else {
      const err = await res.json();
      alert(err.error || "Erro ao adicionar produto");
    }
    setAdding(false);
  }

  async function toggleAvailability(sp: StoreProduct) {
    await fetch("/api/vendor/store/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId: sp.productId,
        price: sp.price,
        available: !sp.available,
      }),
    });
    await loadProducts();
  }

  async function handleRemove(productId: string) {
    if (!confirm("Remover este produto da sua loja?")) return;

    await fetch(`/api/vendor/store/products?productId=${productId}`, {
      method: "DELETE",
    });
    await loadProducts();
  }

  if (loading) {
    return <div className="text-center py-12 text-gray-500">Carregando...</div>;
  }

  if (!hasStore) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-3">🏪</div>
        <p className="text-gray-600 mb-4">
          Voce precisa cadastrar sua loja antes de adicionar produtos.
        </p>
        <a
          href="/vendedor/loja"
          className="inline-block px-6 py-2.5 bg-violet-600 text-white rounded-lg font-medium hover:bg-violet-700 transition"
        >
          Cadastrar Loja
        </a>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Produtos da Minha Loja</h1>

      {/* Adicionar produto */}
      <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
        <h2 className="font-bold text-gray-700 mb-3">Adicionar Produto</h2>
        {availableToAdd.length === 0 ? (
          <p className="text-sm text-gray-500">
            Todos os produtos ja estao na sua loja!
          </p>
        ) : (
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Produto
              </label>
              <select
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 outline-none"
              >
                <option value="">Selecione um produto...</option>
                {availableToAdd.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} - {formatCurrency(p.price)} ({p.category.name})
                  </option>
                ))}
              </select>
            </div>
            <div className="w-40">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Preco customizado
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={customPrice}
                onChange={(e) => setCustomPrice(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 outline-none"
                placeholder="Opcional"
              />
            </div>
            <button
              onClick={handleAdd}
              disabled={!selectedProduct || adding}
              className="px-6 py-2.5 bg-violet-600 text-white rounded-lg font-medium hover:bg-violet-700 transition disabled:opacity-50"
            >
              {adding ? "Adicionando..." : "Adicionar"}
            </button>
          </div>
        )}
      </div>

      {/* Lista de produtos */}
      {storeProducts.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm border">
          <div className="text-4xl mb-3">📦</div>
          <p className="text-gray-500">
            Nenhum produto adicionado na sua loja ainda.
          </p>
          <p className="text-sm text-gray-400 mt-1">
            Adicione produtos usando o formulario acima.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead className="bg-gray-50">
              <tr className="text-xs text-gray-500 uppercase">
                <th className="text-left px-4 sm:px-6 py-3">Produto</th>
                <th className="text-left px-4 sm:px-6 py-3">Categoria</th>
                <th className="text-left px-4 sm:px-6 py-3">Preco Padrao</th>
                <th className="text-left px-4 sm:px-6 py-3">Seu Preco</th>
                <th className="text-left px-4 sm:px-6 py-3">Status</th>
                <th className="text-left px-4 sm:px-6 py-3">Acoes</th>
              </tr>
            </thead>
            <tbody>
              {storeProducts.map((sp) => (
                <tr key={sp.id} className="border-t border-gray-200 hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-800">{sp.product.name}</p>
                      {sp.product.description && (
                        <p className="text-xs text-gray-500 mt-0.5">
                          {sp.product.description}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full">
                      {sp.product.category.name}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {formatCurrency(sp.product.price)}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium">
                    {sp.price ? formatCurrency(sp.price) : "Padrao"}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => toggleAvailability(sp)}
                      className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium cursor-pointer transition ${
                        sp.available
                          ? "bg-green-100 text-green-800 hover:bg-green-200"
                          : "bg-red-100 text-red-800 hover:bg-red-200"
                      }`}
                    >
                      {sp.available ? "Disponivel" : "Indisponivel"}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleRemove(sp.productId)}
                      className="text-sm text-red-600 hover:text-red-800 font-medium"
                    >
                      Remover
                    </button>
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
