"use client";

import { Printer, Loader2 } from "lucide-react";
import { jsPDF } from "jspdf";
import { useState } from "react";

interface SaleItemData {
  name: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

interface Props {
  invoiceNum: string;
  total: number;
  paid: number;
  change: number;
  paymentMethod: string;
  clientName: string;
  date: string;
  items: SaleItemData[];
}

function fmt(n: number): string {
  return "$" + Math.round(n).toLocaleString("es-CO");
}

export function PdfDownloadButton({ invoiceNum, total, paid, change, paymentMethod, clientName, date, items }: Props) {
  const [loading, setLoading] = useState(false);

  const downloadPdf = async () => {
    setLoading(true);
    try {
      const pdf = new jsPDF("p", "mm", "a4");
      const pw = pdf.internal.pageSize.getWidth();
      const cw = 64;
      const ml = (pw - cw) / 2;
      let y = 20;

      let logoBase64 = "";
      try {
        const logoRes = await fetch("/logo.png");
        const logoBlob = await logoRes.blob();
        logoBase64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(logoBlob);
        });
      } catch { /* fallback: just skip the logo */ }

      if (logoBase64) {
        const logoW = 30;
        const logoH = (1050 / 1192) * logoW;
        pdf.addImage(logoBase64, "PNG", pw / 2 - logoW / 2, y, logoW, logoH);
        y += logoH + 3;
      }

      const bold = (s: number) => { pdf.setFont("Helvetica", "bold"); pdf.setFontSize(s); };
      const norm = (s: number) => { pdf.setFont("Helvetica", "normal"); pdf.setFontSize(s); };
      const cen = (t: string, s: number, b = false) => { b ? bold(s) : norm(s); pdf.text(t, pw / 2, y, { align: "center" }); };
      const l = (t: string, s: number, b = false) => { b ? bold(s) : norm(s); pdf.text(t, ml, y); };
      const r = (t: string, s: number, b = false) => { b ? bold(s) : norm(s); pdf.text(t, ml + cw, y, { align: "right" }); };
      const dash = () => {
        let d = "";
        for (let i = 0; i < cw / 1.5; i++) d += "-";
        norm(7);
        pdf.text(d, ml, y);
      };
      const line = () => { pdf.setDrawColor(0); pdf.setLineWidth(0.3); pdf.line(ml, y, ml + cw, y); };

      cen("MASSS CABELLOS", 14, true);
      y += 6;
      cen("Estética y Bienestar", 8);
      y += 4;
      cen(date, 8);
      y += 5;
      l("Factura No. " + invoiceNum, 9, true);
      y += 5;
      dash();
      y += 4;
      l("Cliente: " + clientName, 8);
      y += 4;
      l("Pago: " + (paymentMethod === "transferencia" ? "Transferencia" : "Efectivo"), 7);
      y += 5;
      dash();
      y += 4;
      l("Producto", 7, true);
      r("Total", 7, true);
      y += 4;

      for (const item of items) {
        if (y > 270) { pdf.addPage(); y = 20; }
        l(item.name, 8);
        y += 3.5;
        l(item.quantity + " x " + fmt(item.unitPrice), 7);
        r(fmt(item.subtotal), 8);
        y += 4;
        pdf.setDrawColor(220);
        pdf.setLineWidth(0.1);
        pdf.line(ml, y, ml + cw, y);
        y += 2;
      }

      y += 2;
      line();
      y += 4;
      l("TOTAL:", 11, true);
      r(fmt(total), 11, true);
      y += 6;

      if (paid > 0) {
        l(paymentMethod === "transferencia" ? "Transferencia:" : "Efectivo:", 8);
        r(fmt(paid), 8);
        y += 4;
        l("Vuelto:", 8, true);
        r(fmt(change), 8, true);
        y += 4;
      }

      line();
      y += 5;
      cen("¡Gracias por tu preferencia!", 8);
      y += 4;
      cen("Masss Cabellos", 7);

      pdf.save("factura-" + invoiceNum + ".pdf");
    } catch {
      alert("Error al generar el PDF.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={downloadPdf}
      disabled={loading}
      className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] px-4 py-2 text-xs font-medium text-white shadow-[var(--shadow-sm)] transition-all hover:opacity-90"
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Printer className="h-4 w-4" />}
      {loading ? "Generando..." : "Descargar Factura"}
    </button>
  );
}
