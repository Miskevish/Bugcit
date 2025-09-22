// server/routes/assistant.js
import { Router } from "express";
import Task from "../models/Task.js";
import Event from "../models/Event.js";
import Note from "../models/Note.js";
import Usage from "../models/Usage.js";
import { chatBurstLimiter } from "../util.js";

const router = Router();

/* ================= Helpers ================= */

function cleanTitle(s) {
  return String(s || "")
    .trim()
    .replace(/\s+/g, " ")
    .slice(0, 140);
}

// normaliza fechas dd/mm/yyyy o yyyy-mm-dd → ISO (YYYY-MM-DD)
function parseDateLike(s) {
  if (!s) return null;
  const t = String(s).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(t)) return t; // yyyy-mm-dd
  const m = t.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/); // dd/mm/yyyy
  if (m) {
    const dd = String(m[1]).padStart(2, "0");
    const mm = String(m[2]).padStart(2, "0");
    const yyyy = m[3];
    return `${yyyy}-${mm}-${dd}`;
  }
  return null;
}

function todayKey() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

/* =============== Fallback por reglas (gratis) =============== */

async function replyWithRules(userText, counters) {
  const t = String(userText || "").toLowerCase();

  const help =
    "Puedo decirte cuántas tareas, eventos o notas tenés y crear nuevas.\n" +
    "• Crear tarea: `crear tarea: <título>`\n" +
    "• Crear evento: `crear evento: <título> @YYYY-MM-DD` o `@dd/mm/yyyy`\n" +
    "• Crear nota: `crear nota: <texto>`\n" +
    "• Consultar: “¿cuántas tareas/eventos/notas tengo?”";

  if (t.includes("ayuda") || t.includes("cómo") || t.includes("como")) {
    return { reply: help, actions: [] };
  }

  if (t.includes("cuantas tareas") || t.includes("cuántas tareas")) {
    const n = counters.tasks;
    return {
      reply:
        n === 0
          ? "No tenés tareas. 🎉"
          : `Tenés ${n} ${n === 1 ? "tarea" : "tareas"}.`,
      actions: [],
    };
  }
  if (t.includes("cuantos eventos") || t.includes("cuántos eventos")) {
    const n = counters.events;
    return {
      reply:
        n === 0
          ? "No tenés eventos."
          : `Tenés ${n} ${n === 1 ? "evento" : "eventos"}.`,
      actions: [],
    };
  }
  if (t.includes("cuantas notas") || t.includes("cuántas notas")) {
    const n = counters.notes;
    return {
      reply:
        n === 0
          ? "No tenés notas."
          : `Tenés ${n} ${n === 1 ? "nota" : "notas"}.`,
      actions: [],
    };
  }

  return {
    reply:
      (counters.tasks
        ? `Tenés ${counters.tasks} ${
            counters.tasks === 1 ? "tarea" : "tareas"
          }. `
        : "No tenés tareas. ") +
      "Probá: `crear tarea: <título>`, `crear evento: <título> @YYYY-MM-DD` o `crear nota: <texto>`.",
    actions: [],
  };
}

/* =============== IA con Groq (opcional) =============== */

async function replyWithGroq(userText, counters) {
  const apiKey = process.env.GROQ_API_KEY;
  const model = process.env.AI_MODEL || "llama-3.1-8b-instant";
  if (!apiKey) return replyWithRules(userText, counters);

  const system = `
Eres BUGCIT, un asistente breve y útil (en español).
No creas nada por tu cuenta; si el usuario quiere crear, sugiere exactamente uno de estos comandos:
- "crear tarea: <título>"
- "crear evento: <título> @YYYY-MM-DD"
- "crear nota: <texto>"
Si pregunta "¿cuántas ... tengo?" contesta:
- tareas: ${counters.tasks}, eventos: ${counters.events}, notas: ${counters.notes}.
Respuestas cortas. Evita divagar.`;

  const body = {
    model,
    temperature: 0.4,
    messages: [
      { role: "system", content: system },
      { role: "user", content: String(userText || "") },
    ],
  };

  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const errTxt = await res.text();
      console.error("Groq error:", errTxt);
      return replyWithRules(userText, counters);
    }
    const data = await res.json();
    const assistantMsg =
      data?.choices?.[0]?.message?.content?.trim() ||
      "No estoy seguro. ¿Podés reformularlo?";
    return { reply: assistantMsg, actions: [] };
  } catch (e) {
    console.error("Groq exception:", e);
    return replyWithRules(userText, counters);
  }
}

