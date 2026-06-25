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
      const cw = 170;
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
        const logoW = 50;
        const logoH = (1050 / 1192) * logoW;
        pdf.addImage(logoBase64, "PNG", pw / 2 - logoW / 2, y, logoW, logoH);
        y += logoH + 6;
      }

      const bold = (s: number) => { pdf.setFont("Helvetica", "bold"); pdf.setFontSize(s); };
      const norm = (s: number) => { pdf.setFont("Helvetica", "normal"); pdf.setFontSize(s); };
      const cen = (t: string, s: number, b = false) => { b ? bold(s) : norm(s); pdf.text(t, pw / 2, y, { align: "center" }); };
      const l = (t: string, s: number, b = false) => { b ? bold(s) : norm(s); pdf.text(t, ml, y); };
      const r = (t: string, s: number, b = false) => { b ? bold(s) : norm(s); pdf.text(t, ml + cw, y, { align: "right" }); };
      const dash = () => {
        let d = "";
        for (let i = 0; i < cw / 1.5; i++) d += "-";
        norm(10);
        pdf.text(d, ml, y);
      };
      const line = () => { pdf.setDrawColor(0); pdf.setLineWidth(0.5); pdf.line(ml, y, ml + cw, y); };

      cen("MASSS CABELLOS", 24, true);
      y += 9;
      cen("Estética y Bienestar", 12);
      y += 7;
      cen(date, 11);
      y += 9;
      l("Factura No. " + invoiceNum, 14, true);
      y += 9;
      dash();
      y += 7;
      l("Cliente: " + clientName, 12);
      y += 7;
      l("Pago: " + (paymentMethod === "transferencia" ? "Transferencia" : "Efectivo"), 10);
      y += 9;
      dash();
      y += 7;
      l("Producto", 11, true);
      r("Total", 11, true);
      y += 7;

      for (const item of items) {
        if (y > 270) { pdf.addPage(); y = 20; }
        l(item.name, 12);
        y += 5;
        l(item.quantity + " x " + fmt(item.unitPrice), 10);
        r(fmt(item.subtotal), 12);
        y += 6;
        pdf.setDrawColor(220);
        pdf.setLineWidth(0.2);
        pdf.line(ml, y, ml + cw, y);
        y += 3;
      }

      y += 4;
      line();
      y += 7;
      l("TOTAL:", 16, true);
      r(fmt(total), 16, true);
      y += 10;

      if (paid > 0) {
        l(paymentMethod === "transferencia" ? "Transferencia:" : "Efectivo:", 11);
        r(fmt(paid), 11);
        y += 6;
        l("Vuelto:", 11, true);
        r(fmt(change), 11, true);
        y += 6;
      }

      line();
      y += 8;
      cen("¡Gracias por tu preferencia!", 12);
      y += 6;
      cen("Masss Cabellos", 10);

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
