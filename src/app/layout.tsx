import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Fábrica de Picolé - Sistema de Gestão",
  description: "Sistema de gestão para fábrica de picolés",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="bg-gray-50 text-gray-900 antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
