"use client";

import { useState } from "react";
import { createProduct } from "@/lib/actions";
import { ArrowLeft, Package } from "lucide-react";
import Link from "next/link";
import { ImageUpload } from "@/components/image-upload";

const categories = ["general", "champú", "acondicionador", "crema para peinar", "tratamiento", "caída del cabello", "limpieza", "otros"];

export default function NewProductPage() {
  const [imageUrl, setImageUrl] = useState("");

  const handleSubmit = async (formData: FormData) => {
    formData.set("image", imageUrl);
    await createProduct(formData);
    window.location.href = "/products";
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link href="/products" className="inline-flex items-center gap-1.5 text-sm text-[var(--muted-foreground)] transition-colors hover:text-[var(--primary)]">
        <ArrowLeft className="h-4 w-4" /> Volver a productos
      </Link>
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--primary)]/10 to-[var(--secondary)]/10">
          <Package className="h-5 w-5 text-[var(--primary)]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Nuevo Producto</h1>
          <p className="text-sm text-[var(--muted-foreground)]">Agrega un nuevo producto al inventario</p>
        </div>
      </div>

      <form action={handleSubmit} className="space-y-6 rounded-2xl border border-[var(--border)] bg-white p-8 shadow-[var(--shadow-sm)]">
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="mb-2 block text-sm font-medium text-[var(--foreground)]">Nombre del producto</label>
            <input name="name" required className="form-input" placeholder="Ej: Hydros Crema para Peinar" />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-2 block text-sm font-medium text-[var(--foreground)]">Descripción</label>
            <textarea name="description" rows={3} className="form-input" placeholder="Descripción del producto..." />
          </div>
          <div className="sm:col-span-2">
            <ImageUpload onImageUploaded={setImageUrl} />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-[var(--foreground)]">Categoría</label>
            <select name="category" className="form-input">
              {categories.map((c) => (
                <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-[var(--foreground)]">Stock Inicial</label>
            <input name="stock" type="number" min="0" defaultValue="0" className="form-input" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-[var(--foreground)]">Precio de Venta ($)</label>
            <input name="price" type="number" min="0" step="0.01" required className="form-input" placeholder="0" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-[var(--foreground)]">Costo ($)</label>
            <input name="cost" type="number" min="0" step="0.01" className="form-input" placeholder="0" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-[var(--foreground)]">Stock Mínimo</label>
            <input name="minStock" type="number" min="0" defaultValue="5" className="form-input" />
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 border-t border-[var(--border)] pt-6">
          <Link href="/products" className="btn-secondary">Cancelar</Link>
          <button type="submit" className="btn-primary">Guardar Producto</button>
        </div>
      </form>
    </div>
  );
}
