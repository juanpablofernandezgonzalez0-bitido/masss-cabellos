"use client";

import { Share2, Printer, Loader2 } from "lucide-react";
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
  invoiceUrl: string;
  items: SaleItemData[];
}

function formatCurrency(n: number): string {
  return "$" + n.toLocaleString("es-CO");
}

export function PdfDownloadButton({ invoiceNum, total, paid, change, clientName, date, items }: Props) {
  const [loading, setLoading] = useState(false);

  const generatePdf = async (): Promise<Blob | null> => {
    await document.fonts.ready;

    const pdf = new jsPDF("p", "mm", "a4");
    const pageW = pdf.internal.pageSize.getWidth();
    const margin = 20;
    const contentW = pageW - margin * 2;
    let y = margin;

    const bold = (text: string, size: number) => {
      pdf.setFont("Helvetica", "bold");
      pdf.setFontSize(size);
    };
    const normal = (text: string, size: number) => {
      pdf.setFont("Helvetica", "normal");
      pdf.setFontSize(size);
    };

    // Logo
    try {
      const logoImg = new Image();
      logoImg.src = "/logo.png";
      await new Promise<void>((resolve, reject) => {
        logoImg.onload = () => resolve();
        logoImg.onerror = () => reject();
      });
      const logoCanvas = document.createElement("canvas");
      logoCanvas.width = logoImg.naturalWidth;
      logoCanvas.height = logoImg.naturalHeight;
      const ctx = logoCanvas.getContext("2d")!;
      ctx.drawImage(logoImg, 0, 0);
      const logoData = logoCanvas.toDataURL("image/png");
      pdf.addImage(logoData, "PNG", margin, y, 24, 24);
    } catch {
      // logo not available, skip
    }

    // Title
    pdf.setFont("Helvetica", "bold");
    pdf.setFontSize(20);
    pdf.setTextColor(61, 44, 51);
    pdf.text("Masss Cabellos", pageW - margin, y + 10, { align: "right" });
    y += 30;

    // Invoice header
    pdf.setFont("Helvetica", "normal");
    pdf.setFontSize(8);
    pdf.setTextColor(160, 128, 138);
    pdf.text("FACTURA", pageW - margin, y, { align: "right" });
    pdf.setFont("Helvetica", "bold");
    pdf.setFontSize(14);
    pdf.setTextColor(61, 44, 51);
    pdf.text(`#${invoiceNum}`, pageW - margin, y + 6, { align: "right" });

    // Separator
    y += 18;
    pdf.setDrawColor(240, 219, 224);
    pdf.line(margin, y, pageW - margin, y);
    y += 8;

    // Client and Date
    pdf.setFont("Helvetica", "bold");
    pdf.setFontSize(9);
    pdf.setTextColor(160, 128, 138);
    pdf.text("CLIENTE", margin, y);
    pdf.setFont("Helvetica", "normal");
    pdf.setFontSize(10);
    pdf.setTextColor(61, 44, 51);
    pdf.text(clientName, margin, y + 5);

    pdf.setFont("Helvetica", "bold");
    pdf.setFontSize(9);
    pdf.setTextColor(160, 128, 138);
    pdf.text("FECHA", pageW - margin, y, { align: "right" });
    pdf.setFont("Helvetica", "normal");
    pdf.setFontSize(10);
    pdf.setTextColor(61, 44, 51);
    pdf.text(date, pageW - margin, y + 5, { align: "right" });

    y += 20;
    pdf.setDrawColor(240, 219, 224);
    pdf.line(margin, y, pageW - margin, y);
    y += 8;

    // Table header
    const cols = [
      { x: margin, w: contentW * 0.45, align: "left" as const },
      { x: margin + contentW * 0.45, w: contentW * 0.15, align: "center" as const },
      { x: margin + contentW * 0.6, w: contentW * 0.2, align: "right" as const },
      { x: margin + contentW * 0.8, w: contentW * 0.2, align: "right" as const },
    ];

    const headers = ["Producto", "Cant.", "Precio", "Subtotal"];
    pdf.setFont("Helvetica", "bold");
    pdf.setFontSize(8);
    pdf.setTextColor(160, 128, 138);
    headers.forEach((h, i) => {
      pdf.text(h, cols[i].x + (cols[i].align === "right" ? cols[i].w : 0), y, { align: cols[i].align });
    });
    y += 6;
    pdf.setDrawColor(240, 219, 224);
    pdf.line(margin, y, pageW - margin, y);
    y += 4;

    // Table rows
    pdf.setFont("Helvetica", "normal");
    pdf.setFontSize(10);
    pdf.setTextColor(61, 44, 51);

    for (const item of items) {
      if (y > 260) {
        pdf.addPage();
        y = margin;
      }

      const rowValues = [
        item.name,
        String(item.quantity),
        formatCurrency(item.unitPrice),
        formatCurrency(item.subtotal),
      ];

      rowValues.forEach((val, i) => {
        pdf.text(val, cols[i].x + (cols[i].align === "right" ? cols[i].w : 0), y, { align: cols[i].align });
      });
      y += 7;

      pdf.setDrawColor(240, 219, 224);
      pdf.setDrawColor(240, 219, 224, 0.5);
      pdf.line(margin, y, pageW - margin, y);
      y += 3;
    }

    // Total
    y += 6;
    if (y > 260) {
      pdf.addPage();
      y = margin;
    }

    const totalX = pageW - margin - 60;
    pdf.setFillColor(253, 248, 246);
    pdf.roundedRect(totalX, y - 4, 60, 18, 3, 3, "F");
    pdf.setFont("Helvetica", "normal");
    pdf.setFontSize(9);
    pdf.setTextColor(160, 128, 138);
    pdf.text("Total", totalX + 4, y + 5);
    pdf.setFont("Helvetica", "bold");
    pdf.setFontSize(12);
    pdf.setTextColor(61, 44, 51);
    pdf.text(formatCurrency(total), totalX + 56, y + 5, { align: "right" });

    if (paid > 0) {
      y += 14;
      pdf.setFillColor(253, 248, 246);
      pdf.roundedRect(totalX, y - 4, 60, 14, 3, 3, "F");
      pdf.setFont("Helvetica", "normal");
      pdf.setFontSize(8);
      pdf.setTextColor(160, 128, 138);
      pdf.text("Paga con", totalX + 4, y + 4);
      pdf.setFont("Helvetica", "semibold");
      pdf.setFontSize(10);
      pdf.setTextColor(61, 44, 51);
      pdf.text(formatCurrency(paid), totalX + 56, y + 4, { align: "right" });

      y += 12;
      pdf.setFillColor(212, 237, 218);
      pdf.roundedRect(totalX, y - 4, 60, 14, 3, 3, "F");
      pdf.setFont("Helvetica", "normal");
      pdf.setFontSize(8);
      pdf.setTextColor(122, 184, 147);
      pdf.text("Vuelto", totalX + 4, y + 4);
      pdf.setFont("Helvetica", "bold");
      pdf.setFontSize(10);
      pdf.setTextColor(122, 184, 147);
      pdf.text(formatCurrency(change), totalX + 56, y + 4, { align: "right" });
    }

    // Footer
    y = 280;
    pdf.setDrawColor(240, 219, 224);
    pdf.line(margin, y, pageW - margin, y);
    pdf.setFont("Helvetica", "normal");
    pdf.setFontSize(8);
    pdf.setTextColor(160, 128, 138);
    pdf.text("Masss Cabellos — ¡Gracias por tu preferencia!", pageW / 2, y + 8, { align: "center" });

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

  const sharePdf = async () => {
    setLoading(true);
    try {
      const blob = await generatePdf();
      if (!blob) { alert("Error al generar el PDF"); return; }
      const file = new File([blob], `factura-${invoiceNum}.pdf`, { type: "application/pdf" });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: `Factura #${invoiceNum} - Masss Cabellos`,
          files: [file],
        });
      } else {
        downloadPdf();
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") return;
      downloadPdf();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={sharePdf}
        disabled={loading}
        className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--border)] bg-white px-4 py-2 text-xs font-medium text-[var(--foreground)] shadow-[var(--shadow-sm)] transition-all hover:bg-[var(--accent)]"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Share2 className="h-4 w-4 text-[var(--muted-foreground)]" />}
        {loading ? "Generando..." : "Compartir"}
      </button>

      <button
        onClick={downloadPdf}
        disabled={loading}
        className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] px-4 py-2 text-xs font-medium text-white shadow-[var(--shadow-sm)] transition-all hover:opacity-90"
      >
        <Printer className="h-4 w-4" />
        PDF
      </button>
    </div>
  );
}
