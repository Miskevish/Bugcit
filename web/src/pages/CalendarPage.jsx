import React, { useMemo, useState, useEffect } from "react";
import { store } from "../data/events";

function useMonth(date) {
  const y = date.getFullYear();
  const m = date.getMonth();
  const first = new Date(y, m, 1);
  const startDow = first.getDay();
  const days = [];
  let d = new Date(y, m, 1 - startDow);
  for (let i = 0; i < 42; i++) {
    days.push(new Date(d));
    d.setDate(d.getDate() + 1);
  }
  return { y, m, days };
}

const fmt = (d) => new Date(d).toISOString().slice(0, 10);

export default function CalendarPage() {
  const [cursor, setCursor] = useState(new Date());
  const [events, setEvents] = useState(store.getEvents());
  useEffect(() => store.setEvents(events), [events]);

  const { y, m, days } = useMonth(cursor);
  const ymLabel = cursor.toLocaleDateString("es-AR", {
    month: "long",
    year: "numeric",
  });

  const eventsByDay = useMemo(() => {
    const map = {};
    for (const e of events) {
      const key = fmt(e.date);
      (map[key] || (map[key] = [])).push(e);
    }
    return map;
  }, [events]);

  // modal simple
  const [modal, setModal] = useState(null);
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
      const ev = {
        id: crypto.randomUUID(),
        title: title.trim(),
        date: modal.date,
      };
      setEvents([...events, ev]);
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
    if (modal?.event) {
      setEvents(events.filter((e) => e.id !== modal.event.id));
      close();
    }
  };

  const agenda = useMemo(() => {
    const key = (d) => +new Date(d.date);
    const sameMonth = events.filter(
      (e) =>
        new Date(e.date).getMonth() === m &&
        new Date(e.date).getFullYear() === y
    );
    return sameMonth.sort((a, b) => key(a) - key(b));
  }, [events, y, m]);

  return (
    <>
      <h1 style={{ margin: "0 0 10px" }}>Calendario</h1>

      <div className="row grid-2">
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
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                  <div key={d}>{d}</div>
                ))}
              </div>
              <div className="days">
                {days.map((d, idx) => {
                  const inMonth = d.getMonth() === m;
                  const n = d.getDate();
                  const key = fmt(d);
                  const todays = eventsByDay[key] || [];
                  return (
                    <div
                      key={idx}
                      className="day"
                      style={{ opacity: inMonth ? 1 : 0.35 }}
                      onClick={(e) => {
                        if (e.target.dataset.ev) return;
                        openCreate(key);
                      }}
                    >
                      <div className="num">{n}</div>
                      <div
                        style={{ display: "flex", gap: 6, flexWrap: "wrap" }}
                      >
                        {todays.map((ev) => (
                          <div
                            key={ev.id}
                            data-ev
                            className="badge purple"
                            onClick={() => openEdit(ev)}
                            title="Editar evento"
                          >
                            {ev.title}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="card-bugcit">
          <div className="card-head">Agenda</div>
          <div className="card-body">
            <div className="list">
              {agenda.length === 0 && (
                <div style={{ opacity: 0.6 }}>Sin eventos</div>
              )}
              {agenda.map((ev) => (
                <div key={ev.id} className="item">
                  <div className="item-left">
                    <div className="badge purple">
                      {new Date(ev.date).toLocaleDateString()}
                    </div>
                    <div style={{ fontWeight: 800 }}>{ev.title}</div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button className="btn ghost" onClick={() => openEdit(ev)}>
                      Editar
                    </button>
                    <button
                      className="btn danger"
                      onClick={() => {
                        setEvents(events.filter((e) => e.id !== ev.id));
                      }}
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

      {/* Modal básico */}
      {modal && (
        <div className="drawer-backdrop" onClick={close}>
          <div
            className="card-bugcit"
            style={{
              position: "fixed",
              inset: "0",
              margin: "auto",
              maxWidth: 520,
              height: "fit-content",
              padding: 0,
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
                placeholder="Título..."
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
