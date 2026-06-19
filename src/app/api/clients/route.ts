import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const clients = await prisma.client.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    });
    return NextResponse.json(clients);
  } catch (error) {
    console.error("Error en clients:", error);
    return NextResponse.json({ error: "Error al obtener clientes" }, { status: 500 });
  }
}
