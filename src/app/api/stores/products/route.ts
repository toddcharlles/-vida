import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET - listar produtos disponíveis de uma loja (público para clientes)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const storeId = searchParams.get("storeId");

    if (!storeId) {
      return NextResponse.json(
        { error: "storeId é obrigatório" },
        { status: 400 }
      );
    }

    const storeProducts = await prisma.storeProduct.findMany({
      where: {
        storeId,
        available: true,
      },
      include: {
        product: { include: { category: true } },
      },
      orderBy: { product: { name: "asc" } },
    });

    return NextResponse.json({ storeProducts });
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
