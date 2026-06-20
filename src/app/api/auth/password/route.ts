import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";

export async function PATCH(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;
    if (!token) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const payload = await verifyToken(token);
    if (!payload || payload.role !== "admin") {
      return NextResponse.json({ error: "Solo administradores pueden cambiar contraseñas" }, { status: 403 });
    }

    const { userId, newPassword } = await request.json();
    if (!newPassword) {
      return NextResponse.json({ error: "La nueva contraseña es requerida" }, { status: 400 });
    }
    if (newPassword.length < 6) {
      return NextResponse.json({ error: "La contraseña debe tener al menos 6 caracteres" }, { status: 400 });
    }

    const targetId = userId ? parseInt(userId) : payload.id;
    if (isNaN(targetId)) return NextResponse.json({ error: "ID inválido" }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { id: targetId } });
    if (!user) return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });

    const hashed = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { id: targetId }, data: { password: hashed } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error al cambiar contraseña:", error);
    return NextResponse.json({ error: "Error al cambiar contraseña" }, { status: 500 });
  }
}
