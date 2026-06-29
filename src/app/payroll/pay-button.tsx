"use client";

import { useState } from "react";
import { DollarSign } from "lucide-react";
import { PayModal } from "./pay-modal";

interface Props {
  workerId: number;
  workerName: string;
  attendanceDays?: number;
}

export function PayButton({ workerId, workerName, attendanceDays }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:shadow-md shrink-0"
      >
        <DollarSign className="h-3.5 w-3.5" />
        Pagar Nómina
      </button>
      {open && (
        <PayModal
          workerId={workerId}
          workerName={workerName}
          suggestedDays={attendanceDays}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
