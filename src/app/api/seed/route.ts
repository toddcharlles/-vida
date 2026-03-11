import { NextResponse } from "next/server";
import { seedAdmin } from "@/lib/auth";

export async function POST() {
  try {
    await seedAdmin();
    return NextResponse.json({ ok: true, message: "Seed executado com sucesso" });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao executar seed: " + error }, { status: 500 });
  }
}
