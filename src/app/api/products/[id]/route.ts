import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const productId = parseInt(id);
    if (isNaN(productId)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
    }
    return NextResponse.json(product);
  } catch (error) {
    console.error("Error en products/[id]:", error);
    return NextResponse.json({ error: "Error al obtener producto" }, { status: 500 });
  }
}
