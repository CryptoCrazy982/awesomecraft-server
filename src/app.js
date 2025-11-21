// src/app.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";

// Import routes
import authRoutes from "./routes/authRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import templateRoutes from "./routes/templateRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import bannerRoutes from "./routes/bannerRoutes.js";
import publicTemplateRoutes from "./routes/publicTemplateRoutes.js";
import contactRoutes from "./routes/contact.js";

dotenv.config();
connectDB();

const app = express(); // ✅ must come before any app.use()

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/upload", uploadRoutes);

// ✅ All routes after defining app
app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/templates", templateRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/banners", bannerRoutes);
app.use("/api/public/templates", publicTemplateRoutes);
app.use("/api/contact", contactRoutes);

app.get("/", (req, res) => {
  res.send("AwesomeCrafts API is running 🚀");
});

export default app;
