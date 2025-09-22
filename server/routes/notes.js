import { Router } from "express";
import Note from "../models/Note.js";
import auth from "../middleware/auth.js";

const router = Router();
router.use(auth);

// GET /api/notes
router.get("/", async (req, res) => {
  const items = await Note.find({ user: req.user.id }).sort({ createdAt: -1 });
  res.json(items);
});

// POST /api/notes
router.post("/", async (req, res) => {
  const { text } = req.body || {};
  if (!text?.trim()) return res.status(400).json({ error: "Text required" });
  const item = await Note.create({ user: req.user.id, text: text.trim() });
  res.status(201).json(item);
});

// PUT /api/notes/:id
router.put("/:id", async (req, res) => {
  const { text } = req.body || {};
  const item = await Note.findOneAndUpdate(
    { _id: req.params.id, user: req.user.id },
    { $set: { text } },
    { new: true }
  );
  if (!item) return res.status(404).json({ error: "Not found" });
  res.json(item);
});

// DELETE /api/notes/:id
router.delete("/:id", async (req, res) => {
  const ok = await Note.findOneAndDelete({
    _id: req.params.id,
    user: req.user.id,
  });
  if (!ok) return res.status(404).json({ error: "Not found" });
  res.json({ ok: true });
});

export default router;
