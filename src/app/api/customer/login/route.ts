import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyPassword, generateCustomerToken } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    const customer = await prisma.customer.findUnique({ where: { email } });
    if (!customer || !customer.active) {
      return NextResponse.json({ error: "Credenciais inválidas" }, { status: 401 });
    }

    const valid = await verifyPassword(password, customer.password);
    if (!valid) {
      return NextResponse.json({ error: "Credenciais inválidas" }, { status: 401 });
    }

    const token = generateCustomerToken({
      id: customer.id,
      name: customer.name,
      email: customer.email,
      role: "cliente",
    });

    const response = NextResponse.json({
      customer: {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        tokens: customer.tokens,
        referralCode: customer.referralCode,
      },
    });

    response.cookies.set("customer_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
