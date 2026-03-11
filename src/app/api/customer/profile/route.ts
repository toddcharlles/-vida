import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireCustomer, hashPassword, verifyPassword } from "@/lib/auth";

// GET - dados do perfil
export async function GET() {
  try {
    const session = await requireCustomer();
    const customer = await prisma.customer.findUnique({
      where: { id: session.id },
      select: { id: true, name: true, email: true, phone: true, cpf: true },
    });
    return NextResponse.json({ customer });
  } catch {
    return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
  }
}

// PUT - atualizar perfil
export async function PUT(request: NextRequest) {
  try {
    const session = await requireCustomer();
    const data = await request.json();

    const updateData: Record<string, unknown> = {};
    if (data.name) updateData.name = data.name;
    if (data.phone !== undefined) updateData.phone = data.phone || null;
    if (data.cpf !== undefined) updateData.cpf = data.cpf || null;

    // Password change
    if (data.newPassword) {
      if (!data.currentPassword) {
        return NextResponse.json({ error: "Senha atual obrigatoria" }, { status: 400 });
      }
      const customer = await prisma.customer.findUnique({ where: { id: session.id } });
      if (!customer) {
        return NextResponse.json({ error: "Cliente nao encontrado" }, { status: 404 });
      }
      const valid = await verifyPassword(data.currentPassword, customer.password);
      if (!valid) {
        return NextResponse.json({ error: "Senha atual incorreta" }, { status: 400 });
      }
      updateData.password = await hashPassword(data.newPassword);
    }

    const customer = await prisma.customer.update({
      where: { id: session.id },
      data: updateData,
      select: { id: true, name: true, email: true, phone: true, cpf: true },
    });

    return NextResponse.json({ customer, message: "Perfil atualizado!" });
  } catch (error) {
    return NextResponse.json({ error: "Erro: " + error }, { status: 500 });
  }
}
