"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

export function DeleteWorkerButton({ workerId, workerName }: { workerId: number; workerName: string }) {
  const router = useRouter();

  const handleDelete = useCallback(async () => {
    if (!window.confirm(`¿Estás seguro de eliminar a "${workerName}"? También se borrarán sus pagos.`)) return;
    try {
      const res = await fetch(`/api/payroll/workers/${workerId}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      router.refresh();
    } catch {
      alert("Error al eliminar la trabajadora");
    }
  }, [workerId, workerName, router]);

  return (
    <button
      onClick={handleDelete}
      className="flex h-8 w-8 items-center justify-center rounded-lg text-red-400 transition-all hover:bg-red-50 hover:text-red-600"
      title="Eliminar trabajadora"
    >
      <Trash2 className="h-3.5 w-3.5" />
    </button>
  );
}
