import React, { useEffect, useMemo, useState } from "react";
import { store } from "../data/events";

export default function NotesPage() {
  const [notes, setNotes] = useState(store.getNotes());
  const [text, setText] = useState("");

  // Persistir
  useEffect(() => store.setNotes(notes), [notes]);

  // Crear
  const addNote = () => {
    const v = text.trim();
    if (!v) return;
    setNotes([
      { id: crypto.randomUUID(), text: v, date: new Date().toISOString() },
      ...notes,
    ]);
    setText("");
  };

  // Editar
  const editNote = (n) => {
    const v = prompt("Editar nota:", n.text);
    if (v === null) return;
    setNotes(notes.map((x) => (x.id === n.id ? { ...x, text: v } : x)));
  };

  // Eliminar
  const deleteNote = (id) => setNotes(notes.filter((x) => x.id !== id));

  // Ordenar (más nuevas arriba)
  const ordered = useMemo(
    () => [...notes].sort((a, b) => +new Date(b.date) - +new Date(a.date)),
    [notes]
  );

  return (
    <>
      <h1 style={{ margin: "0 0 10px" }}>Notas</h1>

      {/* GRID que se adapta: panel fijo + lista scrollable */}
      <div className="notes-grid">
        {/* ===== Columna izquierda: Crear / Editar (alto fijo, sticky) ===== */}
        <div className="card-bugcit notes-left">
          <div className="card-head">Crear / Editar</div>

          <div className="card-body">
            <textarea
              className="textarea"
              placeholder="Escribe una nota…"
              value={text}
              onChange={(e) => setText(e.target.value)}
              // Alto cómodo, no crece con la lista de la derecha
              style={{ minHeight: 200, resize: "vertical" }}
            />
          </div>

          <div
            className="card-footer"
            style={{ display: "flex", gap: 8, justifyContent: "flex-start" }}
          >
            <button className="btn brand" onClick={addNote}>
              Añadir nota
            </button>
            <button className="btn ghost" onClick={() => setText("")}>
              Limpiar
            </button>
          </div>
        </div>

        {/* ===== Columna derecha: Mis notas (cards scrollable dentro de la card) ===== */}
        <div className="card-bugcit notes-right">
          <div className="card-head">Mis notas</div>

          <div className="card-body notes-scroll">
            {ordered.length === 0 ? (
              <div style={{ opacity: 0.6 }}>Sin notas</div>
            ) : (
              <div className="notes-cards">
                {ordered.map((n) => (
                  <div key={n.id} className="card-bugcit note-card">
                    <div
                      className="card-head"
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <span style={{ opacity: 0.85, fontWeight: 700 }}>
                        {new Date(n.date).toLocaleString()}
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
                        onClick={() => deleteNote(n.id)}
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
