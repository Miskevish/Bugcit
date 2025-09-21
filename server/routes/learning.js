import { Router } from "express";
import Learning from "../models/Learning.js";
const router = Router();

router.get("/", async (_req, res) =>
  res.json(await Learning.find().sort({ date: -1 }))
);
router.post("/", async (req, res) =>
  res.status(201).json(await Learning.create(req.body))
);
router.delete("/:id", async (req, res) => {
  await Learning.findByIdAndDelete(req.params.id);
  res.sendStatus(204);
});

export default router;
