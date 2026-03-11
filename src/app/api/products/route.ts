import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getSession();
    if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const products = await prisma.product.findMany({
      where: { active: true },
      include: { category: true, stock: true },
      orderBy: { name: "asc" },
    });
    return NextResponse.json(products);
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
    const product = await prisma.product.create({
      data: {
        name: data.name,
        description: data.description || null,
        price: parseFloat(data.price),
        categoryId: data.categoryId,
      },
      include: { category: true },
    });

    // Create stock entry
    await prisma.stock.create({
      data: { productId: product.id, quantity: 0, minStock: data.minStock || 0 },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao criar produto: " + error }, { status: 500 });
  }
}
