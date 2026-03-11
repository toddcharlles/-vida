import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const seasons = await prisma.season.findMany({
      include: { _count: { select: { cards: true } } },
      orderBy: { number: "desc" },
    });
    return NextResponse.json(seasons);
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
    const season = await prisma.season.create({
      data: {
        name: data.name,
        number: parseInt(data.number),
        totalCards: parseInt(data.totalCards) || 100,
        active: data.active ?? true,
      },
    });
    return NextResponse.json(season);
  } catch {
    return NextResponse.json({ error: "Erro ao criar temporada" }, { status: 500 });
  }
}
