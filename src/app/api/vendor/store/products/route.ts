import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

// GET - listar produtos da loja do vendedor
export async function GET() {
  try {
    const user = await requireAuth();

    const store = await prisma.store.findUnique({
      where: { vendorId: user.id },
    });

    if (!store) {
      return NextResponse.json(
        { error: "Você ainda não tem uma loja cadastrada" },
        { status: 404 }
      );
    }

    const storeProducts = await prisma.storeProduct.findMany({
      where: { storeId: store.id },
      include: {
        product: { include: { category: true } },
      },
      orderBy: { product: { name: "asc" } },
    });

    // Listar todos os produtos disponíveis para adicionar
    const allProducts = await prisma.product.findMany({
      where: { active: true },
      include: { category: true },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ storeProducts, allProducts, storeId: store.id });
  } catch {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
}

// POST - adicionar/atualizar produto na loja
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const data = await request.json();

    const store = await prisma.store.findUnique({
      where: { vendorId: user.id },
    });

    if (!store) {
      return NextResponse.json(
        { error: "Você ainda não tem uma loja cadastrada" },
        { status: 404 }
      );
    }

    if (!data.productId) {
      return NextResponse.json(
        { error: "ID do produto é obrigatório" },
        { status: 400 }
      );
    }

    const storeProduct = await prisma.storeProduct.upsert({
      where: {
        storeId_productId: {
          storeId: store.id,
          productId: data.productId,
        },
      },
      update: {
        price: data.price ? parseFloat(data.price) : null,
        available: data.available !== false,
      },
      create: {
        storeId: store.id,
        productId: data.productId,
        price: data.price ? parseFloat(data.price) : null,
        available: data.available !== false,
      },
      include: {
        product: { include: { category: true } },
      },
    });

    return NextResponse.json({ storeProduct });
  } catch (error) {
    return NextResponse.json({ error: "Erro: " + error }, { status: 500 });
  }
}

// DELETE - remover produto da loja
export async function DELETE(request: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");

    if (!productId) {
      return NextResponse.json(
        { error: "ID do produto é obrigatório" },
        { status: 400 }
      );
    }

    const store = await prisma.store.findUnique({
      where: { vendorId: user.id },
    });

    if (!store) {
      return NextResponse.json(
        { error: "Loja não encontrada" },
        { status: 404 }
      );
    }

    await prisma.storeProduct.delete({
      where: {
        storeId_productId: {
          storeId: store.id,
          productId,
        },
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: "Erro: " + error }, { status: 500 });
  }
}
