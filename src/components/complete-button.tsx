"use client";

import { useCallback } from "react";
import { CheckCircle } from "lucide-react";
import { completeAppointment } from "@/lib/actions";

export function CompleteButton({ id, planId }: { id: number; planId?: number | null }) {
  const handleComplete = useCallback(async () => {
    if (window.confirm("¿Marcar esta cita como completada?")) {
      const result = await completeAppointment(id);
      if (result?.treatmentPlanId) {
        if (window.confirm("¿Quieres programar la siguiente sesión?")) {
          window.location.href = `/appointments/new?planId=${result.treatmentPlanId}`;
        }
      }
    }
  }, [id]);

  return (
    <button
      onClick={handleComplete}
      className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-[var(--success)] transition-all hover:bg-[var(--success)]/10"
    >
      <CheckCircle className="h-3.5 w-3.5" /> Completar
    </button>
  );
}
