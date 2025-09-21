import React, { useMemo, useState, useEffect } from "react";
import { store } from "../data/events";

/* ================= helpers ================= */
function ymd(dateLike) {
  const d = new Date(dateLike);
  const utc = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return utc.toISOString().slice(0, 10);
}

/** month grid aligned to week start (sun|mon) */
function useMonth(date, weekStart = "sun") {
  const y = date.getFullYear();
  const m = date.getMonth();
  const first = new Date(y, m, 1);
  const dow = first.getDay(); // 0=Sun..6=Sat

  // If week starts on Monday, shift: Mon=0..Sun=6
  const startDow = weekStart === "mon" ? (dow + 6) % 7 : dow;

  const days = [];
  let d = new Date(y, m, 1 - startDow);
  for (let i = 0; i < 42; i++) {
    days.push(new Date(d));
    d.setDate(d.getDate() + 1);
  }
  return { y, m, days };
}

/* ================= page ================= */
export default function CalendarPage() {
  // === IMPORTANT: keep "sun" to match dashboard (Sunday-first)
  const WEEK_START = "sun"; // change to "mon" if you ever need Monday-first
  const DOW =
    WEEK_START === "mon"
      ? ["lun", "mar", "mié", "jue", "vie", "sáb", "dom"]
      : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const [cursor, setCursor] = useState(new Date());
  const [events, setEvents] = useState(store.getEvents());
  useEffect(() => store.setEvents(events), [events]);

  const { y, m, days } = useMonth(cursor, WEEK_START);
  const ymLabel = cursor.toLocaleDateString("es-AR", {
    month: "long",
    year: "numeric",
  });

  const eventsByDay = useMemo(() => {
    const map = new Map();
    for (const ev of events) {
      const k = ymd(ev.date || ev.start);
      if (!map.has(k)) map.set(k, []);
      map.get(k).push(ev);
    }
    return map;
  }, [events]);

  // ===== modal =====
  const [modal, setModal] = useState(null); // {mode, date?, event?}
  const [title, setTitle] = useState("");
  const openCreate = (dateISO) => {
    setTitle("");
    setModal({ mode: "create", date: dateISO });
  };
  const openEdit = (ev) => {
    setTitle(ev.title);
    setModal({ mode: "edit", event: ev });
  };
  const close = () => setModal(null);
  const save = () => {
    if (!title.trim()) return;
    if (modal.mode === "create") {
      setEvents([
        ...events,
        { id: crypto.randomUUID(), title: title.trim(), date: modal.date },
      ]);
    } else {
      setEvents(
        events.map((e) =>
          e.id === modal.event.id ? { ...e, title: title.trim() } : e
        )
      );
    }
    close();
  };
  const remove = () => {
    if (!modal?.event) return;
    setEvents(events.filter((e) => e.id !== modal.event.id));
    close();
  };

  // agenda del mes en CARDS
  const monthAgenda = useMemo(() => {
    const inMonth = events.filter((e) => {
      const d = new Date(e.date);
      return d.getMonth() === m && d.getFullYear() === y;
    });
    return inMonth.sort((a, b) => +new Date(a.date) - +new Date(b.date));
  }, [events, y, m]);

  return (
    <>
      <h1 style={{ margin: "0 0 10px" }}>Calendario</h1>

      <div className="row grid-2">
        {/* === CALENDARIO (mismo look que el dashboard) === */}
        <div className="card-bugcit">
          <div
            className="card-head"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <strong style={{ textTransform: "capitalize" }}>{ymLabel}</strong>
            <div className="cal-controls">
              <button
                className="btn ghost"
                onClick={() => setCursor(new Date(y, m - 1, 1))}
              >
                ◀
              </button>
              <button
                className="btn ghost"
                onClick={() => setCursor(new Date())}
              >
                hoy
              </button>
              <button
                className="btn ghost"
                onClick={() => setCursor(new Date(y, m + 1, 1))}
              >
                ▶
              </button>
            </div>
          </div>

          <div className="card-body">
            <div className="grid-month">
              <div className="dow">
                {DOW.map((d) => (
                  <div key={d}>{d}</div>
                ))}
              </div>

              <div className="days">
                {days.map((d, idx) => {
                  const inMonth = d.getMonth() === m;
                  const dateISO = ymd(d);
                  const todays = eventsByDay.get(dateISO) || [];
                  return (
                    <div
                      key={idx}
                      className="day"
                      style={{ opacity: inMonth ? 1 : 0.35, cursor: "pointer" }}
                      onClick={(e) => {
                        if (e.target.dataset.ev) return; // no interferir con el chip
                        openCreate(dateISO);
                      }}
                      title={inMonth ? "Crear/Ver eventos" : undefined}
                    >
                      <div className="num">{d.getDate()}</div>

                      {/* chips como en el dashboard (máx 2 visibles) */}
                      <div style={{ display: "grid", gap: 6, marginTop: 18 }}>
                        {todays.slice(0, 2).map((ev) => (
                          <span
                            key={ev.id}
                            data-ev
                            className="badge purple"
                            style={{ justifySelf: "start" }}
                            onClick={() => openEdit(ev)}
                            title={ev.title}
                          >
                            {ev.title.length > 14
                              ? ev.title.slice(0, 14) + "…"
                              : ev.title}
                          </span>
                        ))}
                        {todays.length > 2 && (
                          <small style={{ opacity: 0.8 }}>
                            +{todays.length - 2} más
                          </small>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* === AGENDA en CARDS con botones abajo === */}
        <div className="card-bugcit">
          <div className="card-head">Agenda</div>
          <div className="card-body">
            {monthAgenda.length === 0 && (
              <div style={{ opacity: 0.6 }}>Sin eventos</div>
            )}

            <div className="agenda-cards">
              {monthAgenda.map((ev) => (
                <div key={ev.id} className="card-bugcit agenda-card">
                  <div className="card-body">
                    <div className="badge purple" style={{ marginBottom: 8 }}>
                      {new Date(ev.date).toLocaleDateString()}
                    </div>
                    <div className="agenda-card-title">{ev.title}</div>
                  </div>
                  <div
                    className="card-footer"
                    style={{ display: "flex", gap: 8 }}
                  >
                    <button className="btn ghost" onClick={() => openEdit(ev)}>
                      Editar
                    </button>
                    <button
                      className="btn danger"
                      onClick={() =>
                        setEvents(events.filter((x) => x.id !== ev.id))
                      }
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* === MODAL === */}
      {modal && (
        <div className="drawer-backdrop" onClick={close}>
          <div
            className="card-bugcit"
            style={{
              position: "fixed",
              inset: 0,
              margin: "auto",
              maxWidth: 520,
              height: "fit-content",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="card-head">
              {modal.mode === "create" ? "Nuevo evento" : "Editar evento"}
            </div>
            <div className="card-body">
              {modal.mode === "create" && (
                <div className="mb-12" style={{ opacity: 0.85 }}>
                  Fecha:{" "}
                  <strong>{new Date(modal.date).toLocaleDateString()}</strong>
                </div>
              )}
              <input
                className="input"
                autoFocus
                placeholder="Título…"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div
              className="card-footer"
              style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}
            >
              {modal.mode === "edit" && (
                <button className="btn danger" onClick={remove}>
                  Eliminar
                </button>
              )}
              <button className="btn ghost" onClick={close}>
                Cancelar
              </button>
              <button className="btn brand" onClick={save}>
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
