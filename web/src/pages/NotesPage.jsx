import React, { useEffect, useState } from "react";
import { store } from "../data/events";

export default function NotesPage() {
  const [notes, setNotes] = useState(store.getNotes());
  const [text, setText] = useState("");
  useEffect(() => store.setNotes(notes), [notes]);

  return (
    <>
      <h1 style={{ margin: "0 0 10px" }}>Notas</h1>

      <div className="row grid-2">
        <div className="card-bugcit">
          <div className="card-head">Crear / Editar</div>
          <div className="card-body">
            <textarea
              className="textarea"
              placeholder="Escribe una nota…"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </div>
          <div className="card-footer" style={{ display: "flex", gap: 8 }}>
            <button
              className="btn brand"
              onClick={() => {
                if (!text.trim()) return;
                setNotes([
                  {
                    id: crypto.randomUUID(),
                    text: text.trim(),
                    date: new Date().toISOString(),
                  },
                  ...notes,
                ]);
                setText("");
              }}
            >
              Añadir nota
            </button>
            <button className="btn ghost" onClick={() => setText("")}>
              Limpiar
            </button>
          </div>
        </div>

        <div className="card-bugcit">
          <div className="card-head">Mis notas</div>
          <div className="card-body">
            <div className="list">
              {notes.length === 0 && (
                <div style={{ opacity: 0.6 }}>Sin notas</div>
              )}
              {notes.map((n) => (
                <div key={n.id} className="item">
                  <div className="item-left">
                    <div style={{ fontWeight: 800 }}>{n.text}</div>
                    <small>{new Date(n.date).toLocaleString()}</small>
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
      </div>
    </>
  );
}
