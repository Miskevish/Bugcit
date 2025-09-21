import React, { useEffect, useMemo, useState } from "react";
import { api } from "../api";

export default function NotesPage() {
  const [notes, setNotes] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setNotes(await api.listNotes());
      } catch (e) {
        setErr(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Crear
  const addNote = async () => {
    const v = text.trim();
    if (!v) return;
    const saved = await api.addNote(v);
    setNotes((s) => [saved, ...s]);
    setText("");
  };

  // Editar
  const editNote = async (n) => {
    const v = prompt("Editar nota:", n.text);
    if (v === null) return;
    const upd = await api.editNote(n._id, v);
    setNotes((s) => s.map((x) => (x._id === upd._id ? upd : x)));
  };

  // Eliminar
  const deleteNote = async (id) => {
    await api.delNote(id);
    setNotes((s) => s.filter((x) => x._id !== id));
  };

  // Ordenar (más nuevas arriba)
  const ordered = useMemo(
    () =>
      [...notes].sort(
        (a, b) =>
          +new Date(b.date || b.createdAt) - +new Date(a.date || a.createdAt)
      ),
    [notes]
  );

  return (
    <>
      <h1 style={{ margin: "0 0 10px" }}>Notas</h1>
      {err && <div style={{ color: "#ff9a9a" }}>Error: {err}</div>}

      {/* GRID que se adapta: panel fijo + lista scrollable */}
      <div className="notes-grid">
        {/* ===== Columna izquierda: Crear / Editar ===== */}
        <div className="card-bugcit notes-left">
          <div className="card-head">Crear / Editar</div>

          <div className="card-body">
            <textarea
              className="textarea"
              placeholder="Escribe una nota…"
              value={text}
              onChange={(e) => setText(e.target.value)}
              style={{ minHeight: 200, resize: "vertical" }}
            />
          </div>

          <div
            className="card-footer"
            style={{ display: "flex", gap: 8, justifyContent: "flex-start" }}
          >
            <button className="btn brand" onClick={addNote} disabled={loading}>
              Añadir nota
            </button>
            <button className="btn ghost" onClick={() => setText("")}>
              Limpiar
            </button>
          </div>
        </div>

        {/* ===== Columna derecha: Mis notas ===== */}
        <div className="card-bugcit notes-right">
          <div className="card-head">Mis notas</div>

          <div className="card-body notes-scroll">
            {loading ? (
              <div className="text-muted">Cargando…</div>
            ) : ordered.length === 0 ? (
              <div style={{ opacity: 0.6 }}>Sin notas</div>
            ) : (
              <div className="notes-cards">
                {ordered.map((n) => (
                  <div key={n._id} className="card-bugcit note-card">
                    <div
                      className="card-head"
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <span style={{ opacity: 0.85, fontWeight: 700 }}>
                        {new Date(n.date || n.createdAt).toLocaleString()}
                      </span>
                    </div>

                    <div
                      className="card-body"
                      style={{
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-word",
                        overflowWrap: "anywhere",
                        flex: 1,
                      }}
                    >
                      {n.text}
                    </div>

                    <div
                      className="card-footer"
                      style={{ display: "flex", gap: 8 }}
                    >
                      <button className="btn ghost" onClick={() => editNote(n)}>
                        Editar
                      </button>
                      <button
                        className="btn danger"
                        onClick={() => deleteNote(n._id)}
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
