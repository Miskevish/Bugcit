import { Router } from "express";
import Note from "../models/Note.js";
const router = Router();

router.get("/", async (_req, res) =>
  res.json(await Note.find().sort({ createdAt: -1 }))
);
router.post("/", async (req, res) =>
  res.status(201).json(await Note.create({ text: req.body.text }))
);
router.put("/:id", async (req, res) =>
  res.json(
    await Note.findByIdAndUpdate(
      req.params.id,
      { text: req.body.text },
      { new: true }
    )
  )
);
router.delete("/:id", async (req, res) => {
  await Note.findByIdAndDelete(req.params.id);
  res.sendStatus(204);
});

export default router;
