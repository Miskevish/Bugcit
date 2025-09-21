import React, { useEffect, useState } from "react";

export default function EventModal({
  open,
  onClose,
  onCreate,
  defaultDate,
  withRange = false,
}) {
  const [title, setTitle] = useState("");
  const [allDay, setAllDay] = useState(true);
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [category, setCategory] = useState("Otro");
  const [desc, setDesc] = useState("");

  useEffect(() => {
    if (open) {
      const iso = (d) => d.toISOString().slice(0, 16);
      if (defaultDate?.start) {
        setStart(iso(defaultDate.start));
      } else if (defaultDate) {
        setStart(iso(defaultDate));
      } else {
        setStart(iso(new Date()));
      }
      if (defaultDate?.end) {
        setEnd(iso(defaultDate.end));
      } else {
        const plus = new Date();
        plus.setHours(plus.getHours() + 1);
        setEnd(iso(plus));
      }
      setAllDay(defaultDate?.allDay ?? true);
      setTitle("");
      setCategory("Otro");
      setDesc("");
    }
  }, [open, defaultDate]);

  if (!open) return null;

  const submit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    onCreate({
      title,
      allDay,
      start: allDay
        ? new Date(start).toISOString().slice(0, 10)
        : new Date(start).toISOString(),
      end: allDay
        ? new Date(start).toISOString().slice(0, 10)
        : new Date(end).toISOString(),
      extendedProps: { category, desc },
    });
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <div className="modal-header">
          <strong>Nuevo evento</strong>
          <button className="btn-ghost" onClick={onClose}>
            ✕
          </button>
        </div>
        <form className="modal-body" onSubmit={submit}>
          <label className="f-label">Título</label>
          <input
            className="f-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ej. Reunión"
          />

          <div className="grid-2">
            <div>
              <label className="f-label">Categoría</label>
              <select
                className="f-input"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option>Otro</option>
                <option>Trabajo</option>
                <option>Personal</option>
                <option>Estudio</option>
              </select>
            </div>
            <div style={{ display: "flex", alignItems: "end", gap: 8 }}>
              <input
                type="checkbox"
                checked={allDay}
                onChange={(e) => setAllDay(e.target.checked)}
              />
              <span className="f-label" style={{ margin: 0 }}>
                Todo el día
              </span>
            </div>
          </div>

          <div className="grid-2">
            <div>
              <label className="f-label">{allDay ? "Fecha" : "Inicio"}</label>
              <input
                className="f-input"
                type={allDay ? "date" : "datetime-local"}
                value={start}
                onChange={(e) => setStart(e.target.value)}
                required
              />
            </div>
            {!allDay && (
              <div>
                <label className="f-label">Fin</label>
                <input
                  className="f-input"
                  type="datetime-local"
                  value={end}
                  onChange={(e) => setEnd(e.target.value)}
                  required
                />
              </div>
            )}
          </div>

          <label className="f-label">Descripción</label>
          <textarea
            className="f-input"
            rows={4}
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
          />

          <div className="modal-actions">
            <div className="spacer" />
            <button type="button" className="btn-ghost" onClick={onClose}>
              Cancelar
            </button>
            <button className="btn-primary">Crear</button>
          </div>
        </form>
      </div>
    </div>
  );
}
