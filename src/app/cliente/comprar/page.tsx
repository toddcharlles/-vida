"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { formatCurrency } from "@/lib/utils";

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: { name: string };
}

interface Store {
  id: string;
  name: string;
  address: string;
  city: string;
}

interface CartItem {
  product: Product;
  quantity: number;
}

export default function ComprarPage() {
  const searchParams = useSearchParams();
  const preSelectedStoreId = searchParams.get("storeId");

  const [products, setProducts] = useState<Product[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [selectedStore, setSelectedStore] = useState(preSelectedStoreId || "");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [tokens, setTokens] = useState(0);
  const [useTokens, setUseTokens] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/products").then((r) => r.json()),
      fetch("/api/stores").then((r) => r.json()),
      fetch("/api/customer/me").then((r) => r.json()),
    ]).then(([prodData, storeData, custData]) => {
      setProducts(prodData.products || []);
      setStores(storeData.stores || []);
      setTokens(custData.customer?.tokens || 0);
      setLoading(false);
    });
  }, []);

  function addToCart(product: Product) {
    setCart((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  }

  function removeFromCart(productId: string) {
    setCart((prev) => prev.filter((i) => i.product.id !== productId));
  }

  function updateQuantity(productId: string, qty: number) {
    if (qty <= 0) return removeFromCart(productId);
    setCart((prev) =>
      prev.map((i) => (i.product.id === productId ? { ...i, quantity: qty } : i))
    );
  }

  const subtotal = cart.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  const tokenDiscount = useTokens * 0.5;
  const total = Math.max(0, subtotal - tokenDiscount);
  const tokensEarned = Math.floor(total);

  async function handleSubmit() {
    if (!selectedStore || cart.length === 0) return;
    setSubmitting(true);
    setSuccess(null);
    setPaymentUrl(null);

    try {
      const res = await fetch("/api/purchases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeId: selectedStore,
          items: cart.map((i) => ({ productId: i.product.id, quantity: i.quantity })),
          useTokens: useTokens > 0 ? useTokens : 0,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "Erro ao criar compra");
        setSubmitting(false);
        return;
      }

      const data = await res.json();

      // Try to generate payment link
      const payRes = await fetch("/api/purchases/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ purchaseId: data.purchase.id }),
      });

      if (payRes.ok) {
        const payData = await payRes.json();
        setPaymentUrl(payData.paymentUrl || payData.sandboxUrl);
      }

      setSuccess(
        `Compra criada com sucesso! Você vai ganhar ${data.tokensEarned} tokens após retirar.`
      );
      setCart([]);
      setUseTokens(0);
    } catch {
      alert("Erro ao processar compra");
    }
    setSubmitting(false);
  }

  if (loading) {
    return <div className="text-center py-12 text-gray-500">Carregando...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">🛒 Comprar</h1>

      {success && (
        <div className="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg">
          <p className="font-medium">{success}</p>
          {paymentUrl && (
            <a
              href={paymentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
            >
              Pagar com Mercado Pago
            </a>
          )}
          {!paymentUrl && (
            <p className="text-sm mt-1">
              Mercado Pago não configurado. Configure MERCADOPAGO_ACCESS_TOKEN para habilitar pagamentos online.
            </p>
          )}
        </div>
      )}

      {/* Store selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Loja para retirada
        </label>
        <select
          value={selectedStore}
          onChange={(e) => setSelectedStore(e.target.value)}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
        >
          <option value="">Selecione uma loja...</option>
          {stores.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} - {s.city} ({s.address})
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Products */}
        <div className="lg:col-span-2">
          <h2 className="font-bold text-gray-700 mb-3">Produtos</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {products.map((p) => (
              <div
                key={p.id}
                className="bg-white rounded-xl shadow-sm border p-4"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-bold text-gray-800">{p.name}</h3>
                    <span className="text-xs bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full">
                      {p.category.name}
                    </span>
                  </div>
                  <span className="font-bold text-emerald-600">
                    {formatCurrency(p.price)}
                  </span>
                </div>
                {p.description && (
                  <p className="text-xs text-gray-500 mb-3">{p.description}</p>
                )}
                <button
                  onClick={() => addToCart(p)}
                  className="w-full py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition"
                >
                  Adicionar
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Cart */}
        <div>
          <h2 className="font-bold text-gray-700 mb-3">Carrinho</h2>
          <div className="bg-white rounded-xl shadow-sm border p-4">
            {cart.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-4">
                Carrinho vazio
              </p>
            ) : (
              <>
                {cart.map((item) => (
                  <div
                    key={item.product.id}
                    className="flex items-center justify-between py-2 border-b last:border-0"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800">
                        {item.product.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatCurrency(item.product.price)} un.
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          updateQuantity(item.product.id, item.quantity - 1)
                        }
                        className="w-7 h-7 rounded-full bg-gray-100 text-gray-600 font-bold hover:bg-gray-200"
                      >
                        -
                      </button>
                      <span className="text-sm font-medium w-6 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(item.product.id, item.quantity + 1)
                        }
                        className="w-7 h-7 rounded-full bg-gray-100 text-gray-600 font-bold hover:bg-gray-200"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}

                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Subtotal</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>

                  {tokens > 0 && (
                    <div className="bg-yellow-50 rounded-lg p-3">
                      <p className="text-xs text-yellow-700 mb-2">
                        Você tem {tokens} tokens ({formatCurrency(tokens * 0.5)}{" "}
                        em desconto, max 30%)
                      </p>
                      <input
                        type="number"
                        min={0}
                        max={Math.min(
                          tokens,
                          Math.floor((subtotal * 0.3) / 0.5)
                        )}
                        value={useTokens}
                        onChange={(e) =>
                          setUseTokens(
                            Math.max(0, parseInt(e.target.value) || 0)
                          )
                        }
                        className="w-full px-3 py-1.5 border rounded text-sm"
                        placeholder="Tokens a usar"
                      />
                    </div>
                  )}

                  {tokenDiscount > 0 && (
                    <div className="flex justify-between text-yellow-600">
                      <span>Desconto tokens</span>
                      <span>-{formatCurrency(tokenDiscount)}</span>
                    </div>
                  )}

                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>Total</span>
                    <span className="text-emerald-600">
                      {formatCurrency(total)}
                    </span>
                  </div>

                  <p className="text-xs text-gray-400">
                    Você ganhará {tokensEarned} tokens nesta compra
                  </p>

                  <button
                    onClick={handleSubmit}
                    disabled={!selectedStore || submitting}
                    className="w-full py-3 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition disabled:opacity-50 mt-2"
                  >
                    {submitting ? "Processando..." : "Finalizar Compra"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
