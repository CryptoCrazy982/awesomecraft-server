import express from "express";
import {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
} from "../controllers/orderController.js";
import Order from "../models/Order.js"; // ✅ Add this line
import { verifyAdmin } from "../middlewares/auth.js";

const router = express.Router();

// ✅ Public route for order tracking
router.get("/track/:orderNumber", async (req, res) => {
  try {
    const { orderNumber } = req.params;
    const order = await Order.findOne({ orderNumber })
      .populate("templates", "title category price")
      .select("-__v");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json(order);
  } catch (error) {
    console.error("Error fetching order:", error);
    res.status(500).json({ message: "Server error" });
  }
});


// Admin Order Management
router.post("/", verifyAdmin, createOrder);
router.get("/", verifyAdmin, getAllOrders);
router.get("/:id", verifyAdmin, getOrderById);
router.put("/:id", verifyAdmin, updateOrder);
router.delete("/:id", verifyAdmin, deleteOrder);

export default router;
