// src/pages/Dashboard.jsx
import React, { useMemo, useState, useEffect, useCallback } from "react";
import { api } from "../api";
import ChatCat from "../components/ChatCat.jsx";

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

export default function DashboardPage() {
  const [cursor, setCursor] = useState(new Date());

  // ===== datos desde API
  const [notes, setNotes] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [learning, setLearning] = useState([]);
  const [events, setEvents] = useState([]);

  const loadAll = useCallback(async () => {
    const [n, t, l, e] = await Promise.all([
      api.listNotes(),
      api.listTasks(),
      api.listLearning(),
      api.listEvents(),
    ]);
    setNotes(n);
    setTasks(t);
    setLearning(l);
    setEvents(e);
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  // agrupar eventos por día
  const eventsByDay = useMemo(() => {
    const map = new Map();
    for (const ev of events || []) {
      const key = ymd(ev.date || ev.start);
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

  const finishTimer = async () => {
    if (timer <= 0) return;
    const hours = +(timer / 3600).toFixed(2);
    const entry = await api.addLearning({
      topic: "Sesión rápida",
      date: new Date().toISOString(),
      hours,
    });
    setLearning((s) => [...s, entry]);
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

  const handleAddTask = async () => {
    const v = newTask.trim();
    if (!v) return;
    const saved = await api.addTask(v);
    setTasks((s) => [saved, ...s]);
    setNewTask("");
  };

  /* ====== Acciones que puede disparar el bot ======
     ChatCat llamará onAction({ type, payload }) con alguno de:
     - { type: "create_task", payload: { title } }
     - { type: "create_note", payload: { text } }
     - { type: "create_event", payload: { title, date, start, end } }
     - { type: "refresh" }  -> recarga contadores/listas
     - { type: "notify", payload: { message } } -> notificación del navegador
  */
  const handleBotAction = useCallback(
    async (action) => {
      try {
        switch (action?.type) {
          case "create_task": {
            const title = String(action.payload?.title || "").trim();
            if (!title) break;
            const saved = await api.addTask(title);
            setTasks((s) => [saved, ...s]);
            break;
          }
          case "create_note": {
            const text = String(action.payload?.text || "").trim();
            if (!text) break;
            const saved = await api.addNote(text);
            setNotes((s) => [saved, ...s]);
            break;
          }
          case "create_event": {
            const now = new Date();
            const fallbackDate = ymd(now);
            const payload = action.payload || {};
            const data = {
              title: String(payload.title || "Evento").slice(0, 140),
              // si viene date lo usamos, si no hoy
              date: payload.date || fallbackDate,
              start: payload.start || `${fallbackDate}T09:00:00`,
              end: payload.end || `${fallbackDate}T10:00:00`,
            };
            const saved = await api.addEvent(data);
            setEvents((s) => [saved, ...s]);
            break;
          }
          case "refresh": {
            await loadAll();
            break;
          }
          case "notify": {
            const msg = action.payload?.message || "Recordatorio de BUGCIT";
            if ("Notification" in window) {
              if (Notification.permission === "granted") {
                new Notification("BUGCIT", { body: msg });
              } else if (Notification.permission !== "denied") {
                const perm = await Notification.requestPermission();
                if (perm === "granted")
                  new Notification("BUGCIT", { body: msg });
              }
            }
            break;
          }
          default:
            break;
        }
      } catch (e) {
        console.error("Bot action error:", e);
      }
    },
    [loadAll]
  );

  return (
    <>
      <h1 style={{ margin: "0 0 10px 0" }}>Panel de control</h1>

      {/* fila superior: calendario + BUGCIT assistant */}
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
                            key={ev._id}
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

        {/* 👇 BUGCIT Assistant (chat) */}
        <div className="card-bugcit" style={{ display: "grid" }}>
          <div className="card-head">BUGCIT Assistant</div>
          <div className="card-body" style={{ padding: 0 }}>
            <ChatCat
              persistKey="bugcit:chat"
              title={`Hola, tienes ${tasks.length} ${
                tasks.length === 1 ? "tarea" : "tareas"
              }`}
              counts={{
                tasks: tasks.length,
                notes: notes.length,
                events: events.length,
              }}
              onAction={handleBotAction}
            />
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
              onClick={async () => {
                if (!noteText.trim()) return;
                const saved = await api.addNote(noteText.trim());
                setNotes((s) => [saved, ...s]);
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
                  key={n._id}
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
                      {new Date(n.date || n.createdAt).toLocaleDateString()}
                    </small>
                  </div>

                  <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                    <button
                      className="btn ghost"
                      onClick={async () => {
                        const t = prompt("Editar nota:", n.text);
                        if (t === null) return;
                        const upd = await api.editNote(n._id, t);
                        setNotes((s) =>
                          s.map((x) => (x._id === upd._id ? upd : x))
                        );
                      }}
                    >
                      Editar
                    </button>
                    <button
                      className="btn danger"
                      onClick={async () => {
                        await api.delNote(n._id);
                        setNotes((s) => s.filter((x) => x._id !== n._id));
                      }}
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

        {/* ===== Tareas ===== */}
        <div className="card-bugcit">
          <div className="card-head">Tareas</div>
          <div className="card-body">
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

            <div className="task-cards">
              {tasks.map((t) => (
                <div key={t._id} className="task-card">
                  <label className="task-check">
                    <input
                      type="checkbox"
                      checked={!!t.done}
                      onChange={async (e) => {
                        const upd = await api.updTask(t._id, {
                          done: e.target.checked,
                        });
                        setTasks((s) =>
                          s.map((x) => (x._id === upd._id ? upd : x))
                        );
                      }}
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
                      onClick={async () => {
                        const v = prompt("Editar tarea:", t.title);
                        if (v === null) return;
                        const upd = await api.updTask(t._id, { title: v });
                        setTasks((s) =>
                          s.map((x) => (x._id === upd._id ? upd : x))
                        );
                      }}
                    >
                      Editar
                    </button>
                    <button
                      className="btn danger"
                      onClick={async () => {
                        await api.delTask(t._id);
                        setTasks((s) => s.filter((x) => x._id !== t._id));
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
