"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Plus, Package, AlertTriangle, Tags, GripVertical } from "lucide-react";
import { DeleteButton } from "@/components/delete-button";

interface Product {
  id: number;
  name: string;
  description: string;
  category: string;
  price: number;
  stock: number;
  minStock: number;
  image: string;
  isActive: boolean;
  sortOrder: number;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/products?all=true").then((r) => r.json()),
      fetch("/api/auth/me").then((r) => r.json()),
    ]).then(([productsData, userData]) => {
      setProducts(productsData);
      setIsAdmin(userData?.role === "admin");
      setLoading(false);
    });
  }, []);

  const handleDragStart = useCallback((index: number) => {
    setDragIndex(index);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === index) return;

    const newProducts = [...products];
    const draggedItem = newProducts[dragIndex];
    newProducts.splice(dragIndex, 1);
    newProducts.splice(index, 0, draggedItem);
    setProducts(newProducts);
    setDragIndex(index);
  }, [dragIndex, products]);

  const handleDragEnd = useCallback(async () => {
    setDragIndex(null);
    const reordered = products.map((p, i) => ({ id: p.id, sortOrder: i }));
    try {
      await fetch("/api/products/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: reordered }),
      });
    } catch (e) {
      console.error("Error al guardar orden:", e);
    }
  }, [products]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 animate-pulse rounded-xl bg-[var(--muted)]" />
          <div>
            <div className="h-6 w-40 animate-pulse rounded bg-[var(--muted)]" />
            <div className="mt-1 h-4 w-60 animate-pulse rounded bg-[var(--muted)]" />
          </div>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="aspect-square animate-pulse rounded-2xl bg-[var(--muted)]" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--primary)]/10 to-[var(--secondary)]/10">
            <Package className="h-5 w-5 text-[var(--primary)]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[var(--foreground)]">Productos</h1>
            <p className="text-sm text-[var(--muted-foreground)]">
              {isAdmin ? "Arrastra los productos para reordenarlos" : "Consulta de productos disponibles"}
            </p>
          </div>
        </div>
        {isAdmin && (
          <Link
            href="/products/new"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[var(--primary)] to-[var(--primary-dark)] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[var(--primary)]/20 transition-all hover:shadow-xl hover:shadow-[var(--primary)]/30"
          >
            <Plus className="h-4 w-4" />
            Nuevo Producto
          </Link>
        )}
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {products.map((product, index) => (
          <div
            key={product.id}
            draggable={isAdmin}
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragEnd={handleDragEnd}
            className={`group relative overflow-hidden rounded-2xl border bg-white shadow-[var(--shadow-sm)] transition-all hover:shadow-[var(--shadow-md)] ${dragIndex === index ? "border-[var(--primary)] shadow-md opacity-60" : "border-[var(--border)] hover:-translate-y-0.5"} ${isAdmin ? "cursor-grab active:cursor-grabbing" : ""}`}
          >
            <div className="relative aspect-square overflow-hidden bg-white">
              {isAdmin && (
                <div className="absolute left-3 top-3 z-10 flex items-center gap-1 rounded-lg bg-white/90 px-2 py-1 text-xs text-[var(--muted-foreground)] shadow-sm backdrop-blur-sm opacity-0 transition-opacity group-hover:opacity-100">
                  <GripVertical className="h-3.5 w-3.5" />
                  Arrastrar
                </div>
              )}
              {product.image ? (
                <img
                  src={product.image}
                  alt={product.name}
                  className="h-full w-full object-cover object-center transition-all duration-500 group-hover:scale-110 group-hover:brightness-105"
                  draggable={false}
                />
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-2">
                  <Package className="h-12 w-12 text-[var(--muted-foreground)]/40" />
                  <span className="text-xs text-[var(--muted-foreground)]/40">Sin imagen</span>
                </div>
              )}
              <div className="absolute right-3 top-3 z-10">
                <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-xs font-medium text-[var(--muted-foreground)] shadow-sm backdrop-blur-sm capitalize">
                  <Tags className="h-3 w-3" />
                  {product.category}
                </span>
              </div>
              <div className="absolute bottom-3 right-3 flex gap-1.5 max-sm:opacity-100 sm:opacity-0 sm:transition-all sm:duration-200 sm:group-hover:opacity-100">
                {isAdmin && (
                  <>
                    <Link
                      href={`/products/${product.id}/edit`}
                      className="rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-[var(--muted-foreground)] shadow-md transition-all hover:bg-[var(--primary)] hover:text-white"
                    >
                      Editar
                    </Link>
                    <DeleteButton id={product.id} type="product" />
                  </>
                )}
              </div>
              {product.stock <= product.minStock && (
                <div className="absolute bottom-3 left-3 flex items-center gap-1 rounded-full bg-red-500/90 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">
                  <AlertTriangle className="h-3 w-3" />
                  Stock bajo
                </div>
              )}
            </div>
            <div className="p-4">
              <h3 className="font-semibold leading-tight text-[var(--foreground)]">{product.name}</h3>
              {product.description && (
                <p className="mt-1 line-clamp-2 text-xs text-[var(--muted-foreground)]">{product.description}</p>
              )}
              <div className="mt-4 flex items-center justify-between border-t border-[var(--border)] pt-3">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-[var(--muted-foreground)]">Stock:</span>
                  <span className={`text-sm font-semibold ${
                    product.stock <= product.minStock ? "text-red-500" : "text-[var(--foreground)]"
                  }`}>
                    {product.stock}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-base font-bold text-[var(--primary)]">
                    ${product.price.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
        {products.length === 0 && (
          <div className="col-span-full rounded-2xl border-2 border-dashed border-[var(--border)] bg-white p-16 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--muted)]">
              <Package className="h-8 w-8 text-[var(--muted-foreground)]" />
            </div>
            <p className="text-lg font-medium text-[var(--foreground)]">No hay productos registrados</p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">Comienza agregando tu primer producto al inventario</p>
            {isAdmin && (
              <Link
                href="/products/new"
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[var(--primary)] to-[var(--primary-dark)] px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition-all hover:shadow-xl"
              >
                <Plus className="h-4 w-4" />
                Crear primer producto
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
