import type { Metadata, Viewport } from "next";
import "./globals.css";
import { getCurrentUser } from "@/lib/session";
import { LayoutClient } from "@/components/layout-client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Masss Cabellos - Sistema de Gestión",
  description: "Sistema de gestión para microempresa de cuidado capilar",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <html lang="es">
        <body className="bg-gradient-to-br from-[#fdf8f6] via-[#fdf0f4] to-[#fce4ec]">
          <div className="relative min-h-screen">
            <div
              className="pointer-events-none fixed inset-0 bg-center bg-no-repeat opacity-[0.06]"
              style={{ backgroundImage: "url('/logo-bg.png')", backgroundSize: "min(500px, 70%)" }}
            />
            {children}
          </div>
        </body>
      </html>
    );
  }

  return (
    <html lang="es">
      <body>
        <LayoutClient role={user.role} user={user}>
          {children}
        </LayoutClient>
      </body>
    </html>
  );
}
