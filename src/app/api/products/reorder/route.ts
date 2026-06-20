import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { items } = await request.json() as { items: { id: number; sortOrder: number }[] };
    if (!items || !Array.isArray(items)) {
      return NextResponse.json({ error: "items requerido" }, { status: 400 });
    }
    await prisma.$transaction(
      items.map((item) =>
        prisma.product.update({
          where: { id: item.id },
          data: { sortOrder: item.sortOrder },
        })
      )
    );
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error al reordenar:", error);
    return NextResponse.json({ error: "Error al reordenar productos" }, { status: 500 });
  }
}
