"use client";

import { useState, useEffect, useRef } from "react";
import { createSale } from "@/lib/actions";
import { ArrowLeft, Plus, Trash2, ShoppingCart, User, FileText, Search } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

interface ProductOption {
  id: number;
  name: string;
  price: number;
  stock: number;
  image?: string;
}

interface ClientOption {
  id: number;
  name: string;
}

interface SaleItem {
  type: "product" | "manual";
  productId: string;
  quantity: string;
  customName: string;
  customDescription: string;
  customPrice: string;
}

export default function NewSalePage() {
  const searchParams = useSearchParams();
  const planId = searchParams.get("planId");
  const appointmentId = searchParams.get("appointmentId");

  const [items, setItems] = useState<SaleItem[]>(() => {
    if (planId) {
      return [];
    }
    return [{ type: "product", productId: "", quantity: "1", customName: "", customDescription: "", customPrice: "" }];
  });
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<ProductOption[]>([]);
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [preselectedClientId, setPreselectedClientId] = useState("");
  const [clientName, setClientName] = useState("");
  const [planDescription, setPlanDescription] = useState("");
  const [planPrice, setPlanPrice] = useState(0);
  const [planTotalSessions, setPlanTotalSessions] = useState(0);
  const [appointmentInfo, setAppointmentInfo] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [paid, setPaid] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [showProductPicker, setShowProductPicker] = useState<number | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const planLoaded = useRef(false);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/products").then((r) => r.json()),
      fetch("/api/clients").then((r) => r.json()),
      planId ? fetch(`/api/treatment-plans?id=${planId}`).then((r) => r.json()) : Promise.resolve(null),
      appointmentId ? fetch(`/api/appointments/${appointmentId}`).then((r) => r.json()) : Promise.resolve(null),
    ]).then(([productsData, clientsData, planData, appointmentData]) => {
      setProducts(productsData);
      setFilteredProducts(productsData);
      setClients(clientsData);

      if (planData && !planLoaded.current) {
        planLoaded.current = true;
        setPreselectedClientId(String(planData.clientId));
        const planClient = clientsData.find((c: ClientOption) => c.id === planData.clientId);
        if (planClient) setClientName(planClient.name);
        setPlanDescription(planData.description);
        setPlanPrice(planData.price);
        setPlanTotalSessions(planData.totalSessions);
        setItems([{
          type: "manual",
          productId: "",
          quantity: "1",
          customName: `Plan: ${planData.description}`,
          customDescription: `${planData.totalSessions} sesiones`,
          customPrice: String(planData.price),
        }]);
      }

      if (appointmentData && appointmentData.clientId) {
        setPreselectedClientId(String(appointmentData.clientId));
        const aptClient = clientsData.find((c: ClientOption) => c.id === appointmentData.clientId);
        if (aptClient) setClientName(aptClient.name);
        const service = appointmentData.type || "servicio";
        const serviceLabel = service.charAt(0).toUpperCase() + service.slice(1);
        setAppointmentInfo(`Cita: ${serviceLabel}`);
        if (!planId) {
          setItems([{
            type: "manual",
            productId: "",
            quantity: "1",
            customName: serviceLabel,
            customDescription: appointmentData.notes || "",
            customPrice: "",
          }]);
        }
      }

      setLoading(false);
    });
  }, [planId, appointmentId]);

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
    const newItem: SaleItem = { type: "product", productId: "", quantity: "1", customName: "", customDescription: "", customPrice: "" };
    setItems([...items, newItem]);
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

  const updateItem = (index: number, field: keyof SaleItem, value: string) => {
    const newItems = [...items];
    (newItems[index] as any)[field] = value;
    setItems(newItems);
  };

  const selectProduct = (index: number, product: ProductOption) => {
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);

    const formData = new FormData();
    const clientInput = formRef.current?.querySelector<HTMLInputElement>('[name="clientName"]');
    formData.set("clientName", clientInput?.value || "");
    if (preselectedClientId) formData.set("clientId", preselectedClientId);
    if (appointmentId) formData.set("appointmentId", appointmentId);

    const payload = items.filter((item) => {
      if (item.type === "product") return !!item.productId && !isNaN(parseInt(item.productId));
      return true;
    }).map((item) => {
      if (item.type === "product") {
        return { type: "product" as const, productId: parseInt(item.productId), quantity: parseInt(item.quantity) || 1 };
      }
      return { type: "manual" as const, customName: item.customName, customDescription: item.customDescription, customPrice: parseFloat(item.customPrice) || 0, quantity: parseInt(item.quantity) || 1 };
    });
    formData.set("items", JSON.stringify(payload));
    formData.set("paid", paid);

    try {
      const saleId = await createSale(formData);
      window.location.href = `/sales/${saleId}`;
    } catch (e) {
      alert(e instanceof Error ? e.message : "Error al registrar la venta");
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link href="/sales" className="inline-flex items-center gap-1.5 text-sm text-[var(--muted-foreground)] transition-colors hover:text-[var(--primary)]">
        <ArrowLeft className="h-4 w-4" /> Volver a ventas
      </Link>
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--success)]/10 to-[var(--success)]/20">
          <ShoppingCart className="h-5 w-5 text-[var(--success)]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Nueva Venta</h1>
          <p className="text-sm text-[var(--muted-foreground)]">Registra una venta de productos</p>
        </div>
      </div>

      <form ref={formRef} onSubmit={handleSubmit} className="space-y-6 rounded-2xl border border-[var(--border)] bg-white p-8 shadow-[var(--shadow-sm)]">
        <div>
          <label className="mb-2 flex items-center gap-2 text-sm font-medium text-[var(--foreground)]">
            <User className="h-4 w-4 text-[var(--muted-foreground)]" />
            Cliente (opcional)
          </label>
          <input
            name="clientName"
            list="clients-list"
            value={clientName}
            onChange={(e) => {
              setClientName(e.target.value);
              setPreselectedClientId("");
            }}
            placeholder="Cliente General (o escribe un nombre nuevo)"
            className="form-input"
          />
          <datalist id="clients-list">
            {clients.map((c) => (
              <option key={c.id} value={c.name} />
            ))}
          </datalist>
          {planId && (
            <p className="mt-1 text-xs text-[var(--primary)]">Vinculado al plan de tratamiento</p>
          )}
          {appointmentId && (
            <p className="mt-1 text-xs text-[var(--primary)]">Vinculado a una cita</p>
          )}
        </div>

        {appointmentInfo && (
          <div className="rounded-xl border border-[var(--secondary)]/20 bg-[var(--secondary)]/5 p-4">
            <p className="text-sm font-medium text-[var(--secondary)]">{appointmentInfo}</p>
          </div>
        )}

        {planDescription && (
          <div className="rounded-xl border border-[var(--primary)]/20 bg-[var(--primary)]/5 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[var(--primary)]">Plan: {planDescription}</p>
                <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">{planTotalSessions} sesiones — ${planPrice.toLocaleString()}</p>
              </div>

            </div>
          </div>
        )}

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
                                    disabled={p.stock === 0}
                                    className="flex w-full items-center justify-between px-4 py-2.5 text-left text-sm transition-colors hover:bg-[var(--accent)] disabled:opacity-40"
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
                          required
                          className="rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-sm text-[var(--foreground)] outline-none transition-all focus:border-[var(--primary)] focus:ring-3 focus:ring-[var(--primary)]/15 sm:flex-1"
                        />
                        <input
                          type="text"
                          inputMode="numeric"
                          placeholder="Precio"
                          value={item.customPrice}
                          onChange={(e) => updateItem(index, "customPrice", e.target.value.replace(/[^0-9]/g, ""))}
                          required
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
                        max={item.type === "product" ? product?.stock || 999 : 9999}
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

        <div className="flex items-center justify-between rounded-xl bg-gradient-to-r from-[var(--muted)] to-[var(--accent)] px-5 py-4">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-[var(--primary)]" />
            <span className="text-sm font-medium text-[var(--muted-foreground)]">Total de la venta</span>
          </div>
          <span className="text-2xl font-bold text-[var(--foreground)]">${total.toLocaleString()}</span>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-[var(--foreground)]">Paga con</label>
            <input
              type="text"
              inputMode="numeric"
              placeholder="$0"
              value={paid}
              onChange={(e) => setPaid(e.target.value.replace(/[^0-9]/g, ""))}
              className="form-input text-lg font-semibold"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-[var(--foreground)]">Vuelto</label>
            <div className="flex h-[42px] items-center rounded-xl border-2 border-[var(--success)] bg-[var(--success-light)] px-4 text-lg font-bold text-[var(--success)]">
              ${(Math.max(0, (parseFloat(paid) || 0) - total)).toLocaleString()}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-[var(--border)] pt-6">
          <Link href="/sales" className="btn-secondary">Cancelar</Link>
          <button type="submit" disabled={submitting || loading} className="btn-primary">
            {submitting ? (
              <span className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Registrando...
              </span>
            ) : (
              "Registrar Venta"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
