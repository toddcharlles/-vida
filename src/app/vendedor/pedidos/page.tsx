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
  items: OrderItem[];
}

export default function MeusPedidosPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/orders").then((r) => r.json()).then((data) => {
      setOrders(Array.isArray(data) ? data : []);
    });
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Meus Pedidos</h1>

      <div className="space-y-4">
        {orders.map((order) => {
          const statusInfo = ORDER_STATUS[order.status] || { label: order.status, color: "bg-gray-100 text-gray-800" };
          const expanded = expandedId === order.id;

          return (
            <div key={order.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
                onClick={() => setExpandedId(expanded ? null : order.id)}
              >
                <div className="flex items-center gap-4">
                  <div>
                    <span className="text-sm font-bold text-gray-800">Pedido #{order.id.slice(-6)}</span>
                    <p className="text-xs text-gray-500">{formatDate(order.createdAt)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-gray-800">{formatCurrency(order.total)}</span>
                  <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
                    {statusInfo.label}
                  </span>
                </div>
              </div>

              {expanded && (
                <div className="border-t border-gray-200 p-4 bg-gray-50">
                  <table className="w-full">
                    <thead>
                      <tr className="text-xs text-gray-500">
                        <th className="text-left pb-2">Produto</th>
                        <th className="text-left pb-2">Qtd</th>
                        <th className="text-left pb-2">Preço Un.</th>
                        <th className="text-left pb-2">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {order.items.map((item) => (
                        <tr key={item.id} className="border-t border-gray-200">
                          <td className="py-2 font-medium">{item.product.name}</td>
                          <td className="py-2">{item.quantity}</td>
                          <td className="py-2">{formatCurrency(item.price)}</td>
                          <td className="py-2 font-medium">{formatCurrency(item.price * item.quantity)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {order.notes && (
                    <p className="text-sm text-gray-600 mt-3">
                      <strong>Obs:</strong> {order.notes}
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {orders.length === 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500">
            Você ainda não fez nenhum pedido
          </div>
        )}
      </div>
    </div>
  );
}
