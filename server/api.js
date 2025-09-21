const API = "http://localhost:4000/api";

export const api = {
  getNotes: () => fetch(`${API}/notes`).then((r) => r.json()),
  addNote: (text) =>
    fetch(`${API}/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    }).then((r) => r.json()),
  editNote: (id, text) =>
    fetch(`${API}/notes/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    }).then((r) => r.json()),
  delNote: (id) => fetch(`${API}/notes/${id}`, { method: "DELETE" }),

  getTasks: () => fetch(`${API}/tasks`).then((r) => r.json()),
  addTask: (title) =>
    fetch(`${API}/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    }).then((r) => r.json()),
  updTask: (id, data) =>
    fetch(`${API}/tasks/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then((r) => r.json()),
  delTask: (id) => fetch(`${API}/tasks/${id}`, { method: "DELETE" }),

  getEvents: () => fetch(`${API}/events`).then((r) => r.json()),
  addEvent: (data) =>
    fetch(`${API}/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then((r) => r.json()),
  updEvent: (id, data) =>
    fetch(`${API}/events/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then((r) => r.json()),
  delEvent: (id) => fetch(`${API}/events/${id}`, { method: "DELETE" }),

  getLearning: () => fetch(`${API}/learning`).then((r) => r.json()),
  addLearning: (entry) =>
    fetch(`${API}/learning`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(entry),
    }).then((r) => r.json()),
  delLearning: (id) => fetch(`${API}/learning/${id}`, { method: "DELETE" }),
};
