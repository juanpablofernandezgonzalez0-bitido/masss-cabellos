import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { workerId, daysWorked, amount, notes } = await request.json();

    if (!workerId || !daysWorked || amount == null) {
      return NextResponse.json({ error: "Todos los campos son requeridos" }, { status: 400 });
    }

    const payroll = await prisma.payroll.create({
      data: {
        workerId,
        daysWorked,
        amount,
        notes: notes || "",
      },
    });

    return NextResponse.json(payroll);
  } catch (error) {
    console.error("Error en payroll:", error);
    return NextResponse.json({ error: "Error al registrar pago" }, { status: 500 });
  }
}
