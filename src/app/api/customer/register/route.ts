import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword, generateCustomerToken, generateReferralCode } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, phone, cpf, referralCode } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Nome, email e senha são obrigatórios" }, { status: 400 });
    }

    const existing = await prisma.customer.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email já cadastrado" }, { status: 400 });
    }

    // Check referral code if provided
    let referredById: string | undefined;
    if (referralCode) {
      const referrer = await prisma.customer.findUnique({ where: { referralCode } });
      if (!referrer) {
        return NextResponse.json({ error: "Código de indicação inválido" }, { status: 400 });
      }
      referredById = referrer.id;
    }

    // Generate unique referral code
    let myReferralCode = generateReferralCode();
    while (await prisma.customer.findUnique({ where: { referralCode: myReferralCode } })) {
      myReferralCode = generateReferralCode();
    }

    const customer = await prisma.customer.create({
      data: {
        name,
        email,
        password: await hashPassword(password),
        phone: phone || null,
        cpf: cpf || null,
        referralCode: myReferralCode,
        referredById,
      },
    });

    // Give bonus tokens for referral
    if (referredById) {
      // 10 tokens for the new customer
      await prisma.customer.update({
        where: { id: customer.id },
        data: { tokens: 10 },
      });
      await prisma.tokenTransaction.create({
        data: {
          customerId: customer.id,
          type: "indicacao",
          amount: 10,
          description: "Bônus por cadastro via indicação",
        },
      });

      // 15 tokens for who referred
      await prisma.customer.update({
        where: { id: referredById },
        data: { tokens: { increment: 15 } },
      });
      await prisma.tokenTransaction.create({
        data: {
          customerId: referredById,
          type: "indicacao",
          amount: 15,
          description: `Indicação de ${name}`,
        },
      });
    }

    const token = generateCustomerToken({
      id: customer.id,
      name: customer.name,
      email: customer.email,
      role: "cliente",
    });

    const response = NextResponse.json({
      customer: { id: customer.id, name: customer.name, email: customer.email, referralCode: myReferralCode },
    });

    response.cookies.set("customer_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch (error) {
    return NextResponse.json({ error: "Erro interno: " + error }, { status: 500 });
  }
}
