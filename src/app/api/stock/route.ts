import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getSession();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    const stock = await prisma.stock.findMany({
      include: {
        product: { include: { category: true } },
      },
      orderBy: { product: { name: "asc" } },
    });
    return NextResponse.json(stock);
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
