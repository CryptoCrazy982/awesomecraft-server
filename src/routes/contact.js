import express from "express";
import Contact from "../models/Contact.js";
import { verifyAdmin } from "../middlewares/auth.js"; // your JWT middleware

const router = express.Router();

// 🚀 User: Submit new contact form
router.post("/", async (req, res) => {
  try {
    const contact = new Contact(req.body);
    await contact.save();
    res.status(201).json({ message: "Your query has been submitted successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to submit contact form" });
  }
});

// 🔐 Admin: Get all contact queries
router.get("/", verifyAdmin, async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.json(contacts);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch contacts" });
  }
});

// 🔐 Admin: Update status + remark
router.put("/:id", verifyAdmin, async (req, res) => {
  try {
    const { status, remark } = req.body;
    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      { status, remark },
      { new: true }
    );
    res.json({ message: "Contact updated successfully", contact });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update contact" });
  }
});

export default router;
