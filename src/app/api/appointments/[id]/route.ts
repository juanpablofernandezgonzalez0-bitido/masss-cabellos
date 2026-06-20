import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const appointmentId = parseInt(id);
    if (isNaN(appointmentId)) return NextResponse.json({ error: "ID inválido" }, { status: 400 });

    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: { client: { select: { id: true, name: true } }, treatmentPlan: { select: { id: true, description: true } } },
    });

    if (!appointment) return NextResponse.json({ error: "Cita no encontrada" }, { status: 404 });

    return NextResponse.json(appointment);
  } catch (error) {
    console.error("Error al obtener cita:", error);
    return NextResponse.json({ error: "Error al obtener cita" }, { status: 500 });
  }
}
