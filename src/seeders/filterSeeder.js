import mongoose from "mongoose";
import dotenv from "dotenv";
import Filter from "../models/Filter.js";
dotenv.config();

mongoose.connect(process.env.MONGO_URI);

const filters = [
  {
    name: "Style / Design",
    key: "style_tags",
    type: "checkbox",
    options: [
      { label: "Minimal", value: "minimal" },
      { label: "Traditional", value: "traditional" },
      { label: "Modern", value: "modern" },
      { label: "Luxury / Royal", value: "luxury" },
      { label: "Floral", value: "floral" },
      { label: "Cartoon / Kids", value: "cartoon" },
      { label: "Elegant / Classic", value: "elegant" },
      { label: "Photo-Based", value: "photo_based" },
      { label: "Animated", value: "animated" },
      { label: "Typography", value: "typography" },
    ],
  },
  {
    name: "Color",
    key: "color_tags",
    type: "color",
    options: [
      { label: "Red", value: "red", color: "#FF0000" },
      { label: "Blue", value: "blue", color: "#0000FF" },
      { label: "Gold", value: "gold", color: "#FFD700" },
      { label: "Green", value: "green", color: "#008000" },
      { label: "Pink", value: "pink", color: "#FFC0CB" },
      { label: "White", value: "white", color: "#FFFFFF" },
      { label: "Black", value: "black", color: "#000000" },
      { label: "Purple", value: "purple", color: "#800080" },
      { label: "Beige", value: "beige", color: "#F5F5DC" },
      { label: "Multicolor", value: "multicolor", color: "#FF69B4" },
    ],
  },
  {
    name: "Orientation",
    key: "orientation",
    type: "button",
    options: [
      { label: "Portrait", value: "portrait" },
      { label: "Landscape", value: "landscape" },
      { label: "Square", value: "square" },
      { label: "Vertical Video", value: "vertical_video" },
      { label: "Horizontal Video", value: "horizontal_video" },
    ],
  },
  {
    name: "Template Type",
    key: "type",
    type: "checkbox",
    options: [
      { label: "Digital", value: "digital" },
      { label: "Printable", value: "printable" },
      { label: "Video", value: "video" },
      { label: "E-Card (Interactive)", value: "ecard" },
      { label: "Invitation Animation", value: "animation" },
    ],
  },
  {
    name: "Customization Level",
    key: "editable_level",
    type: "radio",
    options: [
      { label: "Basic", value: "basic" },
      { label: "Advanced", value: "advanced" },
      { label: "Fully Customizable", value: "full" },
      { label: "Text Only Editable", value: "text_only" },
    ],
  },
  {
    name: "Language",
    key: "language",
    type: "dropdown",
    options: [
      { label: "English", value: "english" },
      { label: "Hindi", value: "hindi" },
      { label: "Marathi", value: "marathi" },
      { label: "Tamil", value: "tamil" },
      { label: "Punjabi", value: "punjabi" },
      { label: "Gujarati", value: "gujarati" },
      { label: "Telugu", value: "telugu" },
      { label: "Malayalam", value: "malayalam" },
      { label: "Urdu", value: "urdu" },
      { label: "Bengali", value: "bengali" },
    ],
  },
  {
    name: "Availability",
    key: "status",
    type: "toggle",
    options: [
      { label: "Active", value: "active" },
      { label: "Inactive", value: "inactive" },
      { label: "Coming Soon", value: "coming_soon" },
      { label: "Out of Stock", value: "out_of_stock" },
    ],
  },
];

const seedFilters = async () => {
  try {
    await Filter.deleteMany();
    await Filter.insertMany(filters);
    console.log("✅ Filters seeded successfully with extended options");
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedFilters();
