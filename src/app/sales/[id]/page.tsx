import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { PdfDownloadButton } from "./pdf-download";
import { PrintButton } from "./print-button";

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

  const invoiceNum = String(sale.id).padStart(5, "0");
  const date = new Date(sale.createdAt);
  const clientName = sale.client?.name ?? "Cliente General";
  const dateStr = date.toLocaleDateString("es-CO", { timeZone: "America/Bogota", year: "numeric", month: "long", day: "numeric" });
  const timeStr = date.toLocaleTimeString("es-CO", { timeZone: "America/Bogota", hour: "2-digit", minute: "2-digit", hour12: true });

  return (
    <>
      <style>{`
        @page { size: 80mm 297mm; margin: 3mm; }
        @media print {
          body * { visibility: hidden; }
          #invoice-print, #invoice-print * { visibility: visible; }
          #invoice-print {
            position: absolute; left: 0; top: 0;
            width: 100%; max-width: 80mm;
            border: none !important; border-radius: 0 !important;
            box-shadow: none !important;
          }
          #invoice-print .no-print { display: none !important; }
          .no-print { display: none !important; }
        }
      `}</style>
      <div className="mx-auto max-w-sm space-y-6">
        <div className="no-print flex items-center justify-between">
          <Link href="/sales" className="inline-flex items-center gap-1.5 text-sm text-[var(--muted-foreground)] transition-colors hover:text-[var(--primary)]">
            <ArrowLeft className="h-4 w-4" /> Volver
          </Link>
          <div className="flex items-center gap-2">
            <PrintButton />
            <PdfDownloadButton
          invoiceNum={invoiceNum}
          total={sale.total}
          paid={sale.paid}
          change={sale.change}
          paymentMethod={sale.paymentMethod}
          clientName={clientName}
          date={`${dateStr} ${timeStr}`}
          items={sale.items.map((i) => ({
            name: i.product ? i.product.name : i.customDescription,
            quantity: i.quantity,
            unitPrice: i.unitPrice,
            subtotal: i.subtotal,
          }))}
        />
          </div>
        </div>

        <div id="invoice-print" className="overflow-hidden rounded-2xl border border-[var(--border)] bg-white shadow-[var(--shadow-sm)]">
        <div className="border-b border-[var(--border)] bg-gradient-to-r from-[#fdf8f6] to-[#fef0f0] px-4 py-4 text-center">
          <img src="/logo.png" alt="Masss Cabellos" className="mx-auto h-14 w-auto mb-1" />
          <h1 className="text-lg font-bold text-[var(--foreground)]">MASSS CABELLOS</h1>
          <p className="text-xs text-[var(--muted-foreground)]">Estética y Bienestar</p>
          <p className="mt-1 text-xs text-[var(--muted-foreground)]">{dateStr}</p>
        </div>

        <div className="border-b border-dashed border-[var(--border)] px-4 py-3">
          <p className="text-xs font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
            Factura No. {invoiceNum}
          </p>
          <p className="mt-1 text-sm text-[var(--foreground)]">
            Cliente: <span className="font-semibold">{clientName}</span>
          </p>
          <p className="text-xs text-[var(--muted-foreground)]">{timeStr}</p>
        </div>

        <div className="border-b border-dashed border-[var(--border)] px-4 py-2">
          <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
            <span>Producto</span>
            <span>Total</span>
          </div>
        </div>

        <div className="divide-y divide-[var(--border)]/50">
          {sale.items.map((item) => (
            <div key={item.id} className="px-4 py-2.5">
              <p className="text-sm font-medium text-[var(--foreground)]">
                {item.product ? item.product.name : item.customDescription}
              </p>
              <div className="mt-0.5 flex justify-between text-xs text-[var(--muted-foreground)]">
                <span>{item.quantity} x {formatCurrency(item.unitPrice)}</span>
                <span className="font-semibold text-[var(--foreground)]">{formatCurrency(item.subtotal)}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-dashed border-[var(--border)] px-4 py-3">
          <div className="flex justify-between">
            <span className="text-sm font-bold text-[var(--foreground)]">TOTAL</span>
            <span className="text-lg font-bold text-[var(--foreground)]">{formatCurrency(sale.total)}</span>
          </div>
          <div className="mt-1 flex justify-between text-sm">
            <span className="text-[var(--muted-foreground)]">Método de pago:</span>
            <span className="font-semibold text-[var(--foreground)]">{sale.paymentMethod === "transferencia" ? "Transferencia" : "Efectivo"}</span>
          </div>
          {sale.paid > 0 && (
            <>
              <div className="mt-1 flex justify-between text-sm">
                <span className="text-[var(--muted-foreground)]">Paga con:</span>
                <span className="font-semibold text-[var(--foreground)]">{formatCurrency(sale.paid)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="font-medium text-green-600">Vuelto:</span>
                <span className="font-bold text-green-600">{formatCurrency(sale.change)}</span>
              </div>
            </>
          )}
        </div>

        <div className="border-t border-dashed border-[var(--border)] bg-[var(--accent)] px-4 py-3 text-center">
          <p className="text-xs text-[var(--muted-foreground)]">¡Gracias por tu preferencia!</p>
          <p className="text-xs text-[var(--muted-foreground)]">Masss Cabellos</p>
        </div>
        </div>
      </div>
    </>
  );
}
