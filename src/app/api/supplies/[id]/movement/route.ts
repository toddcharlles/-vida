import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { recalcProductsUsingSupply } from "@/lib/production";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getSession();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    const { id } = await params;
    const data = await request.json();
    const quantity = parseFloat(data.quantity);

    const supply = await prisma.supply.findUnique({ where: { id } });
    if (!supply) {
      return NextResponse.json({ error: "Insumo não encontrado" }, { status: 404 });
    }

    const newQuantity = data.type === "entrada"
      ? supply.quantity + quantity
      : supply.quantity - quantity;

    if (newQuantity < 0) {
      return NextResponse.json({ error: "Estoque insuficiente" }, { status: 400 });
    }

    await prisma.$transaction([
      prisma.supplyMovement.create({
        data: { supplyId: id, type: data.type, quantity, notes: data.notes },
      }),
      prisma.supply.update({
        where: { id },
        data: { quantity: newQuantity },
      }),
    ]);

    // Recalculate maxProduction for all products using this supply
    await recalcProductsUsingSupply(id);

    return NextResponse.json({ ok: true, newQuantity });
  } catch {
    return NextResponse.json({ error: "Erro ao registrar movimentação" }, { status: 500 });
  }
}
