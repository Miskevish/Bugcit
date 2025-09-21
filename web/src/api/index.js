const BASE = import.meta.env.VITE_API_URL || "/api";

const j = (r) => {
  if (!r.ok) throw new Error(`${r.status} ${r.statusText}`);
  return r.json?.() ?? null;
};

export const api = {
  // ===== Notas =====
  listNotes: () => fetch(`${BASE}/notes`).then(j),
  addNote: (text) =>
    fetch(`${BASE}/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    }).then(j),
  editNote: (id, text) =>
    fetch(`${BASE}/notes/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    }).then(j),
  delNote: (id) =>
    fetch(`${BASE}/notes/${id}`, { method: "DELETE" }).then(() => true),

  // ===== Tareas =====
  listTasks: () => fetch(`${BASE}/tasks`).then(j),
  addTask: (title) =>
    fetch(`${BASE}/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    }).then(j),
  updTask: (id, data) =>
    fetch(`${BASE}/tasks/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then(j),
  delTask: (id) =>
    fetch(`${BASE}/tasks/${id}`, { method: "DELETE" }).then(() => true),

  // ===== Eventos =====
  listEvents: () => fetch(`${BASE}/events`).then(j),
  addEvent: (data) =>
    fetch(`${BASE}/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then(j),
  updEvent: (id, data) =>
    fetch(`${BASE}/events/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then(j),
  delEvent: (id) =>
    fetch(`${BASE}/events/${id}`, { method: "DELETE" }).then(() => true),

  // ===== Aprendizaje =====
  listLearning: () => fetch(`${BASE}/learning`).then(j),
  addLearning: (entry) =>
    fetch(`${BASE}/learning`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(entry),
    }).then(j),
  delLearning: (id) =>
    fetch(`${BASE}/learning/${id}`, { method: "DELETE" }).then(() => true),
};
