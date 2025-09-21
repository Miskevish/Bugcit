import { Router } from "express";
import Event from "../models/Event.js";
const router = Router();

router.get("/", async (_req, res) =>
  res.json(await Event.find().sort({ start: 1 }))
);
router.post("/", async (req, res) =>
  res.status(201).json(await Event.create(req.body))
);
router.put("/:id", async (req, res) =>
  res.json(
    await Event.findByIdAndUpdate(req.params.id, req.body, { new: true })
  )
);
router.delete("/:id", async (req, res) => {
  await Event.findByIdAndDelete(req.params.id);
  res.sendStatus(204);
});

export default router;
