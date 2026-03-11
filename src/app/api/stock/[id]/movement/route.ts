import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { recalcProductCosts } from "@/lib/production";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getSession();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    const { id } = await params;
    const data = await request.json();
    const quantity = parseInt(data.quantity);

    const stock = await prisma.stock.findUnique({
      where: { id },
      include: { product: { include: { recipeItems: { include: { supply: true } } } } },
    });
    if (!stock) {
      return NextResponse.json({ error: "Estoque não encontrado" }, { status: 404 });
    }

    const newQuantity = data.type === "producao" || data.type === "ajuste"
      ? stock.quantity + quantity
      : stock.quantity - quantity;

    if (newQuantity < 0) {
      return NextResponse.json({ error: "Estoque insuficiente" }, { status: 400 });
    }

    // For production: deduct supplies based on recipe
    if (data.type === "producao" && stock.product.recipeItems.length > 0) {
      const batches = quantity / 10; // 10 units per batch

      // Validate all supplies have enough stock
      const insufficientSupplies: string[] = [];
      for (const ri of stock.product.recipeItems) {
        const needed = ri.quantityPerBatch * batches;
        let availableQty = ri.supply.quantity;
        if (ri.supply.unit === "kg") {
          availableQty = ri.supply.quantity * 1000; // convert kg to grams for comparison
        }
        if (ri.supply.unit === "unidades") {
          if (ri.supply.quantity < needed) {
            insufficientSupplies.push(`${ri.supply.name}: precisa ${needed} ${ri.supply.unit}, tem ${ri.supply.quantity}`);
          }
        } else {
          if (availableQty < needed) {
            insufficientSupplies.push(`${ri.supply.name}: precisa ${needed}g, tem ${availableQty}g`);
          }
        }
      }

      if (insufficientSupplies.length > 0) {
        return NextResponse.json({
          error: "Insumos insuficientes para produção",
          details: insufficientSupplies,
        }, { status: 400 });
      }

      // Interactive transaction: stock movement + stock update + supply deductions
      await prisma.$transaction(async (tx) => {
        await tx.stockMovement.create({
          data: { stockId: id, type: data.type, quantity, notes: data.notes || `Produção de ${quantity} unidades (${batches} bateladas)` },
        });
        await tx.stock.update({
          where: { id },
          data: { quantity: newQuantity },
        });

        // Deduct each supply and create supply movements
        for (const ri of stock.product.recipeItems) {
          const needed = ri.quantityPerBatch * batches;
          const deductQty = ri.supply.unit === "kg" ? needed / 1000 : needed;

          await tx.supply.update({
            where: { id: ri.supply.id },
            data: { quantity: { decrement: deductQty } },
          });
          await tx.supplyMovement.create({
            data: {
              supplyId: ri.supply.id,
              type: "saida",
              quantity: deductQty,
              notes: `Produção: ${quantity}x ${stock.product.name} (${batches} bateladas)`,
            },
          });
        }
      });

      // Recalculate product costs after supply deduction
      await recalcProductCosts(stock.product.id);

      return NextResponse.json({ ok: true, newQuantity, suppliesDeducted: true, batches });
    }

    // Non-production movements (venda, ajuste)
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
  } catch (err) {
    console.error("Stock movement error:", err);
    return NextResponse.json({ error: "Erro ao registrar movimentação" }, { status: 500 });
  }
}
