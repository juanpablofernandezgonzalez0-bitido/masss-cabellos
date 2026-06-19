import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true, price: true, stock: true },
    });
    return NextResponse.json(products);
  } catch (error) {
    console.error("Error en products:", error);
    return NextResponse.json({ error: "Error al obtener productos" }, { status: 500 });
  }
}
