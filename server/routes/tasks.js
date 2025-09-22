import { Router } from "express";
import Task from "../models/Task.js";

const router = Router();

router.get("/", async (_req, res) =>
  res.json(await Task.find().sort({ createdAt: -1 }))
);
router.post("/", async (req, res) =>
  res.status(201).json(await Task.create({ title: req.body.title }))
);
router.put("/:id", async (req, res) =>
  res.json(await Task.findByIdAndUpdate(req.params.id, req.body, { new: true }))
);
router.delete("/:id", async (req, res) => {
  await Task.findByIdAndDelete(req.params.id);
  res.sendStatus(204);
});

export default router;
