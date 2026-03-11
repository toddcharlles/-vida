import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

// GET - buscar loja do vendedor logado
export async function GET() {
  try {
    const user = await requireAuth();

    const store = await prisma.store.findUnique({
      where: { vendorId: user.id },
      include: {
        products: {
          include: { product: { include: { category: true } } },
        },
      },
    });

    return NextResponse.json({ store });
  } catch {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
}

// POST - criar ou atualizar loja do vendedor
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const data = await request.json();

    if (!data.name || !data.address || !data.city) {
      return NextResponse.json(
        { error: "Nome, endereço e cidade são obrigatórios" },
        { status: 400 }
      );
    }

    const existing = await prisma.store.findUnique({
      where: { vendorId: user.id },
    });

    let store;
    if (existing) {
      store = await prisma.store.update({
        where: { vendorId: user.id },
        data: {
          name: data.name,
          address: data.address,
          city: data.city,
          state: data.state || "SP",
          phone: data.phone || null,
          lat: data.lat ? parseFloat(data.lat) : null,
          lng: data.lng ? parseFloat(data.lng) : null,
        },
      });
    } else {
      store = await prisma.store.create({
        data: {
          name: data.name,
          address: data.address,
          city: data.city,
          state: data.state || "SP",
          phone: data.phone || null,
          lat: data.lat ? parseFloat(data.lat) : null,
          lng: data.lng ? parseFloat(data.lng) : null,
          vendorId: user.id,
        },
      });
    }

    return NextResponse.json({ store }, { status: existing ? 200 : 201 });
  } catch (error) {
    return NextResponse.json({ error: "Erro: " + error }, { status: 500 });
  }
}
