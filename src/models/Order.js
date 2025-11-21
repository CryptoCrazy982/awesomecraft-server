// src/models/Order.js
import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    // 🧾 Unique order number
    orderNumber: {
      type: String,
      unique: true,
      required: true,
    },

    // 📦 Template(s) purchased
    templates: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Template",
        required: true,
      },
    ],

    // 👤 Customer Information
    customerType: {
      type: String,
      enum: ["Email", "Phone"],
      required: true, // how OTP was sent
    },
    customerEmail: {
      type: String,
      trim: true,
    },
    customerPhone: {
      type: String,
      trim: true,
    },
    whatsappNumber: {
      type: String,
      trim: true,
    },

    // 🏠 Billing Address (for GST / Tax Compliance)
    billingAddress: {
      fullName: { type: String, required: true },
      addressLine1: { type: String, required: true },
      addressLine2: { type: String },
      city: { type: String, required: true },
      state: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true, default: "India" },
      gstNumber: { type: String }, // optional for business buyers
    },

    // 💬 Communication Preferences
    allowMarketing: {
      type: Boolean,
      default: true, // ✅ checkbox ticked by default
    },

    // 💰 Price Details
    totalAmount: { type: Number, required: true },
    discountAmount: { type: Number, default: 0 },
    finalAmount: { type: Number, required: true },

    // 💳 Payment Info
    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Failed", "Refunded"],
      default: "Pending",
    },
    paymentMethod: {
      type: String,
      enum: ["Razorpay", "Paytm", "Cash", "Other"],
      default: "Razorpay",
    },
    transactionId: String,

    // 🚚 Delivery / Customization Info
    deliveryStatus: {
      type: String,
      enum: ["Not Started", "In Progress", "Delivered", "Cancelled"],
      default: "Not Started",
    },
    customizationRequired: {
      type: Boolean,
      default: false,
    },
    deliveryFileUrl: String,

    // 🧠 Admin tracking fields
    status: {
      type: String,
      enum: ["Pending", "Processing", "Completed", "Cancelled"],
      default: "Pending",
    },
    remarks: String,

    // 👥 Customer account reference (if logged in)
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
