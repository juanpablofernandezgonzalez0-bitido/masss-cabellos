import { NextResponse } from "next/server";
import * as fs from "fs";
import path from "path";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No se proporcionó un archivo" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const ext = path.extname(file.name) || ".jpg";
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;

    const uploadDir = path.join(process.cwd(), "public", "uploads", "products");
    await fs.promises.mkdir(uploadDir, { recursive: true });
    await fs.promises.writeFile(path.join(uploadDir, filename), buffer);

    return NextResponse.json({ url: `/uploads/products/${filename}` });
  } catch (error) {
    return NextResponse.json({ error: "Error al subir la imagen" }, { status: 500 });
  }
}
