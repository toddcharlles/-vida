import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCustomerSession } from "@/lib/auth";

export async function GET() {
  try {
    const customer = await getCustomerSession();
    if (!customer) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const customerCards = await prisma.customerCard.findMany({
      where: { customerId: customer.id },
      include: {
        card: {
          include: {
            season: { select: { name: true, number: true } },
            faction: { select: { name: true, color: true, icon: true } },
          },
        },
      },
      orderBy: { scannedAt: "desc" },
    });

    // Get stats
    const uniqueCards = new Set(customerCards.map((cc) => cc.cardId));
    const duplicates = customerCards.filter((cc) => cc.isDuplicate).length;

    const rarityCount: Record<string, number> = {};
    for (const cc of customerCards) {
      if (!cc.isDuplicate) {
        rarityCount[cc.card.rarity] = (rarityCount[cc.card.rarity] || 0) + 1;
      }
    }

    return NextResponse.json({
      cards: customerCards,
      stats: {
        total: customerCards.length,
        unique: uniqueCards.size,
        duplicates,
        rarityCount,
      },
    });
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
