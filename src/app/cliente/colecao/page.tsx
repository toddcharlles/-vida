"use client";

import { useEffect, useState } from "react";

interface CardData {
  id: string;
  collectionNumber: number;
  name: string;
  element: string;
  attack: number;
  defense: number;
  rarity: string;
  description: string | null;
  tokenReward: number;
  season: { name: string; number: number };
  faction: { name: string; color: string; icon: string };
}

interface CustomerCard {
  id: string;
  cardId: string;
  isDuplicate: boolean;
  scannedAt: string;
  card: CardData;
}

interface Stats {
  total: number;
  unique: number;
  duplicates: number;
  rarityCount: Record<string, number>;
}

const RARITY_COLORS: Record<string, string> = {
  comum: "from-gray-400 to-gray-500",
  raro: "from-blue-400 to-blue-600",
  holografico: "from-purple-400 to-pink-500",
  lendario: "from-amber-400 to-orange-600",
  secreto: "from-red-500 to-rose-700",
};

const RARITY_BORDER: Record<string, string> = {
  comum: "border-gray-300",
  raro: "border-blue-400",
  holografico: "border-purple-400 shadow-purple-200 shadow-lg",
  lendario: "border-amber-400 shadow-amber-200 shadow-lg",
  secreto: "border-red-500 shadow-red-200 shadow-xl",
};

const RARITY_LABELS: Record<string, string> = {
  comum: "Comum", raro: "Raro", holografico: "Holográfico",
  lendario: "Lendário", secreto: "Secreto",
};

export default function ColecaoPage() {
  const [data, setData] = useState<{ cards: CustomerCard[]; stats: Stats } | null>(null);
  const [selectedCard, setSelectedCard] = useState<CustomerCard | null>(null);
  const [filterRarity, setFilterRarity] = useState("");

  useEffect(() => {
    fetch("/api/customer/cards").then((r) => r.json()).then(setData);
  }, []);

  if (!data) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div></div>;
  }

  const uniqueCards = data.cards.filter((c) => !c.isDuplicate);
  const filtered = filterRarity ? uniqueCards.filter((c) => c.card.rarity === filterRarity) : uniqueCards;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Minha Coleção</h1>
      <p className="text-sm text-gray-500 mb-6">Liga das Paletas - suas cartas colecionáveis</p>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <div className="bg-emerald-50 rounded-xl border border-emerald-200 p-4 text-center">
          <p className="text-xs text-emerald-600 font-medium">Cartas Únicas</p>
          <p className="text-2xl font-bold text-emerald-700">{data.stats.unique}</p>
        </div>
        <div className="bg-blue-50 rounded-xl border border-blue-200 p-4 text-center">
          <p className="text-xs text-blue-600 font-medium">Total Escaneado</p>
          <p className="text-2xl font-bold text-blue-700">{data.stats.total}</p>
        </div>
        <div className="bg-amber-50 rounded-xl border border-amber-200 p-4 text-center">
          <p className="text-xs text-amber-600 font-medium">Duplicatas</p>
          <p className="text-2xl font-bold text-amber-700">{data.stats.duplicates}</p>
        </div>
        <div className="bg-purple-50 rounded-xl border border-purple-200 p-4 text-center">
          <p className="text-xs text-purple-600 font-medium">Raras+</p>
          <p className="text-2xl font-bold text-purple-700">
            {(data.stats.rarityCount.raro || 0) + (data.stats.rarityCount.holografico || 0) + (data.stats.rarityCount.lendario || 0) + (data.stats.rarityCount.secreto || 0)}
          </p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <button onClick={() => setFilterRarity("")} className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${!filterRarity ? "bg-gray-800 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
          Todas ({uniqueCards.length})
        </button>
        {Object.entries(RARITY_LABELS).map(([key, label]) => (
          <button key={key} onClick={() => setFilterRarity(key)} className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${filterRarity === key ? "bg-gray-800 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
            {label} ({data.stats.rarityCount[key] || 0})
          </button>
        ))}
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {filtered.map((cc) => {
          const card = cc.card;
          return (
            <div
              key={cc.id}
              onClick={() => setSelectedCard(cc)}
              className={`bg-white rounded-xl border-2 overflow-hidden cursor-pointer hover:scale-105 transition-transform ${RARITY_BORDER[card.rarity] || "border-gray-200"}`}
            >
              <div className={`bg-gradient-to-br ${RARITY_COLORS[card.rarity]} px-3 py-2 flex items-center justify-between`}>
                <span className="text-white font-mono text-xs font-bold">#{String(card.collectionNumber).padStart(3, "0")}</span>
                <span className="text-white/80 text-xs">{card.faction.icon}</span>
              </div>
              <div className="p-3">
                <h3 className="font-bold text-gray-800 text-xs sm:text-sm leading-tight mb-1">{card.name}</h3>
                <p className="text-xs text-gray-400 mb-2">{card.element}</p>
                <div className="flex gap-2 text-xs">
                  <span className="bg-red-50 text-red-600 px-1.5 py-0.5 rounded font-bold">ATK {card.attack}</span>
                  <span className="bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-bold">DEF {card.defense}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p className="text-4xl mb-3">🃏</p>
          <p className="font-medium">Nenhuma carta na coleção</p>
          <p className="text-sm mt-1">Escaneie o QR Code das suas paletas para colecionar!</p>
          <a href="/cliente/scan" className="inline-block mt-4 bg-emerald-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700">
            Escanear Carta
          </a>
        </div>
      )}

      {/* Card Detail Modal */}
      {selectedCard && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedCard(null)}>
          <div className="bg-white rounded-2xl max-w-sm w-full overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className={`bg-gradient-to-br ${RARITY_COLORS[selectedCard.card.rarity]} p-6 text-center`}>
              <p className="text-white/60 text-sm font-mono">#{String(selectedCard.card.collectionNumber).padStart(3, "0")}</p>
              <h2 className="text-white text-xl font-bold mt-1">{selectedCard.card.name}</h2>
              <p className="text-white/80 text-sm mt-1">{selectedCard.card.faction.icon} {selectedCard.card.faction.name}</p>
              <span className="inline-block mt-2 bg-white/20 text-white px-3 py-1 rounded-full text-xs font-bold">
                {RARITY_LABELS[selectedCard.card.rarity]}
              </span>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-500 mb-4">{selectedCard.card.element}</p>
              {selectedCard.card.description && <p className="text-sm text-gray-600 mb-4">{selectedCard.card.description}</p>}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-red-50 rounded-xl p-3 text-center">
                  <p className="text-xs text-red-500 font-medium">ATAQUE</p>
                  <p className="text-3xl font-bold text-red-600">{selectedCard.card.attack}</p>
                </div>
                <div className="bg-blue-50 rounded-xl p-3 text-center">
                  <p className="text-xs text-blue-500 font-medium">DEFESA</p>
                  <p className="text-3xl font-bold text-blue-600">{selectedCard.card.defense}</p>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>T{selectedCard.card.season.number} - {selectedCard.card.season.name}</span>
                <span>{selectedCard.card.tokenReward} tokens</span>
              </div>
              <button onClick={() => setSelectedCard(null)} className="w-full mt-4 bg-gray-100 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-200">
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
