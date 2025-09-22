import { Router } from "express";
import Task from "../models/Task.js";
import auth from "../middleware/auth.js";

const router = Router();
router.use(auth);

router.get("/", async (req, res) => {
  const items = await Task.find({ user: req.user.id }).sort({ createdAt: -1 });
  res.json(items);
});

router.post("/", async (req, res) => {
  const { title } = req.body || {};
  if (!title?.trim()) return res.status(400).json({ error: "Title required" });
  const item = await Task.create({ user: req.user.id, title: title.trim() });
  res.status(201).json(item);
});

router.put("/:id", async (req, res) => {
  const { title, done } = req.body || {};
  const item = await Task.findOneAndUpdate(
    { _id: req.params.id, user: req.user.id },
    {
      $set: {
        ...(title !== undefined ? { title } : {}),
        ...(done !== undefined ? { done } : {}),
      },
    },
    { new: true }
  );
  if (!item) return res.status(404).json({ error: "Not found" });
  res.json(item);
});

router.delete("/:id", async (req, res) => {
  const ok = await Task.findOneAndDelete({
    _id: req.params.id,
    user: req.user.id,
  });
  if (!ok) return res.status(404).json({ error: "Not found" });
  res.json({ ok: true });
});

export default router;
