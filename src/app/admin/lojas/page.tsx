"use client";

import { useEffect, useState } from "react";

interface Store {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  phone: string | null;
  active: boolean;
  vendor: { name: string };
}

interface Vendor {
  id: string;
  name: string;
  email: string;
}

export default function LojasAdminPage() {
  const [stores, setStores] = useState<Store[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    address: "",
    city: "",
    state: "SP",
    phone: "",
    vendorId: "",
  });

  useEffect(() => {
    Promise.all([
      fetch("/api/stores").then((r) => r.json()),
      fetch("/api/users").then((r) => r.json()),
    ]).then(([storeData, userData]) => {
      setStores(storeData.stores || []);
      setVendors(
        (userData.users || []).filter((u: Vendor & { role: string }) => u.role === "vendedor")
      );
      setLoading(false);
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/stores", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      const data = await res.json();
      setStores((prev) => [...prev, { ...data.store, vendor: vendors.find((v) => v.id === form.vendorId) || { name: "?" } }]);
      setShowForm(false);
      setForm({ name: "", address: "", city: "", state: "SP", phone: "", vendorId: "" });
    } else {
      const err = await res.json();
      alert(err.error || "Erro ao criar loja");
    }
  }

  if (loading) {
    return <div className="text-center py-12 text-gray-500">Carregando...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">📍 Lojas Parceiras</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-violet-600 text-white rounded-lg text-sm font-medium hover:bg-violet-700"
        >
          {showForm ? "Cancelar" : "Nova Loja"}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl shadow-sm border p-6 mb-6 grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Loja</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Endereço</label>
            <input
              type="text"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cidade</label>
            <input
              type="text"
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
            <input
              type="text"
              value={form.state}
              onChange={(e) => setForm({ ...form, state: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg text-sm"
              maxLength={2}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
            <input
              type="text"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Vendedor Responsável</label>
            <select
              value={form.vendorId}
              onChange={(e) => setForm({ ...form, vendorId: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg text-sm"
              required
            >
              <option value="">Selecione...</option>
              {vendors.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name} ({v.email})
                </option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <button
              type="submit"
              className="px-6 py-2 bg-violet-600 text-white rounded-lg text-sm font-medium hover:bg-violet-700"
            >
              Criar Loja
            </button>
          </div>
        </form>
      )}

      {stores.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Nenhuma loja cadastrada</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden overflow-x-auto">
          <table className="w-full text-sm min-w-[600px]">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Loja</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Endereço</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Cidade</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Vendedor</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Telefone</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {stores.map((store) => (
                <tr key={store.id}>
                  <td className="px-4 py-3 font-medium">{store.name}</td>
                  <td className="px-4 py-3 text-gray-600">{store.address}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {store.city}/{store.state}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{store.vendor.name}</td>
                  <td className="px-4 py-3 text-gray-600">{store.phone || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
