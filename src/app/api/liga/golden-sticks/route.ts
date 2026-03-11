import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getSession();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    const sticks = await prisma.goldenStick.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(sticks);
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
    const stick = await prisma.goldenStick.create({
      data: {
        code: data.code.toUpperCase(),
        edition: data.edition,
        prize: data.prize,
        prizeType: data.prizeType,
        prizeValue: parseFloat(data.prizeValue) || 0,
      },
    });
    return NextResponse.json(stick);
  } catch (err) {
    const msg = err instanceof Error && err.message.includes("Unique")
      ? "Já existe um palito com esse código"
      : "Erro ao criar palito dourado";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
