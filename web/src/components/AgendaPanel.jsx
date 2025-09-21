import React, { useEffect, useState } from "react";
import { loadEvents } from "../data/events";

export default function AgendaPanel() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const sync = () =>
      setEvents(
        loadEvents().sort((a, b) => new Date(a.start) - new Date(b.start))
      );
    sync();
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  const fmt = (s, e, allDay) => {
    const S = new Date(s),
      E = e ? new Date(e) : null;
    const d = S.toLocaleDateString(undefined, {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
    const t = (x) =>
      x.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
    if (allDay) return `${d} (todo el día)`;
    if (!E || S.toDateString() === E.toDateString()) return `${d} ${t(S)}`;
    return `${d} ${t(S)} → ${E.toLocaleDateString()} ${t(E)}`;
  };

  return (
    <div className="agenda-cards">
      {events.length === 0 && (
        <div className="agenda-empty" style={{ opacity: 0.7 }}>
          Sin eventos
        </div>
      )}

      {events.map((e) => (
        <div
          key={e.id}
          className={`card-bugcit agenda-card ${e.className || ""}`}
        >
          <div className="card-body">
            <div className="badge purple" style={{ marginBottom: 8 }}>
              {fmt(e.start, e.end, e.allDay)}
            </div>
            <div className="agenda-card-title">{e.title}</div>
          </div>
          <div className="card-footer" style={{ display: "flex", gap: 8 }}>
            <button className="btn ghost">Editar</button>
            <button className="btn danger">Eliminar</button>
          </div>
        </div>
      ))}
    </div>
  );
}
