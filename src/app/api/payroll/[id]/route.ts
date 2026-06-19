import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const payrollId = parseInt(id);
    if (isNaN(payrollId)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const { daysWorked, amount, notes } = await request.json();
    if (!daysWorked || amount == null) {
      return NextResponse.json({ error: "Días y monto requeridos" }, { status: 400 });
    }

    const payroll = await prisma.payroll.update({
      where: { id: payrollId },
      data: { daysWorked, amount, notes: notes || "" },
    });

    return NextResponse.json(payroll);
  } catch (error) {
    console.error("Error al editar payroll:", error);
    return NextResponse.json({ error: "Error al editar pago" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const payrollId = parseInt(id);
    if (isNaN(payrollId)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    await prisma.payroll.delete({ where: { id: payrollId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error al borrar payroll:", error);
    return NextResponse.json({ error: "Error al borrar pago" }, { status: 500 });
  }
}
