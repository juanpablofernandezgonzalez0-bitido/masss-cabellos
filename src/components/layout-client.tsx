"use client";

import { useState } from "react";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";

interface LayoutClientProps {
  role: "admin" | "worker";
  user: { name: string; username: string; role: string };
  children: React.ReactNode;
}

export function LayoutClient({ role, user, children }: LayoutClientProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-[#fdf8f6]">
      <Sidebar role={role} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/30 sm:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <div className="relative flex flex-1 flex-col overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 bg-center bg-no-repeat opacity-[0.06]"
          style={{ backgroundImage: "url('/logo-bg.png')", backgroundSize: "min(500px, 70%)" }}
        />
        <Header user={user} onToggleSidebar={() => setSidebarOpen((v) => !v)} />
        <main className="relative flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 animate-in">
          {children}
        </main>
      </div>
    </div>
  );
}
