import mongoose from "mongoose";
const { Schema } = mongoose;

const eventSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: { type: String, required: true },
    start: { type: Date, required: true },
    end: { type: Date },
    allDay: { type: Boolean, default: false },
    className: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("Event", eventSchema);
