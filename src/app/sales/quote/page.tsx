"use client";

import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Plus, Trash2, ShoppingCart, FileText, Search, Calculator, Download } from "lucide-react";
import Link from "next/link";
import { jsPDF } from "jspdf";

interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  image?: string;
}

interface QuoteItem {
  type: "product" | "manual";
  productId: string;
  quantity: string;
  customName: string;
  customDescription: string;
  customPrice: string;
}

export default function QuotePage() {
  const [items, setItems] = useState<QuoteItem[]>([
    { type: "product", productId: "", quantity: "1", customName: "", customDescription: "", customPrice: "" },
  ]);
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [productSearch, setProductSearch] = useState("");
  const [showProductPicker, setShowProductPicker] = useState<number | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((data) => {
        setProducts(data);
        setFilteredProducts(data);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (productSearch) {
      const q = productSearch.toLowerCase();
      setFilteredProducts(products.filter((p) => p.name.toLowerCase().includes(q)));
    } else {
      setFilteredProducts(products);
    }
  }, [productSearch, products]);

  useEffect(() => {
    if (showProductPicker !== null && searchRef.current) {
      searchRef.current.focus();
    }
  }, [showProductPicker]);

  const addItem = () => {
    setItems([...items, { type: "product", productId: "", quantity: "1", customName: "", customDescription: "", customPrice: "" }]);
    setShowProductPicker(items.length);
  };

  const addManualItem = () => {
    setItems([...items, { type: "manual", productId: "", quantity: "1", customName: "", customDescription: "", customPrice: "" }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index: number, field: keyof QuoteItem, value: string) => {
    const newItems = [...items];
    (newItems[index] as any)[field] = value;
    setItems(newItems);
  };

  const selectProduct = (index: number, product: Product) => {
    updateItem(index, "productId", String(product.id));
    setShowProductPicker(null);
    setProductSearch("");
  };

  const getProduct = (productId: string) => products.find((p) => p.id === parseInt(productId));

  const total = items.reduce((sum, item) => {
    if (item.type === "product") {
      const product = getProduct(item.productId);
      return sum + (product ? product.price * (parseInt(item.quantity) || 1) : 0);
    }
    return sum + (parseFloat(item.customPrice) || 0) * (parseInt(item.quantity) || 1);
  }, 0);

  const resetQuote = () => {
    setItems([{ type: "product", productId: "", quantity: "1", customName: "", customDescription: "", customPrice: "" }]);
    setShowProductPicker(null);
    setProductSearch("");
  };

  const downloadPdf = async () => {
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
    } catch {}

    if (logoBase64) {
      const logoW = 40;
      const logoH = (1050 / 1192) * logoW;
      pdf.addImage(logoBase64, "PNG", pw / 2 - logoW / 2, y, logoW, logoH);
      y += logoH + 5;
    }

    const bold = (s: number) => { pdf.setFont("Helvetica", "bold"); pdf.setFontSize(s); };
    const norm = (s: number) => { pdf.setFont("Helvetica", "normal"); pdf.setFontSize(s); };
    const cen = (t: string, s: number, b = false) => { b ? bold(s) : norm(s); pdf.text(t, pw / 2, y, { align: "center" }); };
    const l = (t: string, s: number, b = false) => { b ? bold(s) : norm(s); pdf.text(t, ml, y); };
    const r = (t: string, s: number, b = false) => { b ? bold(s) : norm(s); pdf.text(t, ml + cw, y, { align: "right" }); };
    const line = () => { pdf.setDrawColor(0); pdf.setLineWidth(0.5); pdf.line(ml, y, ml + cw, y); };

    cen("MASSS CABELLOS", 22, true);
    y += 8;
    cen("Estética y Bienestar", 11);
    y += 6;
    cen(new Date().toLocaleDateString("es-CO", { timeZone: "America/Bogota", year: "numeric", month: "long", day: "numeric" }), 10);
    y += 10;
    cen("COTIZACIÓN", 18, true);
    y += 10;
    line();
    y += 7;
    l("Producto", 11, true);
    r("Total", 11, true);
    y += 7;

    for (const item of items) {
      if (y > 270) { pdf.addPage(); y = 20; }
      const name = item.type === "product"
        ? getProduct(item.productId)?.name || "(sin seleccionar)"
        : item.customDescription || "(item manual)";
      const qty = parseInt(item.quantity) || 1;
      const unitPrice = item.type === "product"
        ? getProduct(item.productId)?.price || 0
        : parseFloat(item.customPrice) || 0;
      const subtotal = unitPrice * qty;

      l(name, 11);
      y += 5;
      l(`${qty} x $${Math.round(unitPrice).toLocaleString("es-CO")}`, 9);
      r(`$${Math.round(subtotal).toLocaleString("es-CO")}`, 11);
      y += 5;
      pdf.setDrawColor(220);
      pdf.setLineWidth(0.2);
      pdf.line(ml, y, ml + cw, y);
      y += 3;
    }

    y += 4;
    line();
    y += 7;
    l("TOTAL:", 16, true);
    r(`$${Math.round(total).toLocaleString("es-CO")}`, 16, true);
    y += 12;
    line();
    y += 7;
    cen("¡Gracias por tu preferencia!", 11);
    y += 5;
    cen("Masss Cabellos", 9);

    pdf.save("cotizacion.pdf");
  };

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--primary)] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link href="/sales" className="inline-flex items-center gap-1.5 text-sm text-[var(--muted-foreground)] transition-colors hover:text-[var(--primary)]">
        <ArrowLeft className="h-4 w-4" /> Volver a ventas
      </Link>
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--info)]/10 to-[var(--info)]/20">
          <Calculator className="h-5 w-5 text-[var(--info)]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Cotización</h1>
          <p className="text-sm text-[var(--muted-foreground)]">Calcula el costo de una venta sin registrarla</p>
        </div>
      </div>

      <div className="space-y-6 rounded-2xl border border-[var(--border)] bg-white p-8 shadow-[var(--shadow-sm)]">
        <div>
          <div className="mb-4 flex items-center justify-between">
            <label className="text-sm font-medium text-[var(--foreground)]">Productos</label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={addManualItem}
                className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-[var(--secondary)] px-3 py-1.5 text-xs font-medium text-[var(--secondary)] transition-all hover:bg-[var(--secondary)]/5"
              >
                <FileText className="h-3.5 w-3.5" /> Item manual
              </button>
              <button
                type="button"
                onClick={addItem}
                className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-[var(--primary)] px-3 py-1.5 text-xs font-medium text-[var(--primary)] transition-all hover:bg-[var(--primary)]/5"
              >
                <Plus className="h-3.5 w-3.5" /> Producto
              </button>
            </div>
          </div>
          <div className="space-y-3">
            {items.map((item, index) => {
              const product = item.type === "product" ? getProduct(item.productId) : null;
              const isPickerOpen = showProductPicker === index;
              return (
                <div key={index} className="flex flex-col gap-2 rounded-xl border border-[var(--border)] bg-[var(--accent)] p-4 sm:flex-row sm:items-start sm:gap-3">
                  <div className="min-w-0 flex-1">
                    {item.type === "product" ? (
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setShowProductPicker(isPickerOpen ? null : index)}
                          className="flex w-full items-center gap-2 rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-left text-sm text-[var(--foreground)] transition-all hover:border-[var(--primary)]"
                        >
                          <Search className="h-4 w-4 shrink-0 text-[var(--muted-foreground)]" />
                          {product ? (
                            <span className="flex items-center justify-between flex-1">
                              <span className="font-medium">{product.name}</span>
                              <span className="text-xs text-[var(--muted-foreground)]">${product.price.toLocaleString()} — Stock: {product.stock}</span>
                            </span>
                          ) : (
                            <span className="text-[var(--muted-foreground)]">Buscar producto...</span>
                          )}
                        </button>
                        {isPickerOpen && (
                          <div className="absolute left-0 right-0 top-full z-50 mt-1 rounded-xl border border-[var(--border)] bg-white shadow-lg">
                            <div className="border-b border-[var(--border)] p-2">
                              <input
                                ref={searchRef}
                                type="text"
                                placeholder="Buscar producto..."
                                value={productSearch}
                                onChange={(e) => setProductSearch(e.target.value)}
                                className="w-full rounded-lg border border-[var(--border)] px-3 py-2 text-sm outline-none focus:border-[var(--primary)] focus:ring-3 focus:ring-[var(--primary)]/15"
                              />
                            </div>
                            <div className="max-h-60 overflow-y-auto">
                              {filteredProducts.length === 0 ? (
                                <div className="p-4 text-center text-sm text-[var(--muted-foreground)]">Sin resultados</div>
                              ) : (
                                filteredProducts.map((p) => (
                                  <button
                                    key={p.id}
                                    type="button"
                                    onClick={() => selectProduct(index, p)}
                                    className="flex w-full items-center justify-between px-4 py-2.5 text-left text-sm transition-colors hover:bg-[var(--accent)]"
                                  >
                                    <div className="flex items-center gap-3">
                                      {p.image ? (
                                        <img src={p.image} alt="" className="h-8 w-8 rounded-lg object-cover" />
                                      ) : (
                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--muted)] text-xs text-[var(--muted-foreground)]">?</div>
                                      )}
                                      <div>
                                        <p className="font-medium text-[var(--foreground)]">{p.name}</p>
                                        <p className="text-xs text-[var(--muted-foreground)]">Stock: {p.stock}</p>
                                      </div>
                                    </div>
                                    <span className="font-semibold text-[var(--primary)]">${p.price.toLocaleString()}</span>
                                  </button>
                                ))
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2 sm:flex-row sm:gap-2">
                        <input
                          type="text"
                          placeholder="Descripción"
                          value={item.customDescription}
                          onChange={(e) => updateItem(index, "customDescription", e.target.value)}
                          className="rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-sm text-[var(--foreground)] outline-none transition-all focus:border-[var(--primary)] focus:ring-3 focus:ring-[var(--primary)]/15 sm:flex-1"
                        />
                        <input
                          type="text"
                          inputMode="numeric"
                          placeholder="Precio"
                          value={item.customPrice}
                          onChange={(e) => updateItem(index, "customPrice", e.target.value.replace(/[^0-9]/g, ""))}
                          className="rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-center text-sm text-[var(--foreground)] outline-none transition-all focus:border-[var(--primary)] focus:ring-3 focus:ring-[var(--primary)]/15 sm:w-32"
                        />
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 sm:flex-col sm:gap-0">
                    <div className="sm:w-24">
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, "quantity", e.target.value)}
                        className="form-input text-center"
                      />
                    </div>
                    <div className="flex h-[42px] items-center justify-end text-sm font-semibold text-[var(--primary)] sm:w-24">
                      {item.type === "product" && product
                        ? `$${(product.price * (parseInt(item.quantity) || 1)).toLocaleString()}`
                        : item.type === "manual" && item.customPrice
                          ? `$${((parseFloat(item.customPrice) || 0) * (parseInt(item.quantity) || 1)).toLocaleString()}`
                          : "—"}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-red-400 transition-colors hover:bg-red-50 hover:text-red-600 sm:mt-1.5"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-between rounded-xl bg-gradient-to-r from-[var(--info)]/10 to-[var(--info)]/20 px-5 py-4">
          <div className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-[var(--info)]" />
            <span className="text-sm font-medium text-[var(--foreground)]">Total cotizado</span>
          </div>
          <span className="text-2xl font-bold text-[var(--foreground)]">${total.toLocaleString()}</span>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-[var(--border)] pt-6">
          <button type="button" onClick={resetQuote} className="btn-secondary">
            Limpiar
          </button>
          <button type="button" onClick={downloadPdf} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[var(--info)] to-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[var(--info)]/20 transition-all hover:shadow-xl">
            <Download className="h-4 w-4" />
            Descargar PDF
          </button>
          <Link href="/sales/new" className="btn-primary">
            Ir a Nueva Venta
          </Link>
        </div>
      </div>
    </div>
  );
}
