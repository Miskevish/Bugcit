import mongoose from "mongoose";
const { Schema } = mongoose;

const taskSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true },
    done: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("Task", taskSchema);
