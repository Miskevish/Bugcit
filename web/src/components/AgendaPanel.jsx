import React, { useEffect, useState } from "react";
import { loadEvents } from "../data/events";

const AgendaPanel = () => {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const sync = () =>
      setEvents(
        loadEvents()
          .sort((a, b) => new Date(a.start) - new Date(b.start))
          .slice(0, 8)
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
    <div>
      <ul className="agenda-list">
        {events.length === 0 && <div className="agenda-empty">Sin eventos</div>}
        {events.map((e) => (
          <li key={e.id} className={`agenda-item ${e.className || ""}`}>
            <div className="agenda-title">{e.title}</div>
            <div className="agenda-meta">{fmt(e.start, e.end, e.allDay)}</div>
          </li>
        ))}
      </ul>
    </div>
  );
};
export default AgendaPanel;
