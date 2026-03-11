import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

// PATCH - atualizar status da comissao (admin)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const { status } = await request.json();

    if (!["pendente", "liberada", "paga"].includes(status)) {
      return NextResponse.json({ error: "Status invalido" }, { status: 400 });
    }

    const commission = await prisma.commission.update({
      where: { id },
      data: {
        status,
        paidAt: status === "paga" ? new Date() : null,
      },
    });

    return NextResponse.json({ commission });
  } catch (error) {
    return NextResponse.json({ error: "Erro: " + error }, { status: 500 });
  }
}
