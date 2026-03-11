import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getSession();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    const { id } = await params;
    const data = await request.json();

    const card = await prisma.card.update({
      where: { id },
      data: {
        name: data.name?.toUpperCase(),
        element: data.element,
        attack: data.attack ? parseInt(data.attack) : undefined,
        defense: data.defense ? parseInt(data.defense) : undefined,
        rarity: data.rarity,
        description: data.description,
        imageUrl: data.imageUrl,
        totalPrinted: data.totalPrinted ? parseInt(data.totalPrinted) : undefined,
        active: data.active,
      },
    });
    return NextResponse.json(card);
  } catch {
    return NextResponse.json({ error: "Erro ao atualizar carta" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getSession();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    const { id } = await params;
    await prisma.card.update({ where: { id }, data: { active: false } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Erro ao remover carta" }, { status: 500 });
  }
}
