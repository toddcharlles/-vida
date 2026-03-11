"use client";

import { useEffect, useState } from "react";
import { formatDate } from "@/lib/utils";

interface ReferralData {
  referralCode: string;
  referrals: { id: string; name: string; createdAt: string }[];
  totalTokensFromReferrals: number;
}

export default function IndicarPage() {
  const [data, setData] = useState<ReferralData | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch("/api/referral")
      .then((r) => r.json())
      .then(setData);
  }, []);

  function copyCode() {
    if (!data) return;
    navigator.clipboard.writeText(data.referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function shareWhatsApp() {
    if (!data) return;
    const text = `Compre picolés proteicos com desconto! Use meu código de indicação: ${data.referralCode} e ganhe 10 tokens de boas-vindas!`;
    window.open(
      `https://wa.me/?text=${encodeURIComponent(text)}`,
      "_blank"
    );
  }

  if (!data) {
    return <div className="text-center py-12 text-gray-500">Carregando...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        🤝 Indicar Amigos
      </h1>

      <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl p-6 text-white mb-8">
        <h2 className="text-lg font-bold mb-2">Seu Código de Indicação</h2>
        <div className="bg-white/20 rounded-lg px-4 py-3 text-3xl font-mono font-bold tracking-wider text-center mb-4">
          {data.referralCode}
        </div>
        <div className="flex gap-3 justify-center">
          <button
            onClick={copyCode}
            className="px-4 py-2 bg-white/20 rounded-lg text-sm font-medium hover:bg-white/30 transition"
          >
            {copied ? "Copiado!" : "Copiar código"}
          </button>
          <button
            onClick={shareWhatsApp}
            className="px-4 py-2 bg-green-500 rounded-lg text-sm font-medium hover:bg-green-600 transition"
          >
            Compartilhar WhatsApp
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <p className="text-sm text-gray-500">Amigos indicados</p>
          <p className="text-3xl font-bold text-purple-600">
            {data.referrals.length}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <p className="text-sm text-gray-500">Tokens ganhos por indicações</p>
          <p className="text-3xl font-bold text-emerald-600">
            {data.totalTokensFromReferrals}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
        <h2 className="font-bold text-gray-700 mb-3">Como funciona</h2>
        <div className="space-y-3 text-sm text-gray-600">
          <div className="flex items-start gap-3">
            <span className="bg-purple-100 text-purple-700 rounded-full w-7 h-7 flex items-center justify-center font-bold shrink-0">
              1
            </span>
            <p>Compartilhe seu código com amigos</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="bg-purple-100 text-purple-700 rounded-full w-7 h-7 flex items-center justify-center font-bold shrink-0">
              2
            </span>
            <p>Seu amigo se cadastra usando seu código</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="bg-purple-100 text-purple-700 rounded-full w-7 h-7 flex items-center justify-center font-bold shrink-0">
              3
            </span>
            <p>
              Você ganha <strong>15 tokens</strong> e seu amigo ganha{" "}
              <strong>10 tokens</strong>
            </p>
          </div>
        </div>
      </div>

      {data.referrals.length > 0 && (
        <>
          <h2 className="font-bold text-gray-700 mb-3">Amigos indicados</h2>
          <div className="bg-white rounded-xl shadow-sm border divide-y">
            {data.referrals.map((r) => (
              <div key={r.id} className="p-4 flex justify-between items-center">
                <div>
                  <p className="font-medium text-gray-800">{r.name}</p>
                  <p className="text-xs text-gray-400">
                    {formatDate(r.createdAt)}
                  </p>
                </div>
                <span className="text-emerald-600 font-bold">+15 tokens</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
