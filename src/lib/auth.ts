import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { prisma } from "./db";

const JWT_SECRET = process.env.JWT_SECRET || "picole-factory-secret-key-change-in-production";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateToken(user: AuthUser): string {
  return jwt.sign(
    { id: user.id, name: user.name, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

export function verifyToken(token: string): AuthUser | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthUser;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function requireAuth(): Promise<AuthUser> {
  const user = await getSession();
  if (!user) throw new Error("Não autorizado");
  return user;
}

export async function requireAdmin(): Promise<AuthUser> {
  const user = await requireAuth();
  if (user.role !== "admin") throw new Error("Acesso negado");
  return user;
}

// Seed initial admin user
export async function seedAdmin() {
  const existing = await prisma.user.findUnique({ where: { email: "admin@picole.com" } });
  if (!existing) {
    await prisma.user.create({
      data: {
        name: "Administrador",
        email: "admin@picole.com",
        password: await hashPassword("admin123"),
        role: "admin",
      },
    });
  }

  // Seed categories
  const categories = [
    { name: "Normal", slug: "normal" },
    { name: "Proteico", slug: "proteico" },
    { name: "Energético", slug: "energetico" },
    { name: "Isotônico", slug: "isotonico" },
  ];
  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }

  // Seed supplies (materiais comprados)
  const supplies = [
    { name: "Leite em pó", unit: "kg", quantity: 25, minStock: 5, costPerUnit: 29.50, totalCost: 737.50 },
    { name: "Glucose líquida", unit: "kg", quantity: 25, minStock: 5, costPerUnit: 5.83, totalCost: 145.80 },
    { name: "Ovomaltine flocos", unit: "kg", quantity: 2.25, minStock: 0.5, costPerUnit: 49.63, totalCost: 111.66 },
    { name: "Cacau em pó 100%", unit: "kg", quantity: 5, minStock: 1, costPerUnit: 73.20, totalCost: 366.00 },
    { name: "Super liga neutra", unit: "kg", quantity: 10, minStock: 2, costPerUnit: 23.90, totalCost: 239.00 },
    { name: "Emulsificante", unit: "kg", quantity: 10, minStock: 2, costPerUnit: 16.58, totalCost: 165.84 },
    { name: "Pasta de amendoim", unit: "kg", quantity: 1, minStock: 0.5, costPerUnit: 39.90, totalCost: 39.90 },
    { name: "Whey isolado", unit: "gramas", quantity: 900, minStock: 200, costPerUnit: 132.78, totalCost: 119.50 },
    { name: "Palitos", unit: "unidades", quantity: 10000, minStock: 1000, costPerUnit: 0.023, totalCost: 233.90 },
    { name: "Embalagens neutras", unit: "unidades", quantity: 1000, minStock: 200, costPerUnit: 0.019, totalCost: 18.94 },
  ];

  for (const s of supplies) {
    const existing = await prisma.supply.findFirst({ where: { name: s.name } });
    if (!existing) {
      await prisma.supply.create({ data: s });
    }
  }

  // Seed products (sabores protein low carb)
  const proteico = await prisma.category.findUnique({ where: { slug: "proteico" } });
  if (!proteico) return;

  const products = [
    {
      name: "Protein Chocolate Low Carb",
      description: "Paleta proteica de chocolate com whey isolado, low carb. 100ml.",
      price: 8.00,
      costPerBatch: 26.63,
      costPerUnit: 2.66,
      maxProduction: 60,
      limitingIngredient: "Whey isolado",
      recipe: [
        { supply: "Leite em pó", quantity: 120 },        // gramas por batelada
        { supply: "Whey isolado", quantity: 150 },
        { supply: "Glucose líquida", quantity: 40 },
        { supply: "Super liga neutra", quantity: 10 },
        { supply: "Emulsificante", quantity: 5 },
        { supply: "Cacau em pó 100%", quantity: 30 },
        { supply: "Palitos", quantity: 10 },
        { supply: "Embalagens neutras", quantity: 10 },
      ],
    },
    {
      name: "Protein Peanut Cream Low Carb",
      description: "Paleta proteica de creme de amendoim com whey isolado, low carb. 100ml.",
      price: 8.00,
      costPerBatch: 29.22,
      costPerUnit: 2.92,
      maxProduction: 60,
      limitingIngredient: "Whey isolado",
      recipe: [
        { supply: "Leite em pó", quantity: 120 },
        { supply: "Whey isolado", quantity: 150 },
        { supply: "Glucose líquida", quantity: 40 },
        { supply: "Super liga neutra", quantity: 10 },
        { supply: "Emulsificante", quantity: 5 },
        { supply: "Pasta de amendoim", quantity: 120 },
        { supply: "Palitos", quantity: 10 },
        { supply: "Embalagens neutras", quantity: 10 },
      ],
    },
    {
      name: "Protein Peanut Cacao Low Carb",
      description: "Paleta proteica de amendoim com cacau e whey isolado, low carb. 100ml.",
      price: 8.50,
      costPerBatch: 30.32,
      costPerUnit: 3.03,
      maxProduction: 60,
      limitingIngredient: "Whey isolado",
      recipe: [
        { supply: "Leite em pó", quantity: 120 },
        { supply: "Whey isolado", quantity: 150 },
        { supply: "Glucose líquida", quantity: 40 },
        { supply: "Super liga neutra", quantity: 10 },
        { supply: "Emulsificante", quantity: 5 },
        { supply: "Pasta de amendoim", quantity: 120 },
        { supply: "Cacau em pó 100%", quantity: 15 },
        { supply: "Palitos", quantity: 10 },
        { supply: "Embalagens neutras", quantity: 10 },
      ],
    },
    {
      name: "Protein Ovomaltine",
      description: "Paleta proteica de Ovomaltine com whey isolado. Linha indulgente/fit. 100ml.",
      price: 8.00,
      costPerBatch: 24.42,
      costPerUnit: 2.44,
      maxProduction: 70,
      limitingIngredient: "Whey isolado",
      recipe: [
        { supply: "Leite em pó", quantity: 120 },
        { supply: "Whey isolado", quantity: 120 },
        { supply: "Glucose líquida", quantity: 40 },
        { supply: "Super liga neutra", quantity: 10 },
        { supply: "Emulsificante", quantity: 5 },
        { supply: "Ovomaltine flocos", quantity: 80 },
        { supply: "Palitos", quantity: 10 },
        { supply: "Embalagens neutras", quantity: 10 },
      ],
    },
  ];

  for (const p of products) {
    const existing = await prisma.product.findFirst({ where: { name: p.name } });
    if (existing) continue;

    const product = await prisma.product.create({
      data: {
        name: p.name,
        description: p.description,
        price: p.price,
        categoryId: proteico.id,
        costPerBatch: p.costPerBatch,
        costPerUnit: p.costPerUnit,
        maxProduction: p.maxProduction,
        limitingIngredient: p.limitingIngredient,
      },
    });

    // Create stock entry
    await prisma.stock.create({
      data: { productId: product.id, quantity: 0, minStock: 10 },
    });

    // Create recipe items
    for (const item of p.recipe) {
      const supply = await prisma.supply.findFirst({ where: { name: item.supply } });
      if (supply) {
        await prisma.recipeItem.create({
          data: {
            productId: product.id,
            supplyId: supply.id,
            quantityPerBatch: item.quantity,
          },
        });
      }
    }
  }
}
