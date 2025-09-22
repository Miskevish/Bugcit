// web/src/components/BugcitAssistant.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { api } from "../api";

const STORAGE_KEY = "bugcit.chat.v1";

export default function BugcitAssistant() {
  const [messages, setMessages] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw
        ? JSON.parse(raw)
        : [{ role: "bot", text: "¡Miau! Soy BUGCIT 😺 ¿En qué te ayudo hoy?" }];
    } catch {
      return [
        { role: "bot", text: "¡Miau! Soy BUGCIT 😺 ¿En qué te ayudo hoy?" },
      ];
    }
  });
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const listRef = useRef(null);

  // Persistencia local
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  }, [messages]);

  // autoscroll
  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  // Notificaciones — pedir permiso al montar
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  // Aviso de eventos HOY al cargar
  useEffect(() => {
    (async () => {
      try {
        const events = await api.listEvents();
        const today = new Date().toISOString().slice(0, 10);
        const todays = events.filter(
          (e) => (e.date || "").slice(0, 10) === today
        );
        if (todays.length > 0) {
          const msg =
            todays.length === 1
              ? `Tienes 1 evento hoy: ${todays[0].title}`
              : `Tienes ${todays.length} eventos hoy.`;
          setMessages((s) => [...s, { role: "bot", text: msg }]);
          tryNotify("BUGCIT", msg);
        }
      } catch {}
    })();
  }, []);

  async function send() {
    const text = input.trim();
    if (!text || sending) return;

    setMessages((s) => [...s, { role: "user", text }]);
    setInput("");
    setSending(true);
    try {
      const res = await fetch("/api/assistant/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      const data = await res.json();
      if (data?.reply) {
        setMessages((s) => [...s, { role: "bot", text: data.reply }]);
      } else {
        setMessages((s) => [
          ...s,
          { role: "bot", text: "Ups, no pude responder ahora. 😿" },
        ]);
      }

      // Si el back devolvió action => notificar y refrescar listas
      if (data?.action) {
        const a = data.action;
        if (a.type === "created_task") {
          tryNotify("Tarea creada", a.title);
        } else if (a.type === "created_event") {
          tryNotify("Evento creado", `${a.title} · ${a.date}`);
        } else if (a.type === "created_note") {
          tryNotify("Nota guardada", a.text);
        }
        // Dispara un evento simple por si querés refrescar contadores en otros componentes
        window.dispatchEvent(new CustomEvent("bugcit:data-changed"));
      }
    } catch (e) {
      setMessages((s) => [...s, { role: "bot", text: "Error de red 😿" }]);
    } finally {
      setSending(false);
    }
  }

  function tryNotify(title, body) {
    if (!("Notification" in window)) return;
    if (Notification.permission === "granted") {
      try {
        new Notification(title, { body });
      } catch {}
    }
  }

  return (
    <div className="card-bugcit" style={{ display: "grid" }}>
      <div className="card-head">BUGCIT Assistant</div>

      <div className="card-body" style={{ display: "grid", gap: 12 }}>
        <div className="card-bugcit" style={{ margin: 0 }}>
          <div className="card-head">
            <strong>Hola, tienes tareas</strong>
          </div>
          <div
            ref={listRef}
            style={{
              maxHeight: 360,
              overflow: "auto",
              display: "grid",
              gap: 8,
              padding: 12,
            }}
          >
            {messages.map((m, i) => (
              <div
                key={i}
                style={{
                  justifySelf: m.role === "user" ? "end" : "start",
                  display: "inline-block",
                }}
                className={`badge ${m.role === "user" ? "purple" : ""}`}
              >
                {m.text}
              </div>
            ))}
          </div>
        </div>

        <div className="inline">
          <textarea
            className="textarea"
            rows={3}
            placeholder="Escribe aquí y presiona Enter…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
          />
          <button className="btn brand" disabled={sending} onClick={send}>
            {sending ? "Enviando…" : "Enviar"}
          </button>
        </div>
      </div>
    </div>
  );
}
