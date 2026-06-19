import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "ID requerido" }, { status: 400 });
    }
    const planId = parseInt(id);
    if (isNaN(planId)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }
    const plan = await prisma.treatmentPlan.findUnique({
      where: { id: planId },
      include: { client: true },
    });
    if (!plan) {
      return NextResponse.json({ error: "Plan no encontrado" }, { status: 404 });
    }
    return NextResponse.json(plan);
  } catch (error) {
    console.error("Error en treatment-plans:", error);
    return NextResponse.json({ error: "Error al obtener plan" }, { status: 500 });
  }
}
