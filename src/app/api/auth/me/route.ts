import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;

    if (!token) {
      return NextResponse.json({ user: null });
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json({ user: null });
    }

    return NextResponse.json({
      user: { id: payload.id, username: payload.username, name: payload.name, role: payload.role },
    });
  } catch (error) {
    console.error("Error en auth/me:", error);
    return NextResponse.json({ user: null }, { status: 500 });
  }
}