/* =============== Cupo diario =============== */

async function checkAndIncDailyQuota(req) {
  const limit = Math.max(parseInt(process.env.DAILY_CHAT_LIMIT || "50", 10), 1);
  const key = req.user?.id ? `u:${req.user.id}` : `ip:${req.ip || "unknown"}`;
  const day = todayKey();

  const doc = await Usage.findOneAndUpdate(
    { key, day },
    { $inc: { count: 1 } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  ).lean();

  const remaining = Math.max(limit - doc.count, 0);
  return { allowed: doc.count <= limit, remaining, limit };
}

/* =============== Ruta principal =============== */

router.post("/chat", chatBurstLimiter, async (req, res) => {
  try {
    const { message } = req.body || {};
    const userText = String(message || "").trim();
    if (!userText) return res.status(400).json({ error: "message requerido." });

    // Límite diario
    const quota = await checkAndIncDailyQuota(req);
    if (!quota.allowed) {
      return res.json({
        reply:
          "Llegaste al límite diario gratuito 😿. Probá de nuevo mañana.\n" +
          "Comandos offline: `crear tarea: <título>`, `crear evento: <título> @YYYY-MM-DD`, `crear nota: <texto>`",
        actions: [],
        limitInfo: quota,
      });
    }

    // Contadores actuales (para IA y mensajes)
    const [tasksCount, eventsCount, notesCount] = await Promise.all([
      Task.countDocuments({ done: { $ne: true } }),
      Event.countDocuments({}),
      Note.countDocuments({}),
    ]);
    const counters = {
      tasks: tasksCount,
      events: eventsCount,
      notes: notesCount,
    };

    /* ===== COMANDOS que CREAN de verdad ===== */

    // crear tarea
    let m = userText.match(/^crear\s+tarea\s*:?\s+(.+)$/i);
    if (m) {
      const title = cleanTitle(m[1]);
      if (!title) {
        return res.json({
          reply: "Formato: `crear tarea: <título>`.",
          actions: [],
        });
      }
      const saved = await Task.create({ title, done: false });
      return res.json({
        reply: `¡Listo! Creé la tarea: “${saved.title}”. ✅`,
        actions: [
          { type: "create_task", payload: { title: saved.title } },
          { type: "refresh" },
        ],
      });
    }

    // crear evento (tu schema requiere 'start')
    m = userText.match(/^crear\s+evento\s*:?\s+(.+?)\s*@\s*([^\s]+)$/i);
    if (m) {
      const title = cleanTitle(m[1]);
      const whenRaw = m[2];
      const dateISO = parseDateLike(whenRaw);
      if (!title || !dateISO) {
        return res.json({
          reply:
            "Formato: `crear evento: <título> @YYYY-MM-DD` o `@dd/mm/yyyy`.",
          actions: [],
        });
      }

      // Rango por defecto 09:00–10:00 (ajustá si querés)
      const start = `${dateISO}T09:00:00`;
      const end = `${dateISO}T10:00:00`;

      const saved = await Event.create({
        title,
        start,
        end,
        allDay: true, // quitá esta línea si tu schema no lo tiene
      });

      return res.json({
        reply: `¡Hecho! Creé el evento “${saved.title}” para ${dateISO}. 📅`,
        actions: [
          {
            type: "create_event",
            payload: { title: saved.title, date: dateISO, start, end },
          },
          { type: "refresh" },
        ],
      });
    }

    // crear nota
    m = userText.match(/^crear\s+nota\s*:?\s+(.+)$/i);
    if (m) {
      const text = cleanTitle(m[1]);
      if (!text) {
        return res.json({
          reply: "Formato: `crear nota: <texto>`.",
          actions: [],
        });
      }
      const saved = await Note.create({ text, date: new Date().toISOString() });
      return res.json({
        reply: `Nota guardada: “${saved.text}”. 🗒️`,
        actions: [
          { type: "create_note", payload: { text: saved.text } },
          { type: "refresh" },
        ],
      });
    }

    /* ===== Sin comandos → IA o reglas ===== */
    const { reply, actions = [] } = await replyWithGroq(userText, counters);
    return res.json({ reply, actions });
  } catch (err) {
    console.error("Assistant error:", err);
    return res
      .status(500)
      .json({ error: "Error en el asistente. Intenta de nuevo." });
  }
});

export default router;
