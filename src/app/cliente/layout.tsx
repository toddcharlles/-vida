"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";

const clienteNav = [
  { href: "/cliente", label: "Inicio", icon: "🏠" },
  { href: "/cliente/lojas", label: "Lojas", icon: "📍" },
  { href: "/cliente/comprar", label: "Comprar", icon: "🛒" },
  { href: "/cliente/pedidos", label: "Meus Pedidos", icon: "📦" },
  { href: "/cliente/tokens", label: "Meus Tokens", icon: "🪙" },
  { href: "/cliente/indicar", label: "Indicar Amigos", icon: "🤝" },
];

export default function ClienteLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ok, setOk] = useState(false);

  useEffect(() => {
    fetch("/api/customer/me").then(async (res) => {
      if (!res.ok) return router.push("/cliente/login");
      setOk(true);
    });
  }, [router]);

  if (!ok) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar items={clienteNav} title="Área do Cliente" />
      <main className="flex-1 p-8 overflow-auto">{children}</main>
    </div>
  );
}
