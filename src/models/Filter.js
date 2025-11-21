import mongoose from "mongoose";

const filterSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    key: { type: String, required: true, unique: true }, // e.g. style_tags, color_tags
    type: {
      type: String,
      enum: ["checkbox", "color", "button", "radio", "dropdown", "toggle"],
      required: true,
    },
    options: [
      {
        label: String, // Display name
        value: String, // Used for template assignment
        color: String, // Optional (for color swatches)
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Filter", filterSchema);
