import React, { useEffect, useMemo, useRef, useState } from "react";
import { api } from "../api";

const fmtDate = (d) => new Date(d).toLocaleDateString();

export default function LearningPage() {
  const [items, setItems] = useState([]); // {_id, topic, hours, date}
  const [topic, setTopic] = useState("");
  const [hours, setHours] = useState("");

  useEffect(() => {
    api.listLearning().then(setItems);
  }, []);

  const total = useMemo(
    () => items.reduce((a, x) => a + (x.hours || 0), 0),
    [items]
  );

  // cronómetro por tema
  const [running, setRunning] = useState(false);
  const [ticking, setTicking] = useState(0);
  const [currentTopic, setCurrentTopic] = useState("");

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setTicking((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [running]);

  const saveTick = async () => {
    if (ticking <= 0 || !currentTopic) return;
    const h = +(ticking / 3600).toFixed(2);
    const entry = await api.addLearning({
      topic: currentTopic,
      hours: h,
      date: new Date().toISOString(),
    });
    setItems((s) => [entry, ...s]);
    setTicking(0);
    setRunning(false);
    setCurrentTopic("");
  };

  // dibujar curva muy simple
  const canvasRef = useRef(null);
  useEffect(() => {
    const cvs = canvasRef.current;
    if (!cvs) return;
    const ctx = cvs.getContext("2d");
    const W = (cvs.width = cvs.clientWidth),
      H = (cvs.height = cvs.clientHeight);
    ctx.clearRect(0, 0, W, H);
    if (items.length === 0) return;
    const byDay = {};
    items.forEach((i) => {
      const k = new Date(i.date).toISOString().slice(0, 10);
      byDay[k] = (byDay[k] || 0) + i.hours;
    });
    const keys = Object.keys(byDay).sort();
    const max = Math.max(...keys.map((k) => byDay[k]), 1);
    const pad = 24;
    ctx.strokeStyle = "#9c6bff";
    ctx.lineWidth = 3;
    ctx.beginPath();
    keys.forEach((k, i) => {
      const x = pad + (W - 2 * pad) * (i / (keys.length - 1 || 1));
      const y = H - pad - (H - 2 * pad) * (byDay[k] / max);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
    ctx.fillStyle = "#e5d9ff";
    keys.forEach((k, i) => {
      const x = pad + (W - 2 * pad) * (i / (keys.length - 1 || 1));
      const y = H - pad - (H - 2 * pad) * (byDay[k] / max);
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
    });
  }, [items]);

  return (
    <>
      <h1 style={{ margin: "0 0 10px" }}>Aprendizaje</h1>

      <div className="row grid-2">
        <div className="card-bugcit">
          <div className="card-head">Registrar horas</div>
          <div className="card-body">
            <div className="inline">
              <input
                className="input"
                placeholder="Tema / curso..."
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
              <input
                className="input"
                placeholder="Horas (ej: 1.5)"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
              />
              <button
                className="btn brand"
                onClick={async () => {
                  const h = parseFloat(hours);
                  if (!topic.trim() || isNaN(h) || h <= 0) return;
                  const saved = await api.addLearning({
                    topic: topic.trim(),
                    hours: h,
                    date: new Date().toISOString(),
                  });
                  setItems((s) => [saved, ...s]);
                  setTopic("");
                  setHours("");
                }}
              >
                Agregar
              </button>
            </div>

            <div className="mt-16" />
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr auto auto",
                gap: 10,
                alignItems: "center",
              }}
            >
              <select
                className="select"
                value={currentTopic}
                onChange={(e) => setCurrentTopic(e.target.value)}
              >
                <option value="">— Selecciona tema para cronómetro —</option>
                {[...new Set(items.map((i) => i.topic))].map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              <button className="btn" onClick={() => setRunning((r) => !r)}>
                {running ? "Pausar" : "Iniciar"}
              </button>
              <button className="btn" onClick={saveTick}>
                Guardar sesión
              </button>
            </div>

            <div className="mt-12" />
            <div style={{ fontSize: 34, fontWeight: 900 }}>
              {String(Math.floor(ticking / 3600)).padStart(2, "0")}:
              {String(Math.floor((ticking % 3600) / 60)).padStart(2, "0")}:
              {String(ticking % 60).padStart(2, "0")}
            </div>

            <div className="mt-16" />
            <div style={{ opacity: 0.8 }}>
              Horas totales: <strong>{total}</strong>
            </div>

            <div className="mt-16" />
            <div className="list">
              {items.length === 0 && (
                <div style={{ opacity: 0.6 }}>Sin registros</div>
              )}
              {items.map((it) => (
                <div key={it._id} className="item">
                  <div className="item-left">
                    <div style={{ fontWeight: 800 }}>{it.topic}</div>
                    <small>
                      {fmtDate(it.date)} · {it.hours} h
                    </small>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      className="btn ghost"
                      onClick={async () => {
                        const t = prompt("Tema:", it.topic);
                        if (t === null) return;
                        const h = prompt("Horas:", String(it.hours));
                        if (h === null) return;
                        const num = parseFloat(h);
                        if (isNaN(num) || num <= 0) return;
                        // si quieres PUT, puedes crear un endpoint /learning/:id
                        // aquí lo hacemos de forma simple: eliminar + crear
                        await api.delLearning?.(it._id); // si implementas DELETE
                        const saved = await api.addLearning({
                          topic: t,
                          hours: num,
                          date: it.date,
                        });
                        setItems((s) => [
                          saved,
                          ...s.filter((x) => x._id !== it._id),
                        ]);
                      }}
                    >
                      Editar
                    </button>
                    <button
                      className="btn danger"
                      onClick={async () => {
                        await api.delLearning?.(it._id); // hazlo no-op si no existe
                        setItems((s) => s.filter((x) => x._id !== it._id));
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
          <div className="card-head">Curva de aprendizaje</div>
          <div className="card-body">
            <div className="chart">
              <canvas ref={canvasRef} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
