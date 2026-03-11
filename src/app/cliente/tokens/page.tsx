"use client";

import { useEffect, useState } from "react";
import { formatCurrency, formatDate } from "@/lib/utils";

interface TokenTx {
  id: string;
  type: string;
  amount: number;
  description: string;
  createdAt: string;
}

const TYPE_LABELS: Record<string, { label: string; icon: string }> = {
  compra: { label: "Compra", icon: "🛒" },
  indicacao: { label: "Indicação", icon: "🤝" },
  resgate: { label: "Resgate", icon: "🎁" },
  bonus: { label: "Bônus", icon: "⭐" },
};

export default function TokensPage() {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<TokenTx[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/tokens")
      .then((r) => r.json())
      .then((d) => {
        setBalance(d.balance || 0);
        setTransactions(d.transactions || []);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="text-center py-12 text-gray-500">Carregando...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">🪙 Meus Tokens</h1>

      <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl p-6 text-white mb-8">
        <p className="text-sm opacity-90">Saldo atual</p>
        <p className="text-4xl font-bold">{balance} tokens</p>
        <p className="text-sm mt-1 opacity-90">
          Equivalente a {formatCurrency(balance * 0.5)} em desconto
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
        <h2 className="font-bold text-gray-700 mb-3">Como ganhar tokens</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          <div className="bg-emerald-50 rounded-lg p-4">
            <p className="font-bold text-emerald-700">🛒 Comprando</p>
            <p className="text-emerald-600">1 token por R$1 gasto</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <p className="font-bold text-purple-700">🤝 Indicando</p>
            <p className="text-purple-600">15 tokens por amigo</p>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4">
            <p className="font-bold text-yellow-700">🎁 Sendo indicado</p>
            <p className="text-yellow-600">10 tokens de boas-vindas</p>
          </div>
        </div>
      </div>

      <h2 className="font-bold text-gray-700 mb-3">Histórico</h2>
      {transactions.length === 0 ? (
        <p className="text-gray-400 text-sm">Nenhuma transação ainda</p>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border divide-y">
          {transactions.map((tx) => {
            const typeInfo = TYPE_LABELS[tx.type] || {
              label: tx.type,
              icon: "🪙",
            };
            return (
              <div key={tx.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{typeInfo.icon}</span>
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      {tx.description}
                    </p>
                    <p className="text-xs text-gray-400">
                      {formatDate(tx.createdAt)}
                    </p>
                  </div>
                </div>
                <span
                  className={`font-bold ${
                    tx.amount > 0 ? "text-emerald-600" : "text-red-600"
                  }`}
                >
                  {tx.amount > 0 ? "+" : ""}
                  {tx.amount}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
