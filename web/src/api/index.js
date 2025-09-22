const BASE = import.meta.env.VITE_API_URL || "/api";

const j = async (r) => {
  // Soporta respuestas sin cuerpo (204) o con body no-JSON
  if (!r.ok) {
    let msg = `${r.status} ${r.statusText}`;
    try {
      const data = await r.json();
      if (data?.message) msg = data.message;
    } catch {}
    throw new Error(msg);
  }
  try {
    return await r.json();
  } catch {
    return null;
  }
};

export const api = {
  // ===== Notas =====
  listNotes: () => fetch(`${BASE}/notes`, { credentials: "include" }).then(j),
  addNote: (text) =>
    fetch(`${BASE}/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ text }),
    }).then(j),
  editNote: (id, text) =>
    fetch(`${BASE}/notes/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ text }),
    }).then(j),
  delNote: (id) =>
    fetch(`${BASE}/notes/${id}`, {
      method: "DELETE",
      credentials: "include",
    }).then(() => true),

  // ===== Tareas =====
  listTasks: () => fetch(`${BASE}/tasks`, { credentials: "include" }).then(j),
  addTask: (title) =>
    fetch(`${BASE}/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ title }),
    }).then(j),
  updTask: (id, data) =>
    fetch(`${BASE}/tasks/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(data),
    }).then(j),
  delTask: (id) =>
    fetch(`${BASE}/tasks/${id}`, {
      method: "DELETE",
      credentials: "include",
    }).then(() => true),

  // ===== Eventos =====
  listEvents: () => fetch(`${BASE}/events`, { credentials: "include" }).then(j),
  addEvent: (data) =>
    fetch(`${BASE}/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(data),
    }).then(j),
  updEvent: (id, data) =>
    fetch(`${BASE}/events/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(data),
    }).then(j),
  delEvent: (id) =>
    fetch(`${BASE}/events/${id}`, {
      method: "DELETE",
      credentials: "include",
    }).then(() => true),

  // ===== Aprendizaje =====
  listLearning: () =>
    fetch(`${BASE}/learning`, { credentials: "include" }).then(j),
  addLearning: (entry) =>
    fetch(`${BASE}/learning`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(entry),
    }).then(j),
  delLearning: (id) =>
    fetch(`${BASE}/learning/${id}`, {
      method: "DELETE",
      credentials: "include",
    }).then(() => true),
};

export const auth = {
  me: () => fetch(`${BASE}/auth/me`, { credentials: "include" }).then(j),
  login: (payload) =>
    fetch(`${BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    }).then(j),
  register: (payload) =>
    fetch(`${BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    }).then(j),
  logout: () =>
    fetch(`${BASE}/auth/logout`, {
      method: "POST",
      credentials: "include",
    }).then(j),
};
