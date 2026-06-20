import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const paymentId = parseInt(id);
    if (isNaN(paymentId)) return NextResponse.json({ error: "ID inválido" }, { status: 400 });

    const payment = await prisma.planPayment.findUnique({ where: { id: paymentId } });
    if (!payment) return NextResponse.json({ error: "Pago no encontrado" }, { status: 404 });

    await prisma.planPayment.delete({ where: { id: paymentId } });

    await prisma.treatmentPlan.update({
      where: { id: payment.planId },
      data: { paidAmount: { decrement: payment.amount } },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error al eliminar pago:", error);
    return NextResponse.json({ error: "Error al eliminar pago" }, { status: 500 });
  }
}
