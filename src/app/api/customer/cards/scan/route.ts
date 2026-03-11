import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCustomerSession } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const customer = await getCustomerSession();
    if (!customer) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { qrCode } = await request.json();
    if (!qrCode) {
      return NextResponse.json({ error: "QR Code inválido" }, { status: 400 });
    }

    // Find card by QR code
    const card = await prisma.card.findUnique({
      where: { qrCode },
      include: {
        season: { select: { name: true } },
        faction: { select: { name: true, icon: true } },
      },
    });

    if (!card || !card.active) {
      return NextResponse.json({ error: "Carta não encontrada ou inativa" }, { status: 404 });
    }

    // Check if customer already has this card
    const existing = await prisma.customerCard.findFirst({
      where: { customerId: customer.id, cardId: card.id, isDuplicate: false },
    });

    const isDuplicate = !!existing;

    // Add card to collection
    const customerCard = await prisma.customerCard.create({
      data: {
        customerId: customer.id,
        cardId: card.id,
        isDuplicate,
      },
    });

    // Award tokens (half tokens for duplicates)
    const tokensAwarded = isDuplicate
      ? Math.ceil(card.tokenReward / 2)
      : card.tokenReward;

    await prisma.$transaction([
      prisma.customer.update({
        where: { id: customer.id },
        data: { tokens: { increment: tokensAwarded } },
      }),
      prisma.tokenTransaction.create({
        data: {
          customerId: customer.id,
          type: "bonus",
          amount: tokensAwarded,
          description: isDuplicate
            ? `Carta duplicada: ${card.name} (${card.rarity}) - ${card.season.name}`
            : `Nova carta: ${card.name} (${card.rarity}) - ${card.season.name}`,
        },
      }),
    ]);

    // Check album completion
    const totalCardsInSeason = await prisma.card.count({
      where: { seasonId: card.seasonId, active: true },
    });
    const uniqueCardsOwned = await prisma.customerCard.findMany({
      where: { customerId: customer.id, isDuplicate: false, card: { seasonId: card.seasonId } },
      select: { cardId: true },
    });
    const uniqueCount = new Set(uniqueCardsOwned.map((c) => c.cardId)).size;
    const albumComplete = uniqueCount >= totalCardsInSeason && totalCardsInSeason > 0;

    // Bonus for completing album
    let albumBonus = 0;
    if (albumComplete && !isDuplicate) {
      albumBonus = 500;
      await prisma.$transaction([
        prisma.customer.update({
          where: { id: customer.id },
          data: { tokens: { increment: albumBonus } },
        }),
        prisma.tokenTransaction.create({
          data: {
            customerId: customer.id,
            type: "bonus",
            amount: albumBonus,
            description: `Álbum completo: ${card.season.name}! Parabéns!`,
          },
        }),
      ]);
    }

    return NextResponse.json({
      customerCard,
      card,
      isDuplicate,
      tokensAwarded,
      albumComplete,
      albumBonus,
      albumProgress: { owned: uniqueCount, total: totalCardsInSeason },
    });
  } catch {
    return NextResponse.json({ error: "Erro ao escanear carta" }, { status: 500 });
  }
}
