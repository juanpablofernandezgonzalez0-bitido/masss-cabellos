import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const workers = await prisma.worker.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    });
    return NextResponse.json(workers);
  } catch (error) {
    console.error("Error en workers:", error);
    return NextResponse.json({ error: "Error al obtener trabajadoras" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { name, phone, image } = await request.json();

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "El nombre es requerido" }, { status: 400 });
    }

    const worker = await prisma.worker.create({
      data: { name: name.trim(), phone: phone || "", image: image || "" },
    });

    return NextResponse.json(worker);
  } catch (error) {
    console.error("Error al crear worker:", error);
    return NextResponse.json({ error: "Error al registrar trabajadora" }, { status: 500 });
  }
}
