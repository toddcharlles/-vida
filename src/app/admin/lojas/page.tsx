"use client";

import { useEffect, useState, useCallback } from "react";

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
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ name: "", address: "", city: "", state: "SP", phone: "", vendorId: "" });

  const load = useCallback(async () => {
    const [storeData, userData] = await Promise.all([
      fetch("/api/stores").then((r) => r.json()),
      fetch("/api/users").then((r) => r.json()),
    ]);
    setStores(storeData.stores || []);
    setVendors((userData || []).filter((u: Vendor & { role: string }) => u.role === "vendedor"));
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (editingId) {
      const res = await fetch(`/api/stores/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) { cancelForm(); load(); }
      else { const err = await res.json(); alert(err.error); }
    } else {
      const res = await fetch("/api/stores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) { cancelForm(); load(); }
      else { const err = await res.json(); alert(err.error); }
    }
  }

  async function toggleActive(store: Store) {
    await fetch(`/api/stores/${store.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !store.active }),
    });
    load();
  }

  function startEdit(store: Store) {
    setEditingId(store.id);
    setForm({ name: store.name, address: store.address, city: store.city, state: store.state, phone: store.phone || "", vendorId: "" });
    setShowForm(true);
  }

  function cancelForm() {
    setShowForm(false);
    setEditingId(null);
    setForm({ name: "", address: "", city: "", state: "SP", phone: "", vendorId: "" });
  }

  const filtered = stores.filter((s) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return s.name.toLowerCase().includes(q) || s.city.toLowerCase().includes(q) || s.vendor.name.toLowerCase().includes(q);
  });

  if (loading) return <div className="text-center py-12 text-gray-500">Carregando...</div>;

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Lojas Parceiras</h1>
        {!showForm && (
          <button onClick={() => { setShowForm(true); setEditingId(null); }}
            className="px-4 py-2 bg-violet-600 text-white rounded-lg text-sm font-medium hover:bg-violet-700">
            Nova Loja
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border p-6 mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Loja</label>
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg text-sm" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Endereco</label>
            <input type="text" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg text-sm" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cidade</label>
            <input type="text" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg text-sm" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
            <input type="text" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg text-sm" maxLength={2} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
            <input type="text" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg text-sm" />
          </div>
          {!editingId && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vendedor Responsavel</label>
              <select value={form.vendorId} onChange={(e) => setForm({ ...form, vendorId: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm" required>
                <option value="">Selecione...</option>
                {vendors.map((v) => <option key={v.id} value={v.id}>{v.name} ({v.email})</option>)}
              </select>
            </div>
          )}
          <div className="md:col-span-2 flex gap-2">
            <button type="submit" className="px-6 py-2 bg-violet-600 text-white rounded-lg text-sm font-medium hover:bg-violet-700">
              {editingId ? "Salvar" : "Criar Loja"}
            </button>
            <button type="button" onClick={cancelForm} className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200">
              Cancelar
            </button>
          </div>
        </form>
      )}

      <div className="mb-4">
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar loja, cidade ou vendedor..."
          className="w-full sm:w-80 px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-violet-500 outline-none" />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12"><p className="text-gray-500">Nenhuma loja encontrada</p></div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden overflow-x-auto">
          <table className="w-full text-sm min-w-[650px]">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Loja</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Endereco</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Cidade</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Vendedor</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Acoes</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((store) => (
                <tr key={store.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{store.name}</td>
                  <td className="px-4 py-3 text-gray-600">{store.address}</td>
                  <td className="px-4 py-3 text-gray-600">{store.city}/{store.state}</td>
                  <td className="px-4 py-3 text-gray-600">{store.vendor.name}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggleActive(store)}
                      className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium cursor-pointer transition ${store.active ? "bg-green-50 text-green-700 hover:bg-green-100" : "bg-red-50 text-red-700 hover:bg-red-100"}`}>
                      {store.active ? "Ativa" : "Inativa"}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => startEdit(store)} className="text-violet-600 hover:text-violet-800 text-sm font-medium">
                      Editar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
