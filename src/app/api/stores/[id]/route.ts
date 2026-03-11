import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

// PUT - atualizar loja (admin)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const data = await request.json();

    const updateData: Record<string, unknown> = {};
    if (data.name) updateData.name = data.name;
    if (data.address) updateData.address = data.address;
    if (data.city) updateData.city = data.city;
    if (data.state) updateData.state = data.state;
    if (data.phone !== undefined) updateData.phone = data.phone || null;
    if (data.lat !== undefined) updateData.lat = data.lat ? parseFloat(data.lat) : null;
    if (data.lng !== undefined) updateData.lng = data.lng ? parseFloat(data.lng) : null;
    if (typeof data.active === "boolean") updateData.active = data.active;

    const store = await prisma.store.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ store });
  } catch (error) {
    return NextResponse.json({ error: "Erro: " + error }, { status: 500 });
  }
}
