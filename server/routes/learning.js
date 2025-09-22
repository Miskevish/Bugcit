import { Router } from "express";
import Learning from "../models/Learning.js";
import auth from "../middleware/auth.js";

const router = Router();
router.use(auth);

router.get("/", async (req, res) => {
  const items = await Learning.find({ user: req.user.id }).sort({ date: -1 });
  res.json(items);
});

router.post("/", async (req, res) => {
  const { title, minutes } = req.body || {};
  const item = await Learning.create({
    user: req.user.id,
    title: title || "Sesión rápida",
    minutes: Number(minutes) || 0,
  });
  res.status(201).json(item);
});

router.delete("/:id", async (req, res) => {
  const ok = await Learning.findOneAndDelete({
    _id: req.params.id,
    user: req.user.id,
  });
  if (!ok) return res.status(404).json({ error: "Not found" });
  res.json({ ok: true });
});

export default router;
