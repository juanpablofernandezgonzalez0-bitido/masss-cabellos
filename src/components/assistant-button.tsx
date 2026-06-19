"use client";

import { useState, useRef, useEffect } from "react";
import { Bot, Send, X, Loader2 } from "lucide-react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export function AssistantButton() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "¡Hola! Soy tu asistente de Masss Cabellos. Pregúntame lo que quieras sobre el negocio." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages]);

  async function handleSend() {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setLoading(true);

    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { role: "assistant", content: data.response || data.error || "Error inesperado" }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Error de conexión. Intenta de nuevo." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-300/50 transition-all hover:scale-110 hover:shadow-xl active:scale-95"
        aria-label="Asistente"
      >
        {open ? <X className="h-6 w-6" /> : <Bot className="h-6 w-6" />}
      </button>

      {open && (
        <div className="fixed bottom-24 right-6 z-50 flex w-80 flex-col rounded-2xl border border-[var(--border)] bg-white shadow-2xl sm:w-96">
          <div className="flex items-center gap-2 rounded-t-2xl bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-3 text-white">
            <Bot className="h-5 w-5" />
            <span className="text-sm font-semibold">Asistente Masss Cabellos</span>
          </div>

          <div ref={chatRef} className="flex h-80 flex-col gap-2 overflow-y-auto p-3">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "rounded-br-md bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                      : "rounded-bl-md bg-[var(--accent)] text-[var(--accent-foreground)]"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2 rounded-2xl rounded-bl-md bg-[var(--accent)] px-3.5 py-2 text-sm text-[var(--accent-foreground)]">
                  <Loader2 className="h-4 w-4 animate-spin text-purple-500" />
                  Pensando...
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 border-t border-[var(--border)] p-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleSend(); }}
              placeholder="Escribe tu pregunta..."
              className="flex-1 rounded-xl border border-[var(--border)] bg-[var(--accent)] px-3 py-2 text-sm outline-none transition-colors focus:border-purple-300 focus:ring-1 focus:ring-purple-200"
              disabled={loading}
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white transition-all hover:scale-105 active:scale-95 disabled:opacity-40"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
