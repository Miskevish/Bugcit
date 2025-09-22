// web/src/components/ChatCat.jsx
import React, { useEffect, useRef, useState } from "react";

const BASE = import.meta.env.VITE_API_URL || "/api";

/**
 * ChatCat
 * - Guarda el historial en localStorage (persistKey)
 * - Llama a onAction(action) por cada acción que responda el backend
 * - Muestra título dinámico (ej: "Hola, tienes N tareas")
 */
export default function ChatCat({
  title = "Habla con BUGCIT",
  persistKey = "bugcit:chat",
  counts = { tasks: 0, notes: 0, events: 0 },
  onAction, // function(action)
}) {
  const initialMsg = {
    role: "assistant",
    text: "¡Miau! Soy BUGCIT 😺 ¿En qué te ayudo hoy?",
  };

  const [messages, setMessages] = useState(() => {
    try {
      const raw = localStorage.getItem(persistKey);
      if (raw) return JSON.parse(raw);
    } catch {}
    return [initialMsg];
  });

  const [input, setInput] = useState("");
  const listRef = useRef(null);
  const [busy, setBusy] = useState(false);

  // Autoscroll
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, busy]);

  // Persistir chat
  useEffect(() => {
    try {
      localStorage.setItem(persistKey, JSON.stringify(messages));
    } catch {}
  }, [messages, persistKey]);

  async function send() {
    const text = input.trim();
    if (!text || busy) return;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text }]);
    setBusy(true);
    try {
      const r = await fetch(`${BASE}/assistant/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, counts }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data?.error || "Error");

      // Mensaje del asistente
      const reply = (data.reply || "").trim();
      if (reply) {
        setMessages((prev) => [...prev, { role: "assistant", text: reply }]);
      }

      // Normalizar acciones: aceptar 'action' (objeto) o 'actions' (array)
      const acts = [];
      if (data.action && typeof data.action === "object")
        acts.push(data.action);
      if (Array.isArray(data.actions)) acts.push(...data.actions);

      if (acts.length && typeof onAction === "function") {
        for (const act of acts) {
          try {
            // eslint-disable-next-line no-await-in-loop
            await onAction(act);
          } catch (e) {
            console.error("onAction error:", e);
          }
        }
      }
    } catch (e) {
      console.error(e);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: "Ups, no pude responder ahora 😿." },
      ]);
    } finally {
      setBusy(false);
    }
  }

  function onKey(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  function clearChat() {
    setMessages([initialMsg]);
  }

  return (
    <div
      className="card-bugcit"
      style={{ display: "grid", gridTemplateRows: "auto 1fr auto" }}
    >
      <div
        className="card-head"
        style={{ display: "flex", gap: 8, alignItems: "center" }}
      >
        <span style={{ flex: 1 }}>{title}</span>
        <button className="btn ghost" onClick={clearChat} title="Borrar chat">
          Limpiar
        </button>
      </div>

      <div
        className="card-body"
        ref={listRef}
        style={{ overflow: "auto", maxHeight: 360, display: "grid", gap: 10 }}
      >
        {messages.map((m, i) => (
          <div
            key={i}
            style={{
              justifySelf: m.role === "user" ? "end" : "start",
              background:
                m.role === "user"
                  ? "rgba(120,70,255,.25)"
                  : "rgba(255,255,255,.06)",
              border: "1px solid rgba(255,255,255,.08)",
              padding: "10px 12px",
              borderRadius: 12,
              maxWidth: "80%",
              whiteSpace: "pre-wrap",
              overflowWrap: "anywhere",
            }}
          >
            {m.text}
          </div>
        ))}
        {busy && <div className="text-muted">BUGCIT está pensando…</div>}
      </div>

      <div
        className="card-footer"
        style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 8 }}
      >
        <textarea
          className="textarea"
          rows={1}
          placeholder="Escribe aquí y presiona Enter…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKey}
          style={{ resize: "none" }}
        />
        <button className="btn brand" onClick={send} disabled={busy}>
          Enviar
        </button>
      </div>
    </div>
  );
}
