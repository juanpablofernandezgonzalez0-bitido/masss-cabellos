"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Pencil } from "lucide-react";
import { EditPayModal } from "./edit-pay-modal";

interface Props {
  payrollId: number;
  workerName: string;
  daysWorked: number;
  amount: number;
  notes: string;
}

export function PayrollActions({ payrollId, workerName, daysWorked, amount, notes }: Props) {
  const [editing, setEditing] = useState(false);
  const router = useRouter();

  const handleDelete = useCallback(async () => {
    if (!window.confirm("¿Estás seguro de eliminar este pago?")) return;
    try {
      const res = await fetch(`/api/payroll/${payrollId}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      router.refresh();
    } catch {
      alert("Error al eliminar el pago");
    }
  }, [payrollId, router]);

  return (
    <>
      <div className="flex items-center gap-1">
        <button
          onClick={() => setEditing(true)}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--muted-foreground)] transition-all hover:bg-amber-50 hover:text-amber-600"
          title="Editar"
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={handleDelete}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-red-400 transition-all hover:bg-red-50 hover:text-red-600"
          title="Eliminar"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
      {editing && (
        <EditPayModal
          payrollId={payrollId}
          workerName={workerName}
          defaultDays={daysWorked}
          defaultAmount={amount}
          defaultNotes={notes}
          onClose={() => setEditing(false)}
        />
      )}
    </>
  );
}
