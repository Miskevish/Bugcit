import React, { useEffect, useMemo, useState } from "react";
import { api } from "../api";

export default function TasksPage() {
  const [tasks, setTasks] = useState([]); // {_id,title,done}
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setTasks(await api.listTasks());
      } catch (e) {
        setErr(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const stats = useMemo(() => {
    const total = tasks.length;
    const done = tasks.filter((t) => t.done).length;
    return { total, done, pending: total - done };
  }, [tasks]);

  const add = async () => {
    if (!q.trim()) return;
    const saved = await api.addTask(q.trim());
    setTasks((s) => [saved, ...s]);
    setQ("");
  };

  return (
    <>
      <h1 style={{ margin: "0 0 10px" }}>Tareas</h1>
      {err && <div style={{ color: "#ff9a9a" }}>Error: {err}</div>}

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
              <button className="btn brand" onClick={add} disabled={loading}>
                Añadir
              </button>
              <div />
            </div>

            <div className="mt-16" />
            <div className="list">
              {loading && <div className="text-muted">Cargando…</div>}
              {!loading && tasks.length === 0 && (
                <div style={{ opacity: 0.6 }}>No hay tareas</div>
              )}
              {tasks.map((t) => (
                <div key={t._id} className="item">
                  <label className="item-left" style={{ cursor: "pointer" }}>
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
