import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getSession();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    const supplies = await prisma.supply.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
    });
    return NextResponse.json(supplies);
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
    const supply = await prisma.supply.create({
      data: {
        name: data.name,
        unit: data.unit,
        quantity: parseFloat(data.quantity) || 0,
        minStock: parseFloat(data.minStock) || 0,
      },
    });

    return NextResponse.json(supply, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erro ao criar insumo" }, { status: 500 });
  }
}
