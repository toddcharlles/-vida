"use client";

import { useEffect, useState } from "react";

interface Store {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  phone: string | null;
  vendor: { name: string };
}

export default function LojasPage() {
  const [stores, setStores] = useState<Store[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStores();
  }, []);

  async function fetchStores(city?: string) {
    setLoading(true);
    const url = city ? `/api/stores?city=${encodeURIComponent(city)}` : "/api/stores";
    const res = await fetch(url);
    const data = await res.json();
    setStores(data.stores || []);
    setLoading(false);
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    fetchStores(search || undefined);
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        📍 Lojas Parceiras
      </h1>

      <form onSubmit={handleSearch} className="mb-6 flex gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por cidade..."
          className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
        />
        <button
          type="submit"
          className="px-6 py-2.5 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition"
        >
          Buscar
        </button>
      </form>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Carregando...</div>
      ) : stores.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-3">🏪</div>
          <p className="text-gray-500">Nenhuma loja encontrada</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {stores.map((store) => (
            <div
              key={store.id}
              className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition"
            >
              <h3 className="font-bold text-gray-800 text-lg mb-2">
                {store.name}
              </h3>
              <div className="space-y-1 text-sm text-gray-600">
                <p>📍 {store.address}</p>
                <p>
                  🏙️ {store.city} - {store.state}
                </p>
                {store.phone && <p>📞 {store.phone}</p>}
                <p>👤 Vendedor: {store.vendor.name}</p>
              </div>
              <a
                href={`/cliente/comprar?storeId=${store.id}`}
                className="mt-4 inline-block px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition"
              >
                Comprar nesta loja
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
