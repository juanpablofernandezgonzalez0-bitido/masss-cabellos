"use client";

import { useState, useRef } from "react";
import { Upload, X, ImageIcon } from "lucide-react";

interface ImageUploadProps {
  currentImage?: string;
  onImageUploaded: (url: string) => void;
}

export function ImageUpload({ currentImage, onImageUploaded }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("La imagen no debe superar los 5MB");
      return;
    }

    setUploading(true);
    const localPreview = URL.createObjectURL(file);
    setPreview(localPreview);

    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.url) {
        onImageUploaded(data.url);
      }
    } catch {
      alert("Error al subir la imagen");
      setPreview(currentImage || null);
    } finally {
      setUploading(false);
    }
  };

  const removeImage = () => {
    setPreview(null);
    onImageUploaded("");
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="space-y-2">
      <label className="mb-2 block text-sm font-medium text-[var(--foreground)]">Imagen del producto</label>
      {preview ? (
        <div className="relative inline-block">
          <div className="overflow-hidden rounded-xl border border-[var(--border)] shadow-[var(--shadow-sm)]">
            <img
              src={preview}
              alt="Vista previa"
              className="h-40 w-40 object-cover"
            />
          </div>
          <button
            type="button"
            onClick={removeImage}
            className="absolute -right-2.5 -top-2.5 flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-red-600 text-white shadow-lg transition-transform hover:scale-110"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="group flex h-40 w-40 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-[var(--border)] bg-[var(--accent)] transition-all hover:border-[var(--primary)] hover:bg-[var(--primary)]/5 disabled:opacity-50"
        >
          {uploading ? (
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-[var(--primary)] border-t-transparent" />
          ) : (
            <>
              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--muted)] transition-colors group-hover:bg-[var(--primary)]/10">
                <ImageIcon className="h-5 w-5 text-[var(--muted-foreground)] group-hover:text-[var(--primary)]" />
              </div>
              <span className="text-xs font-medium text-[var(--muted-foreground)] group-hover:text-[var(--primary)]">
                Click para subir
              </span>
              <span className="mt-0.5 text-[10px] text-[var(--muted-foreground)]/60">
                PNG, JPG hasta 5MB
              </span>
            </>
          )}
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
}
