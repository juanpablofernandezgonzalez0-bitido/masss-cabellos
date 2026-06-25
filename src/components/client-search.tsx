"use client";

import { useState, useRef, useEffect } from "react";
import { User } from "lucide-react";

interface Client {
  id: number;
  name: string;
}

export function ClientSearch({ clients }: { clients: Client[] }) {
  const [query, setQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const filtered = query.trim()
    ? clients.filter((c) =>
        c.name.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={wrapperRef} className="relative">
      <input
        name="clientName"
        required
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setShowDropdown(true);
        }}
        onFocus={() => setShowDropdown(true)}
        className="form-input"
        placeholder="Buscar cliente por nombre..."
        autoComplete="off"
      />
      {showDropdown && (
        <div className="absolute z-50 mt-1 max-h-48 w-full overflow-auto rounded-lg border border-[var(--border)] bg-white shadow-lg">
          {filtered.length > 0 ? (
            filtered.map((c) => (
              <button
                key={c.id}
                type="button"
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-[var(--accent)]"
                onMouseDown={() => {
                  setQuery(c.name);
                  setShowDropdown(false);
                }}
              >
                <User className="h-3.5 w-3.5 shrink-0 text-[var(--muted-foreground)]" />
                {c.name}
              </button>
            ))
          ) : query.trim() ? (
            <div className="px-3 py-3 text-center text-xs text-[var(--muted-foreground)]">
              No se encontró &quot;{query}&quot; en clientes
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
