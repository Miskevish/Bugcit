import React, { useEffect, useMemo, useState } from "react";
import { store } from "../data/events";

export default function TasksPage() {
  const [tasks, setTasks] = useState(store.getTasks());
  const [q, setQ] = useState("");
  useEffect(() => store.setTasks(tasks), [tasks]);

  const stats = useMemo(() => {
    const total = tasks.length;
    const done = tasks.filter((t) => t.done).length;
    return { total, done, pending: total - done };
  }, [tasks]);

  return (
    <>
      <h1 style={{ margin: "0 0 10px" }}>Tareas</h1>

      <div className="row grid-2">
        <div className="card-bugcit">
          <div className="card-head">Listado</div>
          <div className="card-body">
            <div className="inline">
              <input
                className="input"
                placeholder="Nueva tarea..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
              <button
                className="btn brand"
                onClick={() => {
                  if (!q.trim()) return;
                  setTasks([
                    { id: crypto.randomUUID(), title: q.trim(), done: false },
                    ...tasks,
                  ]);
                  setQ("");
                }}
              >
                Añadir
              </button>
              <div />
            </div>

            <div className="mt-16" />
            <div className="list">
              {tasks.length === 0 && (
                <div style={{ opacity: 0.6 }}>No hay tareas</div>
              )}
              {tasks.map((t) => (
                <div key={t.id} className="item">
                  <label className="item-left" style={{ cursor: "pointer" }}>
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
                        fontWeight: 800,
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
        </div>

        <div className="card-bugcit">
          <div className="card-head">Resumen</div>
          <div className="card-body">
            <div className="list">
              <div className="item">
                <div className="item-left">
                  <strong>Total:</strong>
                </div>
                <div>{stats.total}</div>
              </div>
              <div className="item">
                <div className="item-left">
                  <strong>Completadas:</strong>
                </div>
                <div>{stats.done}</div>
              </div>
              <div className="item">
                <div className="item-left">
                  <strong>Pendientes:</strong>
                </div>
                <div>{stats.pending}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
