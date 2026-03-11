"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

interface NavItem {
  href: string;
  label: string;
  icon: string;
}

export default function Sidebar({ items, title }: { items: NavItem[]; title: string }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  }

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🍦</span>
          <div>
            <h1 className="font-bold text-gray-800 text-sm">{title}</h1>
            <p className="text-xs text-gray-500">Fábrica de Picolé</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {items.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                active
                  ? "bg-violet-50 text-violet-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-700 transition w-full"
        >
          <span className="text-lg">🚪</span>
          Sair
        </button>
      </div>
    </aside>
  );
}
