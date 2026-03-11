"use client";

import { useEffect, useState } from "react";

interface Card {
  id: string;
  collectionNumber: number;
  name: string;
  element: string;
  attack: number;
  defense: number;
  rarity: string;
  description: string | null;
  qrCode: string;
  tokenReward: number;
  totalPrinted: number;
  active: boolean;
  season: { name: string; number: number };
  faction: { name: string; color: string; icon: string };
  _count: { customerCards: number };
}

interface Season { id: string; name: string; number: number; }
interface Faction { id: string; name: string; icon: string; }

const RARITIES = [
  { value: "comum", label: "Comum", color: "bg-gray-100 text-gray-700", prob: "70%" },
  { value: "raro", label: "Raro", color: "bg-blue-100 text-blue-700", prob: "20%" },
  { value: "holografico", label: "Holográfico", color: "bg-purple-100 text-purple-700", prob: "7%" },
  { value: "lendario", label: "Lendário", color: "bg-amber-100 text-amber-700", prob: "2%" },
  { value: "secreto", label: "Secreto", color: "bg-red-100 text-red-700", prob: "1%" },
];

const emptyForm = {
  seasonId: "", factionId: "", collectionNumber: "", name: "", element: "",
  attack: "50", defense: "50", rarity: "comum", description: "", totalPrinted: "0",
};

export default function CartasPage() {
  const [cards, setCards] = useState<Card[]>([]);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [factions, setFactions] = useState<Faction[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [filterSeason, setFilterSeason] = useState("");
  const [filterRarity, setFilterRarity] = useState("");

  useEffect(() => { load(); }, []);

  async function load() {
    const [c, s, f] = await Promise.all([
      fetch("/api/liga/cards").then((r) => r.json()),
      fetch("/api/liga/seasons").then((r) => r.json()),
      fetch("/api/liga/factions").then((r) => r.json()),
    ]);
    setCards(Array.isArray(c) ? c : []);
    setSeasons(Array.isArray(s) ? s : []);
    setFactions(Array.isArray(f) ? f : []);
  }

  async function createCard(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/liga/cards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setForm(emptyForm);
      setShowForm(false);
      load();
    } else {
      const err = await res.json();
      alert(err.error);
    }
  }

  const filtered = cards.filter((c) => {
    if (search && !c.name.toLowerCase().includes(search.toLowerCase()) && !c.element.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterSeason && c.season.number !== parseInt(filterSeason)) return false;
    if (filterRarity && c.rarity !== filterRarity) return false;
    return true;
  });

  const rarityInfo = (r: string) => RARITIES.find((x) => x.value === r) || RARITIES[0];

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Cartas Colecionáveis</h1>
          <p className="text-sm text-gray-500">{cards.length} cartas criadas</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="bg-violet-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-violet-700 transition">
          + Nova Carta
        </button>
      </div>

      {showForm && (
        <form onSubmit={createCard} className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 mb-6">
          <h2 className="font-semibold text-gray-800 mb-4">Criar Nova Carta</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Temporada</label>
              <select value={form.seasonId} onChange={(e) => setForm({ ...form, seasonId: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-violet-500 outline-none" required>
                <option value="">Selecione</option>
                {seasons.map((s) => <option key={s.id} value={s.id}>#{s.number} - {s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Facção</label>
              <select value={form.factionId} onChange={(e) => setForm({ ...form, factionId: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-violet-500 outline-none" required>
                <option value="">Selecione</option>
                {factions.map((f) => <option key={f.id} value={f.id}>{f.icon} {f.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nº Coleção</label>
              <input type="number" min="1" value={form.collectionNumber} onChange={(e) => setForm({ ...form, collectionNumber: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-violet-500 outline-none" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Personagem</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="SAMURAI DO AÇAÍ" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-violet-500 outline-none" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Elemento</label>
              <input value={form.element} onChange={(e) => setForm({ ...form, element: e.target.value })} placeholder="Fruta Sombria" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-violet-500 outline-none" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Raridade</label>
              <select value={form.rarity} onChange={(e) => setForm({ ...form, rarity: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-violet-500 outline-none">
                {RARITIES.map((r) => <option key={r.value} value={r.value}>{r.label} ({r.prob})</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ataque</label>
              <input type="number" min="1" max="100" value={form.attack} onChange={(e) => setForm({ ...form, attack: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-violet-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Defesa</label>
              <input type="number" min="1" max="100" value={form.defense} onChange={(e) => setForm({ ...form, defense: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-violet-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Total Impresso</label>
              <input type="number" min="0" value={form.totalPrinted} onChange={(e) => setForm({ ...form, totalPrinted: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-violet-500 outline-none" />
            </div>
            <div className="sm:col-span-2 lg:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
              <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Guerreiro misterioso das frutas sombrias..." className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-violet-500 outline-none" />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button type="submit" className="bg-violet-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-violet-700">Criar Carta</button>
            <button type="button" onClick={() => setShowForm(false)} className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium">Cancelar</button>
          </div>
        </form>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por nome ou elemento..." className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-violet-500 outline-none" />
        <select value={filterSeason} onChange={(e) => setFilterSeason(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-violet-500 outline-none">
          <option value="">Todas temporadas</option>
          {seasons.map((s) => <option key={s.id} value={s.number}>#{s.number}</option>)}
        </select>
        <select value={filterRarity} onChange={(e) => setFilterRarity(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-violet-500 outline-none">
          <option value="">Todas raridades</option>
          {RARITIES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
        </select>
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((card) => {
          const ri = rarityInfo(card.rarity);
          return (
            <div key={card.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition">
              <div className="bg-gradient-to-r from-gray-800 to-gray-700 px-4 py-3 flex items-center justify-between">
                <span className="text-white font-mono text-sm">#{String(card.collectionNumber).padStart(3, "0")}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${ri.color}`}>{ri.label}</span>
              </div>
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{card.faction.icon}</span>
                  <h3 className="font-bold text-gray-800 text-sm">{card.name}</h3>
                </div>
                <p className="text-xs text-gray-500 mb-3">{card.element} | {card.faction.name}</p>
                {card.description && <p className="text-xs text-gray-400 mb-3">{card.description}</p>}

                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="bg-red-50 rounded-lg p-2 text-center">
                    <p className="text-xs text-red-500">ATK</p>
                    <p className="font-bold text-red-700">{card.attack}</p>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-2 text-center">
                    <p className="text-xs text-blue-500">DEF</p>
                    <p className="font-bold text-blue-700">{card.defense}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>T{card.season.number}</span>
                  <span>{card.tokenReward} tokens</span>
                  <span>{card._count.customerCards} escaneadas</span>
                </div>
                <div className="mt-2 text-xs font-mono text-gray-300 truncate">{card.qrCode}</div>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg font-medium mb-1">Nenhuma carta encontrada</p>
          <p className="text-sm">Crie temporadas e facções primeiro, depois adicione cartas.</p>
        </div>
      )}
    </div>
  );
}
