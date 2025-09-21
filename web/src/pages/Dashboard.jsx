// src/pages/DashboardPage.jsx
import React, { useMemo, useState, useEffect } from "react";
import { store } from "../data/events";
import catImg from "../assets/bugcit.png";

/* ================== helpers de fechas ================== */
function ymd(dateLike) {
  const d = new Date(dateLike);
  const utc = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return utc.toISOString().slice(0, 10);
}
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
/* ========= fallback para leer eventos si el store no los expone ========= */
function loadEventsFallback() {
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      const raw = localStorage.getItem(k);
      if (!raw) continue;
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) continue;
      const list = parsed
        .map((e, idx) => {
          const start = e.start || e.date;
          const title = e.title || e.name || e.titulo;
          if (!start || !title) return null;
          return { id: e.id ?? `${k}-${idx}`, title, date: ymd(start) };
        })
        .filter(Boolean);
      if (list.length) return list;
    }
  } catch {}
  return [];
}

export default function DashboardPage() {
  const [cursor, setCursor] = useState(new Date());

  // === datos del store
  const [notes, setNotes] = useState(store.getNotes());
  const [tasks, setTasks] = useState(store.getTasks());
  const [learning, setLearning] = useState(store.getLearning());

  useEffect(() => {
    store.setNotes(notes);
  }, [notes]);
  useEffect(() => {
    store.setTasks(tasks);
  }, [tasks]);
  useEffect(() => {
    store.setLearning(learning);
  }, [learning]);

  // === eventos para el calendario del dashboard
  const [events, setEvents] = useState(
    typeof store.getEvents === "function"
      ? store.getEvents()
      : loadEventsFallback()
  );
  useEffect(() => {
    const reload = () => {
      setEvents(
        typeof store.getEvents === "function"
          ? store.getEvents()
          : loadEventsFallback()
      );
    };
    window.addEventListener("focus", reload);
    window.addEventListener("storage", reload);
    return () => {
      window.removeEventListener("focus", reload);
      window.removeEventListener("storage", reload);
    };
  }, []);

  // agrupar eventos por día
  const eventsByDay = useMemo(() => {
    const map = new Map();
    for (const ev of events || []) {
      const key = ymd(ev.date || ev.start || ev.when);
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(ev);
    }
    return map;
  }, [events]);

  const { m, y, days } = useMonth(cursor);
  const ymLabel = cursor.toLocaleDateString("es-AR", {
    month: "long",
    year: "numeric",
  });

  // === timer aprendizaje
  const [timer, setTimer] = useState(0);
  const [running, setRunning] = useState(false);
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setTimer((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [running]);

  const totalLearnHours = useMemo(
    () => learning.reduce((a, x) => a + (x.hours || 0), 0),
    [learning]
  );

  const finishTimer = () => {
    if (timer <= 0) return;
    const hours = +(timer / 3600).toFixed(2);
    const entry = {
      id: crypto.randomUUID(),
      topic: "Sesión rápida",
      date: new Date().toISOString(),
      hours,
    };
    setLearning([...learning, entry]);
    setTimer(0);
    setRunning(false);
  };

  // navegación al calendario completo
  const goToCalendarDate = (dateStr) => {
    window.location.href = `/calendar?date=${encodeURIComponent(dateStr)}`;
  };

  // ===== Notas (estado del textarea)
  const [noteText, setNoteText] = useState("");

  // ===== Tareas (nuevo título controlado)
  const [newTask, setNewTask] = useState("");
  const handleAddTask = () => {
    const v = newTask.trim();
    if (!v) return;
    setTasks([{ id: crypto.randomUUID(), title: v, done: false }, ...tasks]);
    setNewTask("");
  };

  return (
    <>
      <h1 style={{ margin: "0 0 10px 0" }}>Panel de control</h1>

      {/* fila superior: calendario + gato */}
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
                  const dateStr = ymd(d);
                  const dayEvents = eventsByDay.get(dateStr) || [];
                  return (
                    <div
                      key={idx}
                      className="day"
                      style={{ opacity: inMonth ? 1 : 0.35, cursor: "pointer" }}
                      onClick={() => goToCalendarDate(dateStr)}
                      title={inMonth ? "Crear/Ver eventos" : undefined}
                    >
                      <div className="num">{d.getDate()}</div>
                      <div style={{ display: "grid", gap: 6, marginTop: 18 }}>
                        {dayEvents.slice(0, 2).map((ev) => (
                          <span
                            key={ev.id}
                            className="badge purple"
                            style={{ justifySelf: "start" }}
                            onClick={(e) => {
                              e.stopPropagation();
                              goToCalendarDate(dateStr);
                            }}
                            title={ev.title}
                          >
                            {ev.title.length > 14
                              ? ev.title.slice(0, 14) + "…"
                              : ev.title}
                          </span>
                        ))}
                        {dayEvents.length > 2 && (
                          <small style={{ opacity: 0.8 }}>
                            +{dayEvents.length - 2} más
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

        <div className="card-bugcit" style={{ display: "grid" }}>
          <div className="card-head">
            Hola, tienes {tasks.length} tareas para hoy
          </div>
          <div className="card-body cat-wrap">
            <img src={catImg} alt="Bugcit Cat" />
          </div>
        </div>
      </div>

      {/* fila inferior: notas + tareas + aprendizaje */}
      <div className="row grid-3" style={{ marginTop: 16 }}>
        {/* ===== Notas ===== */}
        <div className="card-bugcit">
          <div className="card-head">Notas</div>
          <div className="card-body">
            <textarea
              className="textarea"
              placeholder="Escribe una nota..."
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
            />
            <div className="mt-12" />
            <button
              className="btn brand"
              onClick={() => {
                if (!noteText.trim()) return;
                setNotes([
                  {
                    id: crypto.randomUUID(),
                    text: noteText.trim(),
                    date: new Date().toISOString(),
                  },
                  ...notes,
                ]);
                setNoteText("");
              }}
            >
              Añadir nota
            </button>

            <div className="mt-16" />
            <div className="list">
              {notes.length === 0 && (
                <div style={{ opacity: 0.6 }}>Sin notas</div>
              )}
              {notes.map((n) => (
                <div
                  key={n.id}
                  className="item"
                  style={{ alignItems: "flex-start" }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontWeight: 800,
                        whiteSpace: "pre-wrap",
                        overflowWrap: "anywhere",
                        wordBreak: "break-word",
                        display: "-webkit-box",
                        WebkitBoxOrient: "vertical",
                        WebkitLineClamp: 2,
                        overflow: "hidden",
                        lineHeight: 1.35,
                      }}
                      title={n.text}
                    >
                      {n.text}
                    </div>
                    <small style={{ opacity: 0.8 }}>
                      {new Date(n.date).toLocaleDateString()}
                    </small>
                  </div>

                  <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                    <button
                      className="btn ghost"
                      onClick={() => {
                        const t = prompt("Editar nota:", n.text);
                        if (t === null) return;
                        setNotes(
                          notes.map((x) =>
                            x.id === n.id ? { ...x, text: t } : x
                          )
                        );
                      }}
                    >
                      Editar
                    </button>
                    <button
                      className="btn danger"
                      onClick={() =>
                        setNotes(notes.filter((x) => x.id !== n.id))
                      }
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12">
              <a className="btn ghost" href="/notes">
                Abrir página de Notas →
              </a>
            </div>
          </div>
        </div>

        {/* ===== Tareas (cards responsivas) ===== */}
        <div className="card-bugcit">
          <div className="card-head">Tareas</div>
          <div className="card-body">
            {/* Formulario para crear */}
            <div className="task-new inline" style={{ marginBottom: 12 }}>
              <input
                className="input"
                placeholder="Nueva tarea…"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAddTask();
                }}
              />
              <button className="btn brand" onClick={handleAddTask}>
                Añadir
              </button>
            </div>

            {tasks.length === 0 && <div className="text-muted">Sin tareas</div>}

            {/* Grid de cards */}
            <div className="task-cards">
              {tasks.map((t) => (
                <div key={t.id} className="task-card">
                  <label className="task-check">
                    <input
                      type="checkbox"
                      checked={!!t.done}
                      onChange={(e) =>
                        setTasks(
                          tasks.map((x) =>
                            x.id === t.id ? { ...x, done: e.target.checked } : x
                          )
                        )
                      }
                    />
                    <span
                      className="task-title"
                      style={{
                        textDecoration: t.done ? "line-through" : "none",
                      }}
                    >
                      {t.title}
                    </span>
                  </label>

                  <div className="task-footer">
                    <button
                      className="btn ghost"
                      onClick={() => {
                        const v = prompt("Editar tarea:", t.title);
                        if (v === null) return;
                        setTasks(
                          tasks.map((x) =>
                            x.id === t.id ? { ...x, title: v } : x
                          )
                        );
                      }}
                    >
                      Editar
                    </button>
                    <button
                      className="btn danger"
                      onClick={() =>
                        setTasks(tasks.filter((x) => x.id !== t.id))
                      }
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* 👇 IMPORTANTE: ya NO hay otro card-footer con otro input */}
        </div>

        {/* ===== Aprendizaje ===== */}
        <div className="card-bugcit">
          <div className="card-head">Aprendizaje</div>
          <div className="card-body">
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr auto auto",
                gap: 10,
                alignItems: "center",
              }}
            >
              <div style={{ opacity: 0.8 }}>
                Cronómetro (se guarda como “Sesión rápida”)
              </div>
              <button className="btn" onClick={() => setRunning((r) => !r)}>
                {running ? "Pausar" : "Iniciar"}
              </button>
              <button className="btn danger" onClick={finishTimer}>
                Guardar
              </button>
            </div>

            <div className="mt-16" />
            <div style={{ fontSize: 42, fontWeight: 900, letterSpacing: 1 }}>
              {String(Math.floor(timer / 3600)).padStart(2, "0")}:
              {String(Math.floor((timer % 3600) / 60)).padStart(2, "0")}:
              {String(timer % 60).padStart(2, "0")}
            </div>
            <div className="mt-12" />
            <div style={{ opacity: 0.8 }}>
              Horas totales: <strong>{totalLearnHours}</strong>
            </div>
          </div>
          <div className="card-footer">
            <a className="btn ghost" href="/learning">
              Ver todo el aprendizaje →
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
