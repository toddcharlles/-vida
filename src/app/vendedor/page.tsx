"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/lib/utils";

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: { name: string; slug: string };
  stock: { quantity: number } | null;
}

interface CartItem {
  product: Product;
  quantity: number;
}

export default function CatalogoPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [notes, setNotes] = useState("");
  const [filter, setFilter] = useState("todos");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetch("/api/products").then((r) => r.json()).then((data) => {
      setProducts(Array.isArray(data) ? data : []);
    });
  }, []);

  const categories = ["todos", ...new Set(products.map((p) => p.category.slug))];
  const filtered = filter === "todos" ? products : products.filter((p) => p.category.slug === filter);

  function addToCart(product: Product) {
    setCart((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        return prev.map((i) => i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { product, quantity: 1 }];
    });
  }

  function updateQuantity(productId: string, quantity: number) {
    if (quantity <= 0) {
      setCart((prev) => prev.filter((i) => i.product.id !== productId));
    } else {
      setCart((prev) => prev.map((i) => i.product.id === productId ? { ...i, quantity } : i));
    }
  }

  const total = cart.reduce((sum, i) => sum + i.product.price * i.quantity, 0);

  async function handleOrder() {
    if (cart.length === 0) return;
    setSending(true);

    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: cart.map((i) => ({ productId: i.product.id, quantity: i.quantity })),
        notes: notes || undefined,
      }),
    });

    if (res.ok) {
      setCart([]);
      setNotes("");
      router.push("/vendedor/pedidos");
    }
    setSending(false);
  }

  const categoryLabels: Record<string, string> = {
    todos: "Todos",
    normal: "Normal",
    proteico: "Proteico",
    energetico: "Energético",
    isotonico: "Isotônico",
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <div className="flex-1 min-w-0">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Catalogo de Picoles</h1>

        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                filter === cat
                  ? "bg-violet-600 text-white"
                  : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {categoryLabels[cat] || cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((product) => {
            const inCart = cart.find((i) => i.product.id === product.id);
            const available = (product.stock?.quantity ?? 0) > 0;

            return (
              <div key={product.id} className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-gray-800">{product.name}</h3>
                    <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-violet-50 text-violet-700">
                      {product.category.name}
                    </span>
                  </div>
                  <span className="text-lg font-bold text-violet-600">{formatCurrency(product.price)}</span>
                </div>

                {product.description && (
                  <p className="text-xs text-gray-500 mb-3">{product.description}</p>
                )}

                <div className="flex items-center justify-between">
                  <span className={`text-xs ${available ? "text-green-600" : "text-red-500"}`}>
                    {available ? `${product.stock?.quantity} em estoque` : "Sem estoque"}
                  </span>

                  {inCart ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(product.id, inCart.quantity - 1)}
                        className="w-7 h-7 rounded-full bg-gray-100 text-gray-600 font-bold text-sm hover:bg-gray-200"
                      >
                        -
                      </button>
                      <span className="text-sm font-bold w-6 text-center">{inCart.quantity}</span>
                      <button
                        onClick={() => updateQuantity(product.id, inCart.quantity + 1)}
                        className="w-7 h-7 rounded-full bg-violet-100 text-violet-700 font-bold text-sm hover:bg-violet-200"
                      >
                        +
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => addToCart(product)}
                      className="bg-violet-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-violet-700 transition"
                    >
                      Adicionar
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500">
            Nenhum produto disponível nesta categoria
          </div>
        )}
      </div>

      <div className="w-full lg:w-80 shrink-0">
        <div className="bg-white rounded-xl border border-gray-200 p-5 sticky top-4 lg:top-8">
          <h2 className="font-bold text-gray-800 mb-4">Seu Pedido</h2>

          {cart.length === 0 ? (
            <p className="text-sm text-gray-500">Adicione produtos ao seu pedido</p>
          ) : (
            <>
              <ul className="space-y-3 mb-4">
                {cart.map((item) => (
                  <li key={item.product.id} className="flex items-center justify-between text-sm">
                    <div>
                      <p className="font-medium text-gray-800">{item.product.name}</p>
                      <p className="text-xs text-gray-500">{item.quantity}x {formatCurrency(item.product.price)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{formatCurrency(item.product.price * item.quantity)}</span>
                      <button
                        onClick={() => updateQuantity(item.product.id, 0)}
                        className="text-red-500 hover:text-red-700 text-xs"
                      >
                        X
                      </button>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="border-t border-gray-200 pt-3 mb-4">
                <div className="flex justify-between font-bold text-gray-800">
                  <span>Total</span>
                  <span>{formatCurrency(total)}</span>
                </div>
              </div>

              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Observações (opcional)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm mb-3 focus:ring-2 focus:ring-violet-500 outline-none"
                rows={2}
              />

              <button
                onClick={handleOrder}
                disabled={sending}
                className="w-full bg-violet-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-violet-700 transition disabled:opacity-50"
              >
                {sending ? "Enviando..." : "Enviar Pedido"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
