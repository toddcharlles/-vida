import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const factions = await prisma.faction.findMany({
      include: { _count: { select: { cards: true } } },
      orderBy: { name: "asc" },
    });
    return NextResponse.json(factions);
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getSession();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    const data = await request.json();
    const faction = await prisma.faction.create({
      data: {
        name: data.name,
        description: data.description || null,
        color: data.color || "#8B5CF6",
        icon: data.icon || "⚔️",
      },
    });
    return NextResponse.json(faction);
  } catch {
    return NextResponse.json({ error: "Erro ao criar facção" }, { status: 500 });
  }
}
