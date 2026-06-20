import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const all = searchParams.get("all") === "true";
    const products = await prisma.product.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      ...(all ? {} : {
        select: { id: true, name: true, price: true, stock: true, image: true },
      }),
    });
    return NextResponse.json(products);
  } catch (error) {
    console.error("Error en products:", error);
    return NextResponse.json({ error: "Error al obtener productos" }, { status: 500 });
  }
}
