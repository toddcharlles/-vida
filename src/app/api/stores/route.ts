import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

// GET - listar lojas (público para clientes)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get("city");

    const where: Record<string, unknown> = { active: true };
    if (city) where.city = { contains: city };

    const stores = await prisma.store.findMany({
      where,
      include: {
        vendor: { select: { name: true } },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ stores });
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

// POST - criar loja (admin only)
export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const data = await request.json();

    const store = await prisma.store.create({
      data: {
        name: data.name,
        address: data.address,
        city: data.city,
        state: data.state || "SP",
        phone: data.phone || null,
        lat: data.lat || null,
        lng: data.lng || null,
        vendorId: data.vendorId,
      },
    });

    return NextResponse.json({ store }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Erro: " + error }, { status: 500 });
  }
}
