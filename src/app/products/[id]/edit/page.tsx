"use client";

import { useState, useEffect } from "react";
import { updateProduct } from "@/lib/actions";
import { ArrowLeft, Package } from "lucide-react";
import Link from "next/link";
import { ImageUpload } from "@/components/image-upload";
import { useParams } from "next/navigation";

const categories = ["general", "champú", "acondicionador", "crema para peinar", "tratamiento", "caída del cabello", "limpieza", "otros"];

interface ProductData {
  id: number;
  name: string;
  description: string;
  category: string;
  price: number;
  cost: number;
  stock: number;
  minStock: number;
  image: string;
}

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<ProductData | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/products/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setProduct(data);
        setImageUrl(data.image || "");
        setLoading(false);
      });
  }, [id]);

  const handleSubmit = async (formData: FormData) => {
    formData.set("image", imageUrl);
    await updateProduct(parseInt(id), formData);
    window.location.href = "/products";
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20"><div className="h-10 w-10 animate-spin rounded-full border-3 border-[var(--primary)] border-t-transparent" /></div>;
  }

  if (!product) {
    return <div className="flex flex-col items-center gap-3 py-20 text-[var(--muted-foreground)]">
      <Package className="h-12 w-12" />
      <p>Producto no encontrado</p>
    </div>;
  }

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
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Editar Producto</h1>
          <p className="text-sm text-[var(--muted-foreground)]">Modifica los datos del producto</p>
        </div>
      </div>

      <form action={handleSubmit} className="space-y-6 rounded-2xl border border-[var(--border)] bg-white p-8 shadow-[var(--shadow-sm)]">
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="mb-2 block text-sm font-medium text-[var(--foreground)]">Nombre del producto</label>
            <input name="name" required defaultValue={product.name} className="form-input" />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-2 block text-sm font-medium text-[var(--foreground)]">Descripción</label>
            <textarea name="description" rows={3} defaultValue={product.description} className="form-input" />
          </div>
          <div className="sm:col-span-2">
            <ImageUpload currentImage={product.image} onImageUploaded={setImageUrl} />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-[var(--foreground)]">Categoría</label>
            <select name="category" defaultValue={product.category} className="form-input">
              {categories.map((c) => (
                <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-[var(--foreground)]">Stock</label>
            <input name="stock" type="number" min="0" defaultValue={product.stock} className="form-input" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-[var(--foreground)]">Precio de Venta ($)</label>
            <input name="price" type="number" min="0" step="0.01" required defaultValue={product.price} className="form-input" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-[var(--foreground)]">Costo ($)</label>
            <input name="cost" type="number" min="0" step="0.01" defaultValue={product.cost} className="form-input" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-[var(--foreground)]">Stock Mínimo</label>
            <input name="minStock" type="number" min="0" defaultValue={product.minStock} className="form-input" />
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 border-t border-[var(--border)] pt-6">
          <Link href="/products" className="btn-secondary">Cancelar</Link>
          <button type="submit" className="btn-primary">Actualizar Producto</button>
        </div>
      </form>
    </div>
  );
}
