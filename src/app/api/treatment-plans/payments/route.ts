import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const planId = searchParams.get("planId");
    if (!planId) return NextResponse.json({ error: "planId requerido" }, { status: 400 });
    const payments = await prisma.planPayment.findMany({
      where: { planId: parseInt(planId) },
      orderBy: { paidAt: "desc" },
    });
    return NextResponse.json(payments);
  } catch (error) {
    console.error("Error en plan payments:", error);
    return NextResponse.json({ error: "Error al obtener pagos" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { planId, amount, notes } = await request.json();
    if (!planId || !amount) {
      return NextResponse.json({ error: "planId y amount requeridos" }, { status: 400 });
    }
    const plan = await prisma.treatmentPlan.findUnique({ where: { id: planId } });
    if (!plan) return NextResponse.json({ error: "Plan no encontrado" }, { status: 404 });

    const payment = await prisma.planPayment.create({
      data: { planId, amount, notes: notes || "" },
    });

    await prisma.treatmentPlan.update({
      where: { id: planId },
      data: { paidAmount: { increment: amount } },
    });

    return NextResponse.json(payment);
  } catch (error) {
    console.error("Error al crear pago:", error);
    return NextResponse.json({ error: "Error al crear pago" }, { status: 500 });
  }
}
