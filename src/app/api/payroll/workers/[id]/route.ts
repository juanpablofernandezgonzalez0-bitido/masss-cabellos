import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const workerId = parseInt(id);
    if (isNaN(workerId)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    await prisma.worker.delete({ where: { id: workerId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error al eliminar trabajadora:", error);
    return NextResponse.json({ error: "Error al eliminar trabajadora" }, { status: 500 });
  }
}
