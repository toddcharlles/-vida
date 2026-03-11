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
  faction: { name: string; icon: string; color: string };
}

interface CustomerCard {
  id: string;
  cardId: string;
  isDuplicate: boolean;
  card: CardData;
}

interface Battle {
  id: string;
  player1Id: string;
  player2Id: string;
  winnerId: string | null;
  player1Score: number;
  player2Score: number;
  status: string;
  createdAt: string;
  player1: { name: string };
  player2: { name: string };
}

const RARITY_COLORS: Record<string, string> = {
  comum: "border-gray-300",
  raro: "border-blue-400",
  holografico: "border-purple-400",
  lendario: "border-amber-400",
  secreto: "border-red-500",
};

export default function BatalhaPage() {
  const [myCards, setMyCards] = useState<CustomerCard[]>([]);
  const [battles, setBattles] = useState<Battle[]>([]);
  const [selectedCards, setSelectedCards] = useState<string[]>([]);
  const [opponentCode, setOpponentCode] = useState("");
  const [tab, setTab] = useState<"batalhar" | "historico" | "responder">("batalhar");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [meId, setMeId] = useState<string>("");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const [cardsRes, battlesRes, meRes] = await Promise.all([
      fetch("/api/customer/cards").then((r) => r.json()),
      fetch("/api/customer/cards/battle").then((r) => r.json()),
      fetch("/api/customer/me").then((r) => r.json()),
    ]);
    const unique = (cardsRes.cards || []).filter((c: CustomerCard) => !c.isDuplicate);
    setMyCards(unique);
    setBattles(Array.isArray(battlesRes) ? battlesRes : []);
    if (meRes?.id) setMeId(meRes.id);
  }

  function toggleCard(cardId: string) {
    setSelectedCards((prev) =>
      prev.includes(cardId)
        ? prev.filter((id) => id !== cardId)
        : prev.length < 5 ? [...prev, cardId] : prev
    );
  }

  async function createBattle(e: React.FormEvent) {
    e.preventDefault();
    if (selectedCards.length !== 5) {
      setMessage("Selecione exatamente 5 cartas!");
      return;
    }
    setLoading(true);
    setMessage(null);

    const res = await fetch("/api/customer/cards/battle", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ opponentId: opponentCode, cardIds: selectedCards }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setMessage(data.error);
      return;
    }

    setMessage("Batalha criada! Aguardando oponente aceitar.");
    setSelectedCards([]);
    setOpponentCode("");
    loadData();
  }

  async function respondBattle(battleId: string, cardIds: string[], action: string) {
    setLoading(true);
    const res = await fetch("/api/customer/cards/battle", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ battleId, cardIds, action }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setMessage(data.error);
      return;
    }

    if (action === "recusar") {
      setMessage("Batalha recusada.");
    } else {
      const winner = data.winnerId === meId ? "Você venceu!" : data.winnerId ? "Você perdeu!" : "Empate!";
      setMessage(`Batalha concluída! ${winner} (${data.player1Score} vs ${data.player2Score})`);
    }
    loadData();
  }

  const pendingBattles = battles.filter((b) => b.status === "pendente" && b.player2Id === meId);
  const totalPower = selectedCards.reduce((sum, cardId) => {
    const cc = myCards.find((c) => c.card.id === cardId);
    return sum + (cc ? cc.card.attack + cc.card.defense : 0);
  }, 0);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Batalha de Cartas</h1>
      <p className="text-sm text-gray-500 mb-6">Selecione 5 cartas e desafie outros jogadores!</p>

      {message && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-4">
          <p className="text-sm text-emerald-700">{message}</p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200 pb-2">
        {[
          { key: "batalhar", label: "Batalhar" },
          { key: "responder", label: `Desafios (${pendingBattles.length})` },
          { key: "historico", label: "Histórico" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key as typeof tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              tab === t.key ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "batalhar" && (
        <div>
          <form onSubmit={createBattle} className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-3 items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">ID do Oponente</label>
                <input
                  value={opponentCode}
                  onChange={(e) => setOpponentCode(e.target.value)}
                  placeholder="Cole o ID do oponente aqui"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading || selectedCards.length !== 5}
                className="bg-emerald-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:opacity-50"
              >
                Desafiar! ({selectedCards.length}/5)
              </button>
            </div>
            {selectedCards.length > 0 && (
              <p className="text-xs text-gray-500 mt-2">Poder total: {totalPower} | Selecione {5 - selectedCards.length} carta{5 - selectedCards.length !== 1 ? "s" : ""} mais</p>
            )}
          </form>

          <h3 className="font-semibold text-gray-700 text-sm mb-3">Suas Cartas ({myCards.length})</h3>
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3">
            {myCards.map((cc) => {
              const selected = selectedCards.includes(cc.card.id);
              return (
                <div
                  key={cc.id}
                  onClick={() => toggleCard(cc.card.id)}
                  className={`bg-white rounded-lg border-2 p-2 cursor-pointer transition-all ${
                    selected
                      ? "border-emerald-500 ring-2 ring-emerald-200 scale-105"
                      : `${RARITY_COLORS[cc.card.rarity]} hover:scale-102`
                  }`}
                >
                  <div className="text-center">
                    <span className="text-lg">{cc.card.faction.icon}</span>
                    <p className="text-xs font-bold text-gray-700 truncate">{cc.card.name}</p>
                    <div className="flex justify-center gap-1 mt-1 text-xs">
                      <span className="text-red-500 font-bold">{cc.card.attack}</span>
                      <span className="text-gray-300">/</span>
                      <span className="text-blue-500 font-bold">{cc.card.defense}</span>
                    </div>
                    {selected && <span className="text-emerald-600 text-xs font-bold">Selecionada</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {tab === "responder" && (
        <div className="space-y-4">
          {pendingBattles.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              <p className="text-4xl mb-2">⚔️</p>
              <p>Nenhum desafio pendente</p>
            </div>
          )}
          {pendingBattles.map((b) => (
            <div key={b.id} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-bold text-gray-800">{b.player1.name} te desafiou!</p>
                  <p className="text-xs text-gray-500">{new Date(b.createdAt).toLocaleDateString("pt-BR")}</p>
                </div>
                <span className="bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full text-xs font-medium">Pendente</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    if (selectedCards.length !== 5) {
                      setMessage("Selecione 5 cartas na aba 'Batalhar' primeiro, depois volte aqui para aceitar.");
                      return;
                    }
                    respondBattle(b.id, selectedCards, "aceitar");
                  }}
                  disabled={loading}
                  className="flex-1 bg-emerald-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:opacity-50"
                >
                  Aceitar ({selectedCards.length}/5 cartas)
                </button>
                <button
                  onClick={() => respondBattle(b.id, [], "recusar")}
                  disabled={loading}
                  className="bg-red-100 text-red-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-200 disabled:opacity-50"
                >
                  Recusar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "historico" && (
        <div className="space-y-3">
          {battles.filter((b) => b.status === "concluido").length === 0 && (
            <div className="text-center py-8 text-gray-400">
              <p className="text-4xl mb-2">📜</p>
              <p>Nenhuma batalha concluída</p>
            </div>
          )}
          {battles.filter((b) => b.status === "concluido").map((b) => {
            const isP1 = b.player1Id === meId;
            const won = b.winnerId === meId;
            const draw = !b.winnerId;
            return (
              <div key={b.id} className={`bg-white rounded-xl border-2 p-4 ${won ? "border-emerald-300" : draw ? "border-gray-200" : "border-red-200"}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      {b.player1.name} <span className="text-gray-400">vs</span> {b.player2.name}
                    </p>
                    <p className="text-xs text-gray-500">{new Date(b.createdAt).toLocaleDateString("pt-BR")}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg text-gray-700">{b.player1Score} x {b.player2Score}</p>
                    <span className={`text-xs font-bold ${won ? "text-emerald-600" : draw ? "text-gray-500" : "text-red-600"}`}>
                      {won ? "VITÓRIA" : draw ? "EMPATE" : "DERROTA"}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
