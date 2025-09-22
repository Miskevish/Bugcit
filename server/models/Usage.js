// server/models/Usage.js
import mongoose from "mongoose";

const UsageSchema = new mongoose.Schema(
  {
    // Identificador del "usuario". Si no tenés auth, usamos la IP.
    key: { type: String, required: true, index: true },
    // Día en formato YYYY-MM-DD
    day: { type: String, required: true, index: true },
    // Cantidad de mensajes enviados al asistente en ese día
    count: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Índice compuesto para upserts rápidos
UsageSchema.index({ key: 1, day: 1 }, { unique: true });

export default mongoose.model("Usage", UsageSchema);
