import mongoose from "mongoose";
const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    start: { type: Date, required: true },
    end: { type: Date },
    allDay: { type: Boolean, default: false },
    className: { type: String },
  },
  { timestamps: true }
);
export default mongoose.model("Event", eventSchema);
