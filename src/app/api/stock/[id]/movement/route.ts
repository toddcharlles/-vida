import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getSession();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    const { id } = await params;
    const data = await request.json();
    const quantity = parseInt(data.quantity);

    const stock = await prisma.stock.findUnique({ where: { id } });
    if (!stock) {
      return NextResponse.json({ error: "Estoque não encontrado" }, { status: 404 });
    }

    const newQuantity = data.type === "producao" || data.type === "ajuste"
      ? stock.quantity + quantity
      : stock.quantity - quantity;

    if (newQuantity < 0) {
      return NextResponse.json({ error: "Estoque insuficiente" }, { status: 400 });
    }

    await prisma.$transaction([
      prisma.stockMovement.create({
        data: { stockId: id, type: data.type, quantity, notes: data.notes },
      }),
      prisma.stock.update({
        where: { id },
        data: { quantity: newQuantity },
      }),
    ]);

    return NextResponse.json({ ok: true, newQuantity });
  } catch {
    return NextResponse.json({ error: "Erro ao registrar movimentação" }, { status: 500 });
  }
}
