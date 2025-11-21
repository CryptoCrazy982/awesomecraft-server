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

const app = express();

// ✅ FIXED CORS FOR PRODUCTION & LOCAL
app.use(
  cors({
    origin: [
      "http://localhost:5173",                      // Local client (Vite)
      "https://awesomecraft-client.vercel.app"      // Your deployed frontend
    ],
    credentials: true,
  })
);

// Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Upload route must come before other routes
app.use("/api/upload", uploadRoutes);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/templates", templateRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/banners", bannerRoutes);
app.use("/api/public/templates", publicTemplateRoutes);
app.use("/api/contact", contactRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("AwesomeCrafts API is running 🚀");
});

export default app;
