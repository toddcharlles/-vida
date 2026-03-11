"use client";

import { useEffect, useState } from "react";
import { formatCurrency } from "@/lib/utils";

interface DashboardData {
  totalProducts: number;
  totalOrders: number;
  pendingOrders: number;
  revenue: number;
  totalCustomers: number;
  totalStores: number;
  totalCommissions: number;
  pendingCommissions: number;
  recentPurchases: number;
  topProducts: { name: string; sold: number }[];
  lowStockProducts: { name: string; quantity: number }[];
  lowStockSupplies: { name: string; quantity: number; unit: string }[];
}

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    async function loadDashboard() {
      const [products, orders, stock, supplies, storesRes, commissionsRes] = await Promise.all([
        fetch("/api/products").then((r) => r.json()),
        fetch("/api/orders").then((r) => r.json()),
        fetch("/api/stock").then((r) => r.json()),
        fetch("/api/supplies").then((r) => r.json()),
        fetch("/api/stores").then((r) => r.json()),
        fetch("/api/commissions").then((r) => r.json()),
      ]);

      const ordersList = Array.isArray(orders) ? orders : [];
      const delivered = ordersList.filter((o: { status: string }) => o.status === "entregue");
      const pending = ordersList.filter((o: { status: string }) => o.status === "pendente");

      // Top products by order frequency
      const productCounts: Record<string, { name: string; sold: number }> = {};
      for (const order of ordersList) {
        for (const item of order.items || []) {
          const name = item.product?.name || "?";
          if (!productCounts[name]) productCounts[name] = { name, sold: 0 };
          productCounts[name].sold += item.quantity;
        }
      }
      const topProducts = Object.values(productCounts).sort((a, b) => b.sold - a.sold).slice(0, 5);

      setData({
        totalProducts: Array.isArray(products) ? products.length : 0,
        totalOrders: ordersList.length,
        pendingOrders: pending.length,
        revenue: delivered.reduce((sum: number, o: { total: number }) => sum + o.total, 0),
        totalCustomers: 0, // Would need a separate endpoint
        totalStores: storesRes.stores?.length || 0,
        totalCommissions: commissionsRes.totalCommissions || 0,
        pendingCommissions: commissionsRes.pendingCommissions || 0,
        recentPurchases: commissionsRes.commissions?.length || 0,
        topProducts,
        lowStockProducts: Array.isArray(stock)
          ? stock
              .filter((s: { quantity: number; minStock: number }) => s.quantity <= s.minStock)
              .map((s: { product: { name: string }; quantity: number }) => ({
                name: s.product.name,
                quantity: s.quantity,
              }))
          : [],
        lowStockSupplies: Array.isArray(supplies)
          ? supplies
              .filter((s: { quantity: number; minStock: number }) => s.quantity <= s.minStock)
              .map((s: { name: string; quantity: number; unit: string }) => ({
                name: s.name,
                quantity: s.quantity,
                unit: s.unit,
              }))
          : [],
      });
    }
    loadDashboard();
  }, []);

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600"></div>
      </div>
    );
  }

  const cards = [
    { label: "Produtos", value: data.totalProducts, icon: "🍦", color: "bg-violet-50 text-violet-700" },
    { label: "Lojas", value: data.totalStores, icon: "🏪", color: "bg-indigo-50 text-indigo-700" },
    { label: "Pedidos", value: data.totalOrders, icon: "📋", color: "bg-blue-50 text-blue-700" },
    { label: "Pendentes", value: data.pendingOrders, icon: "⏳", color: "bg-yellow-50 text-yellow-700" },
    { label: "Faturamento", value: formatCurrency(data.revenue), icon: "💰", color: "bg-green-50 text-green-700" },
    { label: "Comissoes", value: formatCurrency(data.totalCommissions), icon: "💸", color: "bg-emerald-50 text-emerald-700" },
    { label: "Vendas B2C", value: data.recentPurchases, icon: "🛒", color: "bg-pink-50 text-pink-700" },
    { label: "Comissoes Pend.", value: formatCurrency(data.pendingCommissions), icon: "🔄", color: "bg-orange-50 text-orange-700" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
        {cards.map((card) => (
          <div key={card.label} className="bg-white rounded-xl border border-gray-200 p-3 sm:p-5">
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <span className={`text-xs font-medium px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full ${card.color}`}>
                {card.label}
              </span>
              <span className="text-xl sm:text-2xl">{card.icon}</span>
            </div>
            <p className="text-lg sm:text-2xl font-bold text-gray-800 truncate">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Top Products */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-800 mb-4">Top Produtos (Pedidos)</h2>
          {data.topProducts.length === 0 ? (
            <p className="text-gray-500 text-sm">Nenhum pedido ainda</p>
          ) : (
            <ul className="space-y-2">
              {data.topProducts.map((p, i) => (
                <li key={p.name} className="flex justify-between text-sm py-2 border-b border-gray-100">
                  <span className="text-gray-700">
                    <span className="font-bold text-violet-600 mr-2">#{i + 1}</span>
                    {p.name}
                  </span>
                  <span className="font-medium text-gray-800">{p.sold} un.</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Low Stock Products */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-800 mb-4">Produtos Estoque Baixo</h2>
          {data.lowStockProducts.length === 0 ? (
            <p className="text-gray-500 text-sm">Todos com estoque adequado</p>
          ) : (
            <ul className="space-y-2">
              {data.lowStockProducts.map((p) => (
                <li key={p.name} className="flex justify-between text-sm py-2 border-b border-gray-100">
                  <span className="text-gray-700">{p.name}</span>
                  <span className="font-medium text-red-600">{p.quantity} un.</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Low Stock Supplies */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-800 mb-4">Insumos Estoque Baixo</h2>
          {data.lowStockSupplies.length === 0 ? (
            <p className="text-gray-500 text-sm">Todos com estoque adequado</p>
          ) : (
            <ul className="space-y-2">
              {data.lowStockSupplies.map((s) => (
                <li key={s.name} className="flex justify-between text-sm py-2 border-b border-gray-100">
                  <span className="text-gray-700">{s.name}</span>
                  <span className="font-medium text-red-600">{s.quantity} {s.unit}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
