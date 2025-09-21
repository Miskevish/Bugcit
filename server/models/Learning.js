import mongoose from "mongoose";
const learningSchema = new mongoose.Schema(
  {
    topic: { type: String, default: "Sesión rápida" },
    date: { type: Date, default: Date.now },
    hours: { type: Number, required: true }, // ej: 1.5
  },
  { timestamps: true }
);
export default mongoose.model("Learning", learningSchema);
