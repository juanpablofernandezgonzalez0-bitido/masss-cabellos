import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "@/lib/auth";

const publicPaths = ["/login", "/api/auth/login"];

const staticFileRegex = /\.(png|jpg|jpeg|svg|ico|webp|gif|avif|css|js|woff2?|ttf|eot|pdf)$/;

const adminOnlyPaths = [
  "/products/new",
  "/purchases",
  "/purchases/new",
  "/payroll",
  "/api/payroll",
  "/api/upload",
  "/inventory",
];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (publicPaths.some((p) => pathname.startsWith(p)) || staticFileRegex.test(pathname)) {
    return NextResponse.next();
  }

  const token = request.cookies.get("session")?.value;

  if (!token) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const payload = await verifyToken(token);

  if (!payload) {
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete("session");
    return response;
  }

  if (adminOnlyPaths.some((p) => pathname.startsWith(p)) && payload.role !== "admin") {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "No tienes permisos" }, { status: 403 });
    }
    return NextResponse.redirect(new URL("/?error=sin_permisos", request.url));
  }

  if (pathname.startsWith("/products/") && pathname !== "/products" && payload.role !== "admin") {
    if (pathname.endsWith("/edit")) {
      return NextResponse.redirect(new URL("/?error=sin_permisos", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|uploads/).*)",
  ],
};
