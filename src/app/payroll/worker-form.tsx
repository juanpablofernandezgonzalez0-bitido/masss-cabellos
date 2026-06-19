"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, Upload } from "lucide-react";

function resizeImage(file: File, maxW = 400, maxH = 400, quality = 0.85): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;
      if (width > maxW) { height *= maxW / width; width = maxW; }
      if (height > maxH) { width *= maxH / height; height = maxH; }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      canvas.getContext("2d")!.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    img.onerror = () => reject(new Error("Error al cargar la imagen"));
    img.src = URL.createObjectURL(file);
  });
}

export function WorkerForm() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [image, setImage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:shadow-md"
      >
        <Plus className="h-4 w-4" />
        Registrar Trabajadora
      </button>
    );
  }

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError("La imagen no debe superar los 5MB");
      return;
    }
    try {
      const dataUrl = await resizeImage(file);
      setImage(dataUrl);
      setError("");
    } catch {
      setError("Error al procesar la imagen");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name.trim()) return setError("El nombre es requerido");
    setLoading(true);

    try {
      const res = await fetch("/api/payroll/workers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), phone, image }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al registrar");
      }

      setName("");
      setPhone("");
      setImage("");
      setOpen(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al registrar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-[var(--shadow-sm)]">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-semibold text-[var(--foreground)]">Nueva Trabajadora</h3>
        <button onClick={() => setOpen(false)} className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
          <X className="h-5 w-5" />
        </button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Photo */}
        <div className="flex items-center gap-4">
          {image ? (
            <div className="relative">
              <div className="overflow-hidden rounded-full border-2 border-[var(--border)]">
                <img src={image} alt="" className="h-16 w-16 object-cover" />
              </div>
              <button
                type="button"
                onClick={() => { setImage(""); if (inputRef.current) inputRef.current.value = ""; }}
                className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-dashed border-[var(--border)] bg-[var(--accent)] transition-all hover:border-emerald-400 hover:bg-emerald-50"
            >
              <Upload className="h-5 w-5 text-[var(--muted-foreground)]" />
            </button>
          )}
          <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
          <div>
            <p className="text-sm font-medium text-[var(--foreground)]">Foto</p>
            <p className="text-xs text-[var(--muted-foreground)]">Opcional</p>
          </div>
        </div>

        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nombre completo"
          className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3.5 py-2.5 text-sm outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/15"
        />
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Teléfono (opcional)"
          className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3.5 py-2.5 text-sm outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/15"
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:shadow-md disabled:opacity-50"
          >
            {loading ? "Guardando..." : "Guardar"}
          </button>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-xl border border-[var(--border)] bg-white px-4 py-2.5 text-sm font-medium text-[var(--muted-foreground)]"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
