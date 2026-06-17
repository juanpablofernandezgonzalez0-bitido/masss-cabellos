import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { PdfDownloadButton } from "./pdf-download";

export default async function SaleInvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const saleId = parseInt(id);
  if (isNaN(saleId)) notFound();

  const sale = await prisma.sale.findUnique({
    where: { id: saleId },
    include: {
      client: true,
      items: { include: { product: true } },
    },
  });

  if (!sale) notFound();

  const h = await headers();
  const host = h.get("host") || "localhost:3000";
  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
  const baseUrl = `${protocol}://${host}`;
  const invoiceUrl = `${baseUrl}/sales/${sale.id}`;

  const invoiceNum = String(sale.id).padStart(5, "0");
  const date = new Date(sale.createdAt);
  const clientName = sale.client?.name ?? "Cliente General";

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/sales" className="inline-flex items-center gap-1.5 text-sm text-[var(--muted-foreground)] transition-colors hover:text-[var(--primary)]">
          <ArrowLeft className="h-4 w-4" /> Volver a ventas
        </Link>
        <PdfDownloadButton
            invoiceNum={invoiceNum}
            total={sale.total}
            paid={sale.paid}
            change={sale.change}
            clientName={clientName}
            date={date.toLocaleDateString("es-CO", { year: "numeric", month: "long", day: "numeric" })}
            invoiceUrl={invoiceUrl}
            items={sale.items.map((i) => ({
              name: i.product ? i.product.name : i.customDescription,
              quantity: i.quantity,
              unitPrice: i.unitPrice,
              subtotal: i.subtotal,
            }))}
          />
      </div>

      <div id="invoice" className="rounded-2xl border border-[var(--border)] bg-white p-8 shadow-[var(--shadow-sm)]">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between border-b border-[var(--border)] pb-6">
          <div className="flex items-center gap-4">
            <img src="/logo.png" alt="Masss Cabellos" className="h-16 w-16 rounded-2xl object-contain shadow-lg" />
            <div>
              <h1 className="text-xl font-bold text-[var(--foreground)]">Masss Cabellos</h1>
              <p className="text-sm text-[var(--muted-foreground)]">Estética y Bienestar</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs font-medium uppercase tracking-wider text-[var(--muted-foreground)]">Factura</p>
            <p className="text-lg font-bold text-[var(--foreground)]">#{invoiceNum}</p>
          </div>
        </div>

        {/* Info */}
        <div className="mb-8 grid grid-cols-2 gap-6">
          <div>
            <p className="mb-1 text-xs font-medium uppercase tracking-wider text-[var(--muted-foreground)]">Cliente</p>
            <p className="text-sm font-semibold text-[var(--foreground)]">{clientName}</p>
          </div>
          <div className="text-right">
            <p className="mb-1 text-xs font-medium uppercase tracking-wider text-[var(--muted-foreground)]">Fecha</p>
            <p className="text-sm font-semibold text-[var(--foreground)]">
              {date.toLocaleDateString("es-CO", { year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-[var(--border)]">
              <th className="pb-3 text-left text-xs font-medium uppercase tracking-wider text-[var(--muted-foreground)]">Producto</th>
              <th className="pb-3 text-center text-xs font-medium uppercase tracking-wider text-[var(--muted-foreground)]">Cant.</th>
              <th className="pb-3 text-right text-xs font-medium uppercase tracking-wider text-[var(--muted-foreground)]">Precio</th>
              <th className="pb-3 text-right text-xs font-medium uppercase tracking-wider text-[var(--muted-foreground)]">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {sale.items.map((item, i) => (
              <tr key={item.id} className="border-b border-[var(--border)]/50">
                <td className="py-3 text-sm font-medium text-[var(--foreground)]">
                  {item.product ? item.product.name : item.customDescription}
                </td>
                <td className="py-3 text-center text-sm text-[var(--muted-foreground)]">{item.quantity}</td>
                <td className="py-3 text-right text-sm text-[var(--muted-foreground)]">{formatCurrency(item.unitPrice)}</td>
                <td className="py-3 text-right text-sm font-semibold text-[var(--foreground)]">{formatCurrency(item.subtotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>

        {/* Total */}
        <div className="mt-6 flex justify-end">
          <div className="w-64 space-y-2">
            <div className="rounded-xl bg-gradient-to-r from-[#fdf8f6] to-[#fef0f0] p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-[var(--muted-foreground)]">Total</span>
                <span className="text-xl font-bold text-[var(--foreground)]">{formatCurrency(sale.total)}</span>
              </div>
            </div>
            {sale.paid > 0 && (
              <>
                <div className="rounded-xl bg-[var(--muted)] p-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[var(--muted-foreground)]">Paga con</span>
                    <span className="font-semibold text-[var(--foreground)]">{formatCurrency(sale.paid)}</span>
                  </div>
                </div>
                <div className="rounded-xl bg-[var(--success-light)] p-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[var(--success)] font-medium">Vuelto</span>
                    <span className="font-bold text-[var(--success)]">{formatCurrency(sale.change)}</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 border-t border-[var(--border)] pt-6 text-center">
          <p className="text-xs text-[var(--muted-foreground)]">
            Masss Cabellos — ¡Gracias por tu preferencia!
          </p>
        </div>
      </div>
    </div>
  );
}