"use client";

import { useCallback } from "react";
import { Trash2 } from "lucide-react";
import {
  deleteProduct,
  deleteClient,
  deleteAppointment,
  deleteSale,
  deletePurchase,
  deleteTreatmentPlan,
  deleteNote,
  deleteManufacture,
  deleteDebt,
  deleteSupplierDebt,
} from "@/lib/actions";

type EntityType = "product" | "client" | "appointment" | "sale" | "purchase" | "treatmentPlan" | "note" | "manufacture" | "debt" | "supplierDebt";

const actions: Record<EntityType, (id: number) => Promise<void>> = {
  product: deleteProduct,
  client: deleteClient,
  appointment: deleteAppointment,
  sale: deleteSale,
  purchase: deletePurchase,
  treatmentPlan: deleteTreatmentPlan,
  note: deleteNote,
  manufacture: deleteManufacture,
  debt: deleteDebt,
  supplierDebt: deleteSupplierDebt,
};

export function DeleteButton({ id, type }: { id: number; type: EntityType }) {
  const handleDelete = useCallback(async () => {
    if (window.confirm("¿Estás seguro de eliminar este registro?")) {
      await actions[type](id);
    }
  }, [id, type]);

  return (
    <button
      onClick={handleDelete}
      className="flex h-8 w-8 items-center justify-center rounded-lg text-red-400 transition-all hover:bg-red-50 hover:text-red-600"
      title="Eliminar"
    >
      <Trash2 className="h-3.5 w-3.5" />
    </button>
  );
}
