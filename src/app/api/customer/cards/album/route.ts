import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCustomerSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const customer = await getCustomerSession();
    if (!customer) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const seasonId = searchParams.get("seasonId");

    // Get all active seasons
    const seasons = await prisma.season.findMany({
      where: { active: true },
      orderBy: { number: "desc" },
    });

    // Get customer's cards
    const customerCards = await prisma.customerCard.findMany({
      where: { customerId: customer.id, isDuplicate: false },
      select: { cardId: true },
    });
    const ownedCardIds = new Set(customerCards.map((cc) => cc.cardId));

    // Get cards for selected season (or first active)
    const targetSeasonId = seasonId || seasons[0]?.id;
    if (!targetSeasonId) {
      return NextResponse.json({ seasons: [], cards: [], progress: {} });
    }

    const cards = await prisma.card.findMany({
      where: { seasonId: targetSeasonId, active: true },
      include: {
        faction: { select: { name: true, color: true, icon: true } },
      },
      orderBy: { collectionNumber: "asc" },
    });

    const albumCards = cards.map((card) => ({
      ...card,
      owned: ownedCardIds.has(card.id),
    }));

    // Progress per season
    const progress: Record<string, { owned: number; total: number }> = {};
    for (const season of seasons) {
      const total = await prisma.card.count({ where: { seasonId: season.id, active: true } });
      const owned = await prisma.customerCard.count({
        where: {
          customerId: customer.id,
          isDuplicate: false,
          card: { seasonId: season.id },
        },
      });
      progress[season.id] = { owned, total };
    }

    return NextResponse.json({
      seasons,
      cards: albumCards,
      progress,
      selectedSeason: targetSeasonId,
    });
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
