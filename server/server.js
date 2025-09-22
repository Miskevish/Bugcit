import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

import assistantRoutes from "./routes/assistant.js";
import notes from "./routes/notes.js";
import tasks from "./routes/tasks.js";
import events from "./routes/events.js";
import learning from "./routes/learning.js";
import auth from "./routes/auth.js";

import { connectMongo } from "./db.js";

dotenv.config();

const app = express();

// Middlewares base
app.use(express.json());

// CORS con credenciales (cookies) y origen desde .env
app.use(
  cors({
    origin:
      process.env.CLIENT_ORIGIN ||
      process.env.ORIGIN ||
      "http://localhost:5173",
    credentials: true,
  })
);

// Cookies
app.use(cookieParser());

// DB
await connectMongo();

// Rutas
app.use("/api/assistant", assistantRoutes);
app.use("/api/notes", notes);
app.use("/api/tasks", tasks);
app.use("/api/events", events);
app.use("/api/learning", learning);
app.use("/api/auth", auth);

// Healthcheck
app.get("/health", (_req, res) => res.json({ ok: true }));

// Server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`API escuchando en puerto ${PORT}`));
