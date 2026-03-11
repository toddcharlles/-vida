import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCustomerSession } from "@/lib/auth";

// Element bonus chart: element -> strong against
const ELEMENT_BONUS: Record<string, string[]> = {
  "Fruta": ["Creme"],
  "Creme": ["Gelada"],
  "Gelada": ["Fruta"],
  "Fruta Sombria": ["Creme", "Gelada"],
  "Creme Dourado": ["Fruta", "Gelada"],
  "Gelo Supremo": ["Fruta", "Creme"],
};

function calculateBattleScore(cards: { attack: number; defense: number; element: string }[], opponentElements: string[]): number {
  let total = 0;
  for (const card of cards) {
    let score = card.attack + card.defense;
    // Element bonus: +15% if strong against any opponent element
    const strongAgainst = ELEMENT_BONUS[card.element] || [];
    if (opponentElements.some((e) => strongAgainst.includes(e))) {
      score = Math.round(score * 1.15);
    }
    total += score;
  }
  return total;
}

export async function GET(request: NextRequest) {
  try {
    const customer = await getCustomerSession();
    if (!customer) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const where: Record<string, unknown> = {
      OR: [{ player1Id: customer.id }, { player2Id: customer.id }],
    };
    if (status) where.status = status;

    const battles = await prisma.cardBattle.findMany({
      where,
      include: {
        player1: { select: { name: true } },
        player2: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json(battles);
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const customer = await getCustomerSession();
    if (!customer) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { opponentId, cardIds } = await request.json();

    if (!opponentId || !cardIds || cardIds.length !== 5) {
      return NextResponse.json({ error: "Selecione exatamente 5 cartas para a batalha" }, { status: 400 });
    }

    if (opponentId === customer.id) {
      return NextResponse.json({ error: "Você não pode batalhar contra si mesmo" }, { status: 400 });
    }

    // Verify customer owns these cards
    const ownedCards = await prisma.customerCard.findMany({
      where: { customerId: customer.id, cardId: { in: cardIds }, isDuplicate: false },
      include: { card: true },
    });
    const ownedCardIds = new Set(ownedCards.map((oc) => oc.cardId));
    const validCards = cardIds.every((id: string) => ownedCardIds.has(id));

    if (!validCards) {
      return NextResponse.json({ error: "Você não possui todas as cartas selecionadas" }, { status: 400 });
    }

    // Verify opponent exists
    const opponent = await prisma.customer.findUnique({ where: { id: opponentId } });
    if (!opponent) {
      return NextResponse.json({ error: "Oponente não encontrado" }, { status: 404 });
    }

    const battle = await prisma.cardBattle.create({
      data: {
        player1Id: customer.id,
        player2Id: opponentId,
        player1Cards: JSON.stringify(cardIds),
        player2Cards: "[]",
        status: "pendente",
      },
    });

    return NextResponse.json(battle);
  } catch {
    return NextResponse.json({ error: "Erro ao criar batalha" }, { status: 500 });
  }
}

// Accept battle and resolve
export async function PUT(request: NextRequest) {
  try {
    const customer = await getCustomerSession();
    if (!customer) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { battleId, cardIds, action } = await request.json();

    const battle = await prisma.cardBattle.findUnique({ where: { id: battleId } });
    if (!battle) {
      return NextResponse.json({ error: "Batalha não encontrada" }, { status: 404 });
    }

    if (battle.player2Id !== customer.id) {
      return NextResponse.json({ error: "Você não é o oponente desta batalha" }, { status: 403 });
    }

    if (battle.status !== "pendente") {
      return NextResponse.json({ error: "Esta batalha já foi resolvida" }, { status: 400 });
    }

    if (action === "recusar") {
      const updated = await prisma.cardBattle.update({
        where: { id: battleId },
        data: { status: "recusado" },
      });
      return NextResponse.json(updated);
    }

    // Accept: need 5 cards
    if (!cardIds || cardIds.length !== 5) {
      return NextResponse.json({ error: "Selecione 5 cartas" }, { status: 400 });
    }

    // Verify ownership
    const ownedCards = await prisma.customerCard.findMany({
      where: { customerId: customer.id, cardId: { in: cardIds }, isDuplicate: false },
      include: { card: true },
    });
    if (ownedCards.length < 5) {
      return NextResponse.json({ error: "Cartas inválidas" }, { status: 400 });
    }

    // Get player1's cards
    const p1CardIds = JSON.parse(battle.player1Cards) as string[];
    const p1Cards = await prisma.card.findMany({ where: { id: { in: p1CardIds } } });
    const p2Cards = ownedCards.map((oc) => oc.card);

    const p1Elements = p1Cards.map((c) => c.element);
    const p2Elements = p2Cards.map((c) => c.element);

    const p1Score = calculateBattleScore(p1Cards, p2Elements);
    const p2Score = calculateBattleScore(p2Cards, p1Elements);

    const winnerId = p1Score > p2Score ? battle.player1Id : p2Score > p1Score ? customer.id : null;

    const updated = await prisma.cardBattle.update({
      where: { id: battleId },
      data: {
        player2Cards: JSON.stringify(cardIds),
        player1Score: p1Score,
        player2Score: p2Score,
        winnerId,
        status: "concluido",
      },
    });

    // Award tokens to winner
    if (winnerId) {
      await prisma.$transaction([
        prisma.customer.update({
          where: { id: winnerId },
          data: { tokens: { increment: 10 } },
        }),
        prisma.tokenTransaction.create({
          data: {
            customerId: winnerId,
            type: "bonus",
            amount: 10,
            description: `Vitória na batalha de cartas!`,
          },
        }),
      ]);
    }

    return NextResponse.json({
      ...updated,
      player1Score: p1Score,
      player2Score: p2Score,
      winnerId,
    });
  } catch {
    return NextResponse.json({ error: "Erro ao resolver batalha" }, { status: 500 });
  }
}
