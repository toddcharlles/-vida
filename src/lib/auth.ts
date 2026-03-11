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
}
