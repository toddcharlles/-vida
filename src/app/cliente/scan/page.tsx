"use client";

import { useState } from "react";

const RARITY_COLORS: Record<string, string> = {
  comum: "from-gray-400 to-gray-500",
  raro: "from-blue-400 to-blue-600",
  holografico: "from-purple-400 to-pink-500",
  lendario: "from-amber-400 to-orange-600",
  secreto: "from-red-500 to-rose-700",
};

const RARITY_LABELS: Record<string, string> = {
  comum: "Comum", raro: "Raro", holografico: "Holográfico",
  lendario: "Lendário", secreto: "Secreto",
};

interface ScanResult {
  card: {
    name: string;
    collectionNumber: number;
    element: string;
    attack: number;
    defense: number;
    rarity: string;
    tokenReward: number;
    season: { name: string };
    faction: { name: string; icon: string };
  };
  isDuplicate: boolean;
  tokensAwarded: number;
  albumComplete: boolean;
  albumBonus: number;
  albumProgress: { owned: number; total: number };
}

export default function ScanPage() {
  const [qrCode, setQrCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ScanResult | null>(null);

  async function handleScan(e: React.FormEvent) {
    e.preventDefault();
    if (!qrCode.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    const res = await fetch("/api/customer/cards/scan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ qrCode: qrCode.trim() }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error);
      return;
    }

    setResult(data);
    setQrCode("");
  }

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Escanear Carta</h1>
      <p className="text-sm text-gray-500 mb-6">
        Digite o código QR encontrado na sua paleta para adicionar a carta à coleção!
      </p>

      <form onSubmit={handleScan} className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Código QR da Carta</label>
        <div className="flex gap-3">
          <input
            value={qrCode}
            onChange={(e) => setQrCode(e.target.value.toUpperCase())}
            placeholder="LP-XXXXXXXXXXXXXXXX"
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-emerald-500 outline-none"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-emerald-600 text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-emerald-700 transition disabled:opacity-50"
          >
            {loading ? "..." : "Escanear"}
          </button>
        </div>
      </form>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {result && (
        <div className="space-y-4">
          {/* Card reveal */}
          <div className={`bg-gradient-to-br ${RARITY_COLORS[result.card.rarity]} rounded-2xl p-6 text-center text-white animate-pulse`}>
            <p className="text-white/60 text-sm mb-1">
              {result.isDuplicate ? "CARTA DUPLICADA!" : "NOVA CARTA!"}
            </p>
            <p className="text-5xl mb-2">{result.card.faction.icon}</p>
            <p className="font-mono text-sm text-white/60">#{String(result.card.collectionNumber).padStart(3, "0")}</p>
            <h2 className="text-2xl font-bold mt-1">{result.card.name}</h2>
            <p className="text-white/80 text-sm mt-1">{result.card.element}</p>
            <div className="inline-block mt-2 bg-white/20 px-4 py-1 rounded-full text-sm font-bold">
              {RARITY_LABELS[result.card.rarity]}
            </div>
            <div className="flex justify-center gap-6 mt-4">
              <div>
                <p className="text-white/60 text-xs">ATK</p>
                <p className="text-2xl font-bold">{result.card.attack}</p>
              </div>
              <div>
                <p className="text-white/60 text-xs">DEF</p>
                <p className="text-2xl font-bold">{result.card.defense}</p>
              </div>
            </div>
          </div>

          {/* Tokens awarded */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
            <p className="text-emerald-700 font-bold text-lg">+{result.tokensAwarded} tokens!</p>
            {result.isDuplicate && (
              <p className="text-emerald-600 text-xs mt-1">Metade dos tokens por carta duplicada</p>
            )}
          </div>

          {/* Album progress */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Progresso do Álbum</span>
              <span className="text-sm text-gray-500">{result.albumProgress.owned}/{result.albumProgress.total}</span>
            </div>
            <div className="bg-gray-200 rounded-full h-3">
              <div
                className="bg-emerald-500 h-3 rounded-full transition-all"
                style={{ width: `${(result.albumProgress.owned / (result.albumProgress.total || 1)) * 100}%` }}
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">{result.card.season.name}</p>
          </div>

          {/* Album complete bonus */}
          {result.albumComplete && (
            <div className="bg-gradient-to-r from-amber-400 to-orange-500 rounded-xl p-6 text-center text-white">
              <p className="text-4xl mb-2">🏆</p>
              <h3 className="text-xl font-bold">Álbum Completo!</h3>
              <p className="text-white/80 mt-1">Você completou a {result.card.season.name}!</p>
              <p className="text-2xl font-bold mt-2">+{result.albumBonus} tokens bônus!</p>
            </div>
          )}

          <div className="flex gap-3">
            <a href="/cliente/colecao" className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg text-sm font-medium text-center hover:bg-gray-200">
              Ver Coleção
            </a>
            <button onClick={() => setResult(null)} className="flex-1 bg-emerald-600 text-white py-3 rounded-lg text-sm font-medium hover:bg-emerald-700">
              Escanear Outra
            </button>
          </div>
        </div>
      )}

      {!result && !error && (
        <div className="text-center py-8 text-gray-400">
          <p className="text-5xl mb-3">📸</p>
          <p className="text-sm">
            Encontre o código QR no seu picolé e digite acima.
          </p>
          <p className="text-xs mt-2">Formato: LP-XXXXXXXXXXXXXXXX</p>
        </div>
      )}
    </div>
  );
}
