"use client";

import { useEffect, useState } from "react";
import { formatCurrency } from "@/lib/utils";

interface CustomerData {
  name: string;
  email: string;
  tokens: number;
  referralCode: string;
  _count: { referrals: number; purchases: number };
}

export default function ClienteHome() {
  const [customer, setCustomer] = useState<CustomerData | null>(null);

  useEffect(() => {
    fetch("/api/customer/me")
      .then((r) => r.json())
      .then((d) => setCustomer(d.customer));
  }, []);

  if (!customer) return null;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        Olá, {customer.name}!
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="text-3xl mb-2">🪙</div>
          <p className="text-sm text-gray-500">Seus Tokens</p>
          <p className="text-3xl font-bold text-emerald-600">{customer.tokens}</p>
          <p className="text-xs text-gray-400 mt-1">
            Vale {formatCurrency(customer.tokens * 0.5)} em desconto
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="text-3xl mb-2">📦</div>
          <p className="text-sm text-gray-500">Compras</p>
          <p className="text-3xl font-bold text-blue-600">{customer._count.purchases}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="text-3xl mb-2">🤝</div>
          <p className="text-sm text-gray-500">Amigos Indicados</p>
          <p className="text-3xl font-bold text-purple-600">{customer._count.referrals}</p>
        </div>
      </div>

      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl p-6 text-white">
        <h2 className="text-lg font-bold mb-2">Seu Código de Indicação</h2>
        <div className="bg-white/20 rounded-lg px-4 py-3 text-2xl font-mono font-bold tracking-wider text-center">
          {customer.referralCode}
        </div>
        <p className="text-sm mt-2 opacity-90">
          Compartilhe com amigos! Você ganha 15 tokens e seu amigo ganha 10 tokens.
        </p>
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        <a
          href="/cliente/lojas"
          className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition block"
        >
          <h3 className="font-bold text-gray-800 mb-1">📍 Encontre uma Loja</h3>
          <p className="text-sm text-gray-500">
            Veja onde retirar seus picolés
          </p>
        </a>
        <a
          href="/cliente/comprar"
          className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition block"
        >
          <h3 className="font-bold text-gray-800 mb-1">🛒 Comprar Agora</h3>
          <p className="text-sm text-gray-500">
            Escolha seus picolés favoritos
          </p>
        </a>
      </div>
    </div>
  );
}
