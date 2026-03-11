"use client";

import { useEffect, useState, useCallback } from "react";

interface Store {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  phone: string | null;
  lat: number | null;
  lng: number | null;
}

export default function MinhaLojaPage() {
  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState({
    name: "",
    address: "",
    city: "",
    state: "SP",
    phone: "",
    lat: "",
    lng: "",
  });

  const loadStore = useCallback(async () => {
    const res = await fetch("/api/vendor/store");
    const data = await res.json();
    if (data.store) {
      setStore(data.store);
      setForm({
        name: data.store.name,
        address: data.store.address,
        city: data.store.city,
        state: data.store.state,
        phone: data.store.phone || "",
        lat: data.store.lat?.toString() || "",
        lng: data.store.lng?.toString() || "",
      });
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadStore();
  }, [loadStore]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSuccess("");

    const res = await fetch("/api/vendor/store", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      const data = await res.json();
      setStore(data.store);
      setSuccess(store ? "Loja atualizada com sucesso!" : "Loja criada com sucesso!");
    } else {
      const err = await res.json();
      alert(err.error || "Erro ao salvar");
    }
    setSaving(false);
  }

  function handleSearchAddress() {
    const query = `${form.address}, ${form.city}, ${form.state}, Brasil`;
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
    window.open(url, "_blank");
  }

  if (loading) {
    return <div className="text-center py-12 text-gray-500">Carregando...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Minha Loja</h1>

      {success && (
        <div className="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border p-6 max-w-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome da Loja *
            </label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none"
              placeholder="Ex: Loja Fit Center"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Endereco *
            </label>
            <input
              type="text"
              required
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none"
              placeholder="Rua, número, bairro"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cidade *
            </label>
            <input
              type="text"
              required
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none"
              placeholder="São Paulo"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado
            </label>
            <input
              type="text"
              value={form.state}
              onChange={(e) => setForm({ ...form, state: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none"
              placeholder="SP"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Telefone
            </label>
            <input
              type="text"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none"
              placeholder="(11) 99999-9999"
            />
          </div>

          <div className="md:col-span-2">
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-gray-700">
                Coordenadas (para Google Maps)
              </label>
              {form.address && form.city && (
                <button
                  type="button"
                  onClick={handleSearchAddress}
                  className="text-xs text-violet-600 hover:text-violet-800 font-medium"
                >
                  Buscar no Google Maps
                </button>
              )}
            </div>
            <p className="text-xs text-gray-500 mb-2">
              Abra o Google Maps, clique com botao direito no local da loja e copie as coordenadas.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                value={form.lat}
                onChange={(e) => setForm({ ...form, lat: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none"
                placeholder="Latitude (ex: -23.5505)"
              />
              <input
                type="text"
                value={form.lng}
                onChange={(e) => setForm({ ...form, lng: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none"
                placeholder="Longitude (ex: -46.6333)"
              />
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center gap-4">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-violet-600 text-white rounded-lg font-medium hover:bg-violet-700 transition disabled:opacity-50"
          >
            {saving ? "Salvando..." : store ? "Atualizar Loja" : "Criar Loja"}
          </button>
          {store && (
            <span className="text-sm text-gray-500">
              Loja ativa desde {new Date(store.id).toLocaleDateString("pt-BR") || "a criacao"}
            </span>
          )}
        </div>
      </form>

      {store && store.lat && store.lng && (
        <div className="mt-6 bg-white rounded-xl shadow-sm border p-6 max-w-2xl">
          <h2 className="font-bold text-gray-700 mb-3">Localizacao no Mapa</h2>
          <iframe
            width="100%"
            height="300"
            style={{ border: 0, borderRadius: "0.75rem" }}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            src={`https://www.google.com/maps?q=${store.lat},${store.lng}&z=15&output=embed`}
          />
        </div>
      )}
    </div>
  );
}
