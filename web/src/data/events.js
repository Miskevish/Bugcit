// almacenamiento común en localStorage
const k = {
  events: "bugcit_events",
  tasks: "bugcit_tasks",
  notes: "bugcit_notes",
  learning: "bugcit_learning",
};

const read = (key, def = []) => {
  try {
    const v = JSON.parse(localStorage.getItem(key));
    return Array.isArray(v) ? v : def;
  } catch {
    return def;
  }
};
const write = (key, value) => localStorage.setItem(key, JSON.stringify(value));

export const store = {
  k,
  getEvents: () => read(k.events),
  setEvents: (arr) => write(k.events, arr),

  getTasks: () => read(k.tasks),
  setTasks: (arr) => write(k.tasks, arr),

  getNotes: () => read(k.notes),
  setNotes: (arr) => write(k.notes, arr),

  getLearning: () => read(k.learning),
  setLearning: (arr) => write(k.learning, arr),
};
