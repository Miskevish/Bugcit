import { Router } from "express";
import Event from "../models/Event.js";
import auth from "../middleware/auth.js";

const router = Router();
router.use(auth);

router.get("/", async (req, res) => {
  const items = await Event.find({ user: req.user.id }).sort({ start: 1 });
  res.json(items);
});

router.post("/", async (req, res) => {
  const payload = req.body || {};
  if (!payload.title || !payload.start) {
    return res.status(400).json({ error: "title and start are required" });
  }
  const item = await Event.create({ ...payload, user: req.user.id });
  res.status(201).json(item);
});

router.put("/:id", async (req, res) => {
  const item = await Event.findOneAndUpdate(
    { _id: req.params.id, user: req.user.id },
    { $set: req.body || {} },
    { new: true }
  );
  if (!item) return res.status(404).json({ error: "Not found" });
  res.json(item);
});

router.delete("/:id", async (req, res) => {
  const ok = await Event.findOneAndDelete({
    _id: req.params.id,
    user: req.user.id,
  });
  if (!ok) return res.status(404).json({ error: "Not found" });
  res.json({ ok: true });
});

export default router;
