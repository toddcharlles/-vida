"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";

const adminNav = [
  { href: "/admin", label: "Dashboard", icon: "📊" },
  { href: "/admin/produtos", label: "Produtos", icon: "🍦" },
  { href: "/admin/estoque", label: "Estoque Produtos", icon: "📦" },
  { href: "/admin/insumos", label: "Insumos", icon: "🧪" },
  { href: "/admin/relatorio", label: "Relatório Produção", icon: "📈" },
  { href: "/admin/pedidos", label: "Pedidos", icon: "📋" },
  { href: "/admin/vendedores", label: "Vendedores", icon: "👥" },
  { href: "/admin/lojas", label: "Lojas", icon: "📍" },
  { href: "/admin/comissoes", label: "Comissões", icon: "💰" },
  { href: "/admin/liga", label: "Liga das Paletas", icon: "🃏" },
  { href: "/admin/liga/cartas", label: "Cartas", icon: "⚔️" },
  { href: "/admin/liga/palitos", label: "Palitos Dourados", icon: "✨" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ok, setOk] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me").then(async (res) => {
      if (!res.ok) return router.push("/");
      const { user } = await res.json();
      if (user.role !== "admin") return router.push("/vendedor");
      setOk(true);
    });
  }, [router]);

  if (!ok) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar items={adminNav} title="Painel Admin" />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto pt-18 md:pt-4 sm:md:pt-6 lg:md:pt-8 min-w-0">
        {children}
      </main>
    </div>
  );
}
