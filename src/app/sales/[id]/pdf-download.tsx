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
  clientName: string;
  date: string;
  items: SaleItemData[];
}

function formatCurrency(n: number): string {
  const s = Math.round(n).toLocaleString("es-CO");
  return "$" + s;
}

export function PdfDownloadButton({ invoiceNum, total, paid, change, clientName, date, items }: Props) {
  const [loading, setLoading] = useState(false);

  const generatePdf = async (): Promise<Blob | null> => {
    await document.fonts.ready;

    const w = 80;
    const pdf = new jsPDF("p", "mm", [w, 297]);
    const margin = 4;
    const pageW = w - margin * 2;
    let y = margin + 3;

    const setFont = (style: "bold" | "normal", size: number) => {
      pdf.setFont("Helvetica", style);
      pdf.setFontSize(size);
    };
    const center = (txt: string, yp: number, size = 8, boldStyle = false) => {
      setFont(boldStyle ? "bold" : "normal", size);
      pdf.text(txt, w / 2, yp, { align: "center" });
    };
    const left = (txt: string, yp: number, size = 8, boldStyle = false) => {
      setFont(boldStyle ? "bold" : "normal", size);
      pdf.text(txt, margin, yp);
    };
    const right = (txt: string, yp: number, size = 8, boldStyle = false) => {
      setFont(boldStyle ? "bold" : "normal", size);
      pdf.text(txt, w - margin, yp, { align: "right" });
    };
    const dashed = (yp: number) => {
      let line = "";
      for (let i = 0; i < pageW / 1.5; i++) line += "-";
      pdf.setFont("Courier", "normal");
      pdf.setFontSize(7);
      pdf.text(line, margin, yp);
    };
    const solid = (yp: number) => {
      pdf.setDrawColor(0);
      pdf.setLineWidth(0.2);
      pdf.line(margin, yp, w - margin, yp);
    };

    // Header
    center("MASS CABELLOS", y, 11, true);
    y += 4.5;
    center("Estetica y Bienestar", y, 7);
    y += 4;
    center(date, y, 7);
    y += 3.5;

    // Invoice number
    left(`Factura No. ${invoiceNum}`, y, 8, true);
    y += 5;

    // Dashed separator
    dashed(y);
    y += 4;

    // Client
    left(`Cliente: ${clientName}`, y, 8);
    y += 4.5;

    // Dashed separator
    dashed(y);
    y += 4;

    // Table header
    left("Producto", y, 7, true);
    right("Total", y, 7, true);
    y += 4;

    // Items
    for (const item of items) {
      if (y > 280) {
        pdf.addPage();
        y = margin + 3;
      }

      // Item name
      left(item.name, y, 8);
      y += 3.5;

      // Qty x price = subtotal
      const detail = `${item.quantity} x ${formatCurrency(item.unitPrice)}`;
      left(detail, y, 7);
      right(formatCurrency(item.subtotal), y, 8);
      y += 3.5;

      // Light separator
      pdf.setDrawColor(200);
      pdf.setLineWidth(0.1);
      pdf.line(margin, y, w - margin, y);
      y += 2;
    }

    // Blank space before totals
    y += 1;

    // Solid line
    solid(y);
    y += 4;

    // Totals
    if (y > 275) { pdf.addPage(); y = margin + 3; }

    left("TOTAL:", y, 10, true);
    right(formatCurrency(total), y, 10, true);
    y += 6;

    if (paid > 0) {
      left("Efectivo:", y, 8);
      right(formatCurrency(paid), y, 8);
      y += 4.5;

      left("Vuelto:", y, 8, true);
      right(formatCurrency(change), y, 8, true);
      y += 4.5;
    }

    // Solid line
    solid(y);
    y += 5;

    // Footer
    if (y > 270) { pdf.addPage(); y = margin + 3; }

    center("¡Gracias por tu preferencia!", y, 8);
    y += 4.5;
    center("Masss Cabellos", y, 7);
    y += 4;

    // Trim page height
    const pageCount = pdf.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i);
      const contentHeight = y > 280 ? 297 : Math.max(y + margin, 30);
      pdf.internal.pageSize.height = contentHeight;
    }

    return pdf.output("blob");
  };

  const downloadPdf = async () => {
    setLoading(true);
    try {
      const blob = await generatePdf();
      if (!blob) { alert("Error al generar el PDF"); return; }
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `factura-${invoiceNum}.pdf`;
      a.style.display = "none";
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 1000);
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
