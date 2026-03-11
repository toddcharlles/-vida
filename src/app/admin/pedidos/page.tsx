"use client";

import { useEffect, useState } from "react";
import { formatCurrency, formatDate, ORDER_STATUS } from "@/lib/utils";

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product: { name: string; category: { name: string } };
}

interface Order {
  id: string;
  status: string;
  total: number;
  notes: string | null;
  createdAt: string;
  user: { name: string; email: string };
  items: OrderItem[];
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState("todos");
  const [search, setSearch] = useState("");

  useEffect(() => { loadOrders(); }, []);

  async function loadOrders() {
    const data = await fetch("/api/orders").then((r) => r.json());
    setOrders(Array.isArray(data) ? data : []);
  }

  async function updateStatus(orderId: string, status: string) {
    await fetch(`/api/orders/${orderId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    loadOrders();
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Pedidos</h1>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar vendedor..."
          className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-violet-500 outline-none" />
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-violet-500 outline-none">
          <option value="todos">Todos</option>
          <option value="pendente">Pendente</option>
          <option value="aprovado">Aprovado</option>
          <option value="separado">Separado</option>
          <option value="entregue">Entregue</option>
          <option value="cancelado">Cancelado</option>
        </select>
      </div>

      <div className="space-y-4">
        {orders.filter((o) => {
          if (filterStatus !== "todos" && o.status !== filterStatus) return false;
          if (search && !o.user.name.toLowerCase().includes(search.toLowerCase())) return false;
          return true;
        }).map((order) => {
          const statusInfo = ORDER_STATUS[order.status] || { label: order.status, color: "bg-gray-100 text-gray-800" };
          const expanded = expandedId === order.id;

          return (
            <div key={order.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-2 cursor-pointer hover:bg-gray-50"
                onClick={() => setExpandedId(expanded ? null : order.id)}
              >
                <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                  <div className="shrink-0">
                    <span className="text-sm font-bold text-gray-800">#{order.id.slice(-6)}</span>
                    <p className="text-xs text-gray-500">{formatDate(order.createdAt)}</p>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-700 truncate">{order.user.name}</p>
                    <p className="text-xs text-gray-500">{order.items.length} item(ns)</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-sm font-bold text-gray-800">{formatCurrency(order.total)}</span>
                  <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
                    {statusInfo.label}
                  </span>
                </div>
              </div>

              {expanded && (
                <div className="border-t border-gray-200 p-4 bg-gray-50 overflow-x-auto">
                  <table className="w-full mb-4 min-w-[400px]">
                    <thead>
                      <tr className="text-xs text-gray-500">
                        <th className="text-left pb-2">Produto</th>
                        <th className="text-left pb-2">Categoria</th>
                        <th className="text-left pb-2">Qtd</th>
                        <th className="text-left pb-2">Preço Un.</th>
                        <th className="text-left pb-2">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {order.items.map((item) => (
                        <tr key={item.id} className="border-t border-gray-200">
                          <td className="py-2 font-medium">{item.product.name}</td>
                          <td className="py-2 text-gray-500">{item.product.category.name}</td>
                          <td className="py-2">{item.quantity}</td>
                          <td className="py-2">{formatCurrency(item.price)}</td>
                          <td className="py-2 font-medium">{formatCurrency(item.price * item.quantity)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {order.notes && (
                    <p className="text-sm text-gray-600 mb-4">
                      <strong>Obs:</strong> {order.notes}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-2">
                    {order.status === "pendente" && (
                      <>
                        <button onClick={() => updateStatus(order.id, "aprovado")} className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-blue-700 transition">
                          Aprovar
                        </button>
                        <button onClick={() => updateStatus(order.id, "cancelado")} className="bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-red-700 transition">
                          Cancelar
                        </button>
                      </>
                    )}
                    {order.status === "aprovado" && (
                      <button onClick={() => updateStatus(order.id, "separado")} className="bg-purple-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-purple-700 transition">
                        Marcar como Separado
                      </button>
                    )}
                    {order.status === "separado" && (
                      <button onClick={() => updateStatus(order.id, "entregue")} className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-green-700 transition">
                        Marcar como Entregue
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {orders.length === 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500">
            Nenhum pedido registrado
          </div>
        )}
      </div>
    </div>
  );
}
