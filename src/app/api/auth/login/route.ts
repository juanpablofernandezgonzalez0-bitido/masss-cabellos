import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createToken } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ error: "Usuario y contraseña requeridos" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { username } });

    if (!user || !user.isActive) {
      return NextResponse.json({ error: "Usuario o contraseña incorrectos" }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return NextResponse.json({ error: "Usuario o contraseña incorrectos" }, { status: 401 });
    }

    const token = await createToken({
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role as "admin" | "worker",
    });

    const response = NextResponse.json({
      user: { id: user.id, username: user.username, name: user.name, role: user.role },
    });

    response.cookies.set("session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24,
      path: "/",
    });

    return response;
  } catch {
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}
