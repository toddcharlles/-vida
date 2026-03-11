"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";

const vendedorNav = [
  { href: "/vendedor", label: "Catálogo", icon: "🍦" },
  { href: "/vendedor/loja", label: "Minha Loja", icon: "🏪" },
  { href: "/vendedor/produtos", label: "Meus Produtos", icon: "📦" },
  { href: "/vendedor/pedidos", label: "Meus Pedidos", icon: "📋" },
  { href: "/vendedor/comissoes", label: "Minhas Comissões", icon: "💰" },
];

export default function VendedorLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ok, setOk] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me").then(async (res) => {
      if (!res.ok) return router.push("/");
      const { user } = await res.json();
      if (user.role === "admin") return router.push("/admin");
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
      <Sidebar items={vendedorNav} title="Area do Vendedor" />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto pt-18 md:pt-4 sm:md:pt-6 lg:md:pt-8 min-w-0">
        {children}
      </main>
    </div>
  );
}
