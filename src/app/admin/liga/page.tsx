"use client";

import { useEffect, useState } from "react";

interface Season {
  id: string;
  name: string;
  number: number;
  totalCards: number;
  active: boolean;
  _count: { cards: number };
}

interface Faction {
  id: string;
  name: string;
  description: string | null;
  color: string;
  icon: string;
  _count: { cards: number };
}

export default function LigaDashboardPage() {
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [factions, setFactions] = useState<Faction[]>([]);
  const [seasonForm, setSeasonForm] = useState({ name: "", number: "", totalCards: "100" });
  const [factionForm, setFactionForm] = useState({ name: "", description: "", color: "#8B5CF6", icon: "⚔️" });
  const [showSeasonForm, setShowSeasonForm] = useState(false);
  const [showFactionForm, setShowFactionForm] = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    const [s, f] = await Promise.all([
      fetch("/api/liga/seasons").then((r) => r.json()),
      fetch("/api/liga/factions").then((r) => r.json()),
    ]);
    setSeasons(Array.isArray(s) ? s : []);
    setFactions(Array.isArray(f) ? f : []);
  }

  async function createSeason(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/liga/seasons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(seasonForm),
    });
    setSeasonForm({ name: "", number: "", totalCards: "100" });
    setShowSeasonForm(false);
    load();
  }

  async function createFaction(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/liga/factions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(factionForm),
    });
    setFactionForm({ name: "", description: "", color: "#8B5CF6", icon: "⚔️" });
    setShowFactionForm(false);
    load();
  }

  const totalCards = seasons.reduce((sum, s) => sum + s._count.cards, 0);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Liga das Paletas</h1>
      <p className="text-gray-500 text-sm mb-6">Gerencie temporadas, facções, cartas colecionáveis e palitos dourados.</p>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-violet-50 rounded-xl border border-violet-200 p-4">
          <p className="text-sm text-violet-600 font-medium">Temporadas</p>
          <p className="text-2xl font-bold text-violet-700">{seasons.length}</p>
        </div>
        <div className="bg-blue-50 rounded-xl border border-blue-200 p-4">
          <p className="text-sm text-blue-600 font-medium">Facções</p>
          <p className="text-2xl font-bold text-blue-700">{factions.length}</p>
        </div>
        <div className="bg-amber-50 rounded-xl border border-amber-200 p-4">
          <p className="text-sm text-amber-600 font-medium">Cartas Criadas</p>
          <p className="text-2xl font-bold text-amber-700">{totalCards}</p>
        </div>
        <div className="bg-green-50 rounded-xl border border-green-200 p-4">
          <p className="text-sm text-green-600 font-medium">Links Rápidos</p>
          <div className="flex flex-col gap-1 mt-1">
            <a href="/admin/liga/cartas" className="text-sm text-green-700 hover:underline font-medium">Gerenciar Cartas</a>
            <a href="/admin/liga/palitos" className="text-sm text-green-700 hover:underline font-medium">Palitos Dourados</a>
          </div>
        </div>
      </div>

      {/* Seasons */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-800">Temporadas</h2>
          <button onClick={() => setShowSeasonForm(!showSeasonForm)} className="bg-violet-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-violet-700 transition">
            + Nova Temporada
          </button>
        </div>

        {showSeasonForm && (
          <form onSubmit={createSeason} className="bg-white rounded-xl border border-gray-200 p-4 mb-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
              <input value={seasonForm.name} onChange={(e) => setSeasonForm({ ...seasonForm, name: e.target.value })} placeholder="Temporada 1 - Origens" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-violet-500 outline-none" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Número</label>
              <input type="number" value={seasonForm.number} onChange={(e) => setSeasonForm({ ...seasonForm, number: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-violet-500 outline-none" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Total de Cartas</label>
              <input type="number" value={seasonForm.totalCards} onChange={(e) => setSeasonForm({ ...seasonForm, totalCards: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-violet-500 outline-none" />
            </div>
            <div className="sm:col-span-3 flex gap-2">
              <button type="submit" className="bg-violet-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-violet-700">Criar</button>
              <button type="button" onClick={() => setShowSeasonForm(false)} className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium">Cancelar</button>
            </div>
          </form>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {seasons.map((s) => (
            <div key={s.id} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-gray-800">#{s.number}</h3>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${s.active ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                  {s.active ? "Ativa" : "Encerrada"}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-2">{s.name}</p>
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <span>{s._count.cards}/{s.totalCards} cartas</span>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div className="bg-violet-500 h-2 rounded-full" style={{ width: `${Math.min(100, (s._count.cards / s.totalCards) * 100)}%` }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Factions */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-800">Facções</h2>
          <button onClick={() => setShowFactionForm(!showFactionForm)} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition">
            + Nova Facção
          </button>
        </div>

        {showFactionForm && (
          <form onSubmit={createFaction} className="bg-white rounded-xl border border-gray-200 p-4 mb-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
              <input value={factionForm.name} onChange={(e) => setFactionForm({ ...factionForm, name: e.target.value })} placeholder="Frutas" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
              <input value={factionForm.description} onChange={(e) => setFactionForm({ ...factionForm, description: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cor</label>
              <input type="color" value={factionForm.color} onChange={(e) => setFactionForm({ ...factionForm, color: e.target.value })} className="w-full h-10 rounded-lg cursor-pointer" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ícone</label>
              <input value={factionForm.icon} onChange={(e) => setFactionForm({ ...factionForm, icon: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div className="sm:col-span-2 lg:col-span-4 flex gap-2">
              <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">Criar</button>
              <button type="button" onClick={() => setShowFactionForm(false)} className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium">Cancelar</button>
            </div>
          </form>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {factions.map((f) => (
            <div key={f.id} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl" style={{ backgroundColor: f.color + "20" }}>
                {f.icon}
              </div>
              <div>
                <h3 className="font-bold text-gray-800">{f.name}</h3>
                {f.description && <p className="text-xs text-gray-500">{f.description}</p>}
                <p className="text-xs text-gray-400 mt-1">{f._count.cards} cartas</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
