import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getSession();
    if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const where = user.role === "admin" ? {} : { userId: user.id };

    const orders = await prisma.order.findMany({
      where,
      include: {
        user: { select: { name: true, email: true } },
        items: { include: { product: { include: { category: true } } } },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(orders);
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getSession();
    if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const data = await request.json();
    if (!data.items || data.items.length === 0) {
      return NextResponse.json({ error: "Pedido deve ter itens" }, { status: 400 });
    }

    // Fetch product prices
    const productIds = data.items.map((i: { productId: string }) => i.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, active: true },
    });

    const productMap = new Map(products.map((p) => [p.id, p]));

    let total = 0;
    const items = data.items.map((item: { productId: string; quantity: number }) => {
      const product = productMap.get(item.productId);
      if (!product) throw new Error(`Produto ${item.productId} não encontrado`);
      const price = product.price;
      total += price * item.quantity;
      return { productId: item.productId, quantity: item.quantity, price };
    });

    const order = await prisma.order.create({
      data: {
        userId: user.id,
        total,
        notes: data.notes || null,
        items: { create: items },
      },
      include: {
        items: { include: { product: true } },
        user: { select: { name: true } },
      },
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao criar pedido: " + error }, { status: 500 });
  }
}
