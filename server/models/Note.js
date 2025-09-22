import mongoose from "mongoose";
const { Schema } = mongoose;

const noteSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    text: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

export default mongoose.model("Note", noteSchema);
