import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getSession();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    const { id } = await params;
    const data = await request.json();

    const stick = await prisma.goldenStick.update({
      where: { id },
      data: {
        claimed: data.claimed,
        claimedById: data.claimedById || null,
        claimedAt: data.claimed ? new Date() : null,
      },
    });
    return NextResponse.json(stick);
  } catch {
    return NextResponse.json({ error: "Erro ao atualizar palito" }, { status: 500 });
  }
}
