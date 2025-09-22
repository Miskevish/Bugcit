import mongoose from "mongoose";
const { Schema } = mongoose;

const learningSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: { type: String, default: "Sesión rápida" },
    minutes: { type: Number, default: 0 },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model("Learning", learningSchema);
