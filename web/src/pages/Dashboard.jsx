import React, { useMemo, useState, useEffect } from "react";
import { store } from "../data/events";
import catImg from "../assets/bugcit.png";

function useMonth(date) {
  const y = date.getFullYear();
  const m = date.getMonth();
  const first = new Date(y, m, 1);
  const startDow = first.getDay(); // 0-6 (Sun)
  // construimos 6 filas x 7 (clásico)
  const days = [];
  let d = new Date(y, m, 1 - startDow);
  for (let i = 0; i < 42; i++) {
    days.push(new Date(d));
    d.setDate(d.getDate() + 1);
  }
  return { y, m, days };
}

export default function DashboardPage() {
  const [today] = useState(new Date());
  const [cursor, setCursor] = useState(new Date());
  const [notes, setNotes] = useState(store.getNotes());
  const [tasks, setTasks] = useState(store.getTasks());
  const [learning, setLearning] = useState(store.getLearning());
  const [noteText, setNoteText] = useState("");

  useEffect(() => {
    store.setNotes(notes);
  }, [notes]);
  useEffect(() => {
    store.setTasks(tasks);
  }, [tasks]);
  useEffect(() => {
    store.setLearning(learning);
  }, [learning]);

  const { m, y, days } = useMonth(cursor);
  const ymLabel = cursor.toLocaleDateString("es-AR", {
    month: "long",
    year: "numeric",
  });

  // Simple timer de “sesión de aprendizaje”
  const [timer, setTimer] = useState(0); // segundos
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
    // guarda como “Sesión rápida”
    const hours = +(timer / 3600).toFixed(2);
    const entry = {
      id: crypto.randomUUID(),
      topic: "Sesión rápida",
      date: new Date().toISOString(),
      hours,
    };
    const next = [...learning, entry];
    setLearning(next);
    setTimer(0);
    setRunning(false);
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
                  const n = d.getDate();
                  return (
                    <div
                      key={idx}
                      className="day"
                      style={{ opacity: inMonth ? 1 : 0.35 }}
                    >
                      <div className="num">{n}</div>
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
        {/* Notas */}
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
                <div key={n.id} className="item">
                  <div className="item-left">
                    <div style={{ fontWeight: 800 }}>{n.text}</div>
                    <small>{new Date(n.date).toLocaleDateString()}</small>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
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
          </div>
        </div>

        {/* Tareas (checklist) */}
        <div className="card-bugcit">
          <div className="card-head">Tareas</div>
          <div className="card-body">
            <div className="list">
              {tasks.length === 0 && (
                <div style={{ opacity: 0.6 }}>Sin tareas</div>
              )}
              {tasks.map((t) => (
                <div key={t.id} className="item">
                  <label className="item-left">
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
                    <div
                      style={{
                        textDecoration: t.done ? "line-through" : "none",
                      }}
                    >
                      {t.title}
                    </div>
                  </label>
                  <div style={{ display: "flex", gap: 8 }}>
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
          <div className="card-footer" style={{ display: "flex", gap: 8 }}>
            <input
              className="input"
              placeholder="Nueva tarea…"
              id="dash-new-task"
            />
            <button
              className="btn brand"
              onClick={() => {
                const el = document.getElementById("dash-new-task");
                const v = (el.value || "").trim();
                if (!v) return;
                setTasks([
                  { id: crypto.randomUUID(), title: v, done: false },
                  ...tasks,
                ]);
                el.value = "";
              }}
            >
              Añadir
            </button>
          </div>
        </div>

        {/* Aprendizaje quick session */}
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
