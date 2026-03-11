import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import crypto from "crypto";

const RARITY_TOKENS: Record<string, number> = {
  comum: 1,
  raro: 5,
  holografico: 20,
  lendario: 100,
  secreto: 1000,
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const seasonId = searchParams.get("seasonId");

    const where: Record<string, unknown> = {};
    if (seasonId) where.seasonId = seasonId;

    const cards = await prisma.card.findMany({
      where,
      include: {
        season: { select: { name: true, number: true } },
        faction: { select: { name: true, color: true, icon: true } },
        _count: { select: { customerCards: true } },
      },
      orderBy: [{ seasonId: "asc" }, { collectionNumber: "asc" }],
    });
    return NextResponse.json(cards);
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
    const qrCode = `LP-${crypto.randomBytes(8).toString("hex").toUpperCase()}`;
    const tokenReward = RARITY_TOKENS[data.rarity] || 1;

    const card = await prisma.card.create({
      data: {
        seasonId: data.seasonId,
        factionId: data.factionId,
        collectionNumber: parseInt(data.collectionNumber),
        name: data.name.toUpperCase(),
        element: data.element,
        attack: parseInt(data.attack) || 50,
        defense: parseInt(data.defense) || 50,
        rarity: data.rarity,
        description: data.description || null,
        imageUrl: data.imageUrl || null,
        qrCode,
        tokenReward,
        totalPrinted: parseInt(data.totalPrinted) || 0,
      },
      include: { season: true, faction: true },
    });
    return NextResponse.json(card);
  } catch (err) {
    const msg = err instanceof Error && err.message.includes("Unique")
      ? "Já existe uma carta com esse número nesta temporada"
      : "Erro ao criar carta";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
