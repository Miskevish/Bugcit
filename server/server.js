import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import assistantRoutes from "./routes/assistant.js";
import { connectMongo } from "./db.js";

import notes from "./routes/notes.js";
import tasks from "./routes/tasks.js";
import events from "./routes/events.js";
import learning from "./routes/learning.js";

dotenv.config();
const app = express();

app.use(express.json());
app.use(cors({ origin: "http://localhost:5173" })); 
app.use(express.json());

await connectMongo();

app.use("/api/assistant", assistantRoutes);
app.get("/health", (_req, res) => res.json({ ok: true }));
app.use("/api/notes", notes);
app.use("/api/tasks", tasks);
app.use("/api/events", events);
app.use("/api/learning", learning);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`API escuchando en puerto ${PORT}`));
