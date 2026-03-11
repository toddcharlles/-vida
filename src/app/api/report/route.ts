import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getSession();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    // Get all supplies with totals
    const supplies = await prisma.supply.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
    });

    const totalInvestment = supplies.reduce((sum, s) => sum + s.totalCost, 0);

    // Get products with recipes
    const products = await prisma.product.findMany({
      where: { active: true },
      include: {
        category: true,
        stock: true,
        recipeItems: {
          include: { supply: true },
        },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({
      supplies,
      totalInvestment,
      products,
    });
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
