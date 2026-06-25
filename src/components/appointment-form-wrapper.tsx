"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { safeCreateAppointment } from "@/lib/actions";
import { AlertTriangle, X } from "lucide-react";

export function AppointmentFormWrapper({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [result, submitAction, pending] = useActionState(
    async (_prev: string, formData: FormData): Promise<string> => {
      const res = await safeCreateAppointment(formData);
      if (res.success) {
        router.push("/appointments");
        return "";
      }
      return res.error;
    },
    ""
  );

  useEffect(() => {
    if (result) {
      setErrorMsg(result);
      setShowModal(true);
    }
  }, [result]);

  return (
    <>
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <button
              onClick={() => setShowModal(false)}
              className="absolute right-3 top-3 text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mx-auto mb-4">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="mb-2 text-center text-lg font-semibold text-gray-900">
              Cliente no registrado
            </h3>
            <p className="mb-6 text-center text-sm text-gray-600">
              {errorMsg.includes("no encontrado")
                ? "Este cliente no está registrado en el sistema. Debes agregarlo primero en la sección Clientes antes de crear una cita."
                : errorMsg}
            </p>
            <button
              onClick={() => setShowModal(false)}
              className="mx-auto block rounded-lg bg-[var(--primary)] px-6 py-2 text-sm font-medium text-white transition-colors hover:opacity-90"
            >
              Entendido
            </button>
          </div>
        </div>
      )}

      <form action={submitAction} className="space-y-6 rounded-2xl border border-[var(--border)] bg-white p-8 shadow-[var(--shadow-sm)]">
        {children}

        <div className="flex items-center justify-end gap-3 border-t border-[var(--border)] pt-6">
          <a href="/appointments" className="btn-secondary">Cancelar</a>
          <button type="submit" disabled={pending} className="btn-primary">
            {pending ? "Guardando..." : "Guardar Cita"}
          </button>
        </div>
      </form>
    </>
  );
}
