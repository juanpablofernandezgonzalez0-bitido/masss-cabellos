import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Plus, Package, AlertTriangle, Tags } from "lucide-react";
import { DeleteButton } from "@/components/delete-button";
import { getCurrentUser } from "@/lib/session";

async function getProducts() {
  return prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    where: { isActive: true },
  });
}

export default async function ProductsPage() {
  const [products, user] = await Promise.all([getProducts(), getCurrentUser()]);
  const isAdmin = user?.role === "admin";

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
              {isAdmin ? "Gestiona tu inventario de productos" : "Consulta de productos disponibles"}
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
        {products.map((product) => (
          <div
            key={product.id}
            className="group relative overflow-hidden rounded-2xl border border-[var(--border)] bg-white shadow-[var(--shadow-sm)] transition-all hover:shadow-[var(--shadow-md)] hover:-translate-y-0.5"
          >
            <div className="relative aspect-square overflow-hidden bg-white">
              {product.image ? (
                <img
                  src={product.image}
                  alt={product.name}
                  className="h-full w-full object-cover object-center transition-all duration-500 group-hover:scale-110 group-hover:brightness-105"
                />
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-2">
                  <Package className="h-12 w-12 text-[var(--muted-foreground)]/40" />
                  <span className="text-xs text-[var(--muted-foreground)]/40">Sin imagen</span>
                </div>
              )}
              <div className="absolute left-3 top-3">
                <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-xs font-medium text-[var(--muted-foreground)] shadow-sm backdrop-blur-sm capitalize">
                  <Tags className="h-3 w-3" />
                  {product.category}
                </span>
              </div>
              {isAdmin && (
                <div className="absolute right-3 top-3 flex gap-1.5 max-sm:opacity-100 sm:opacity-0 sm:transition-all sm:duration-200 sm:group-hover:opacity-100">
                  <Link
                    href={`/products/${product.id}/edit`}
                    className="rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-[var(--muted-foreground)] shadow-md transition-all hover:bg-[var(--primary)] hover:text-white"
                  >
                    Editar
                  </Link>
                  <DeleteButton id={product.id} type="product" />
                </div>
              )}
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
