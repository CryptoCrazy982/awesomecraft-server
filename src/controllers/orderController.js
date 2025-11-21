import Order from "../models/Order.js";

// 🧾 Generate unique order number
const generateOrderNumber = () => {
  return `ORD-${Date.now().toString().slice(-6)}-${Math.floor(
    Math.random() * 1000
  )}`;
};

// ✅ CREATE Order (Admin or Checkout)
export const createOrder = async (req, res) => {
  try {
    const {
      templates,
      customerType,
      customerEmail,
      customerPhone,
      whatsappNumber,
      billingAddress,
      allowMarketing,
      totalAmount,
      discountAmount,
      finalAmount,
      paymentMethod,
      paymentStatus,
      transactionId,
      customizationRequired,
      deliveryStatus,
      status,
      remarks,
      userId,
    } = req.body;

    // 🔍 Basic validation
    if (!templates || templates.length === 0)
      return res.status(400).json({ message: "At least one template is required" });

    if (!billingAddress || !billingAddress.fullName)
      return res.status(400).json({ message: "Billing address is required" });

    if (!customerType)
      return res.status(400).json({ message: "Customer type is required" });

    if (customerType === "Email" && !customerEmail)
      return res.status(400).json({ message: "Email is required for Email login" });

    if (customerType === "Phone" && !customerPhone)
      return res.status(400).json({ message: "Phone is required for Phone login" });

    if (!totalAmount || !finalAmount)
      return res.status(400).json({ message: "Total and final amounts are required" });

    // 🧾 Create Order
    const newOrder = new Order({
      orderNumber: generateOrderNumber(),
      templates,
      customerType,
      customerEmail,
      customerPhone,
      whatsappNumber,
      billingAddress,
      allowMarketing: allowMarketing !== false, // default true
      totalAmount,
      discountAmount: discountAmount || 0,
      finalAmount,
      paymentMethod: paymentMethod || "Razorpay",
      paymentStatus: paymentStatus || "Pending",
      transactionId,
      customizationRequired: customizationRequired || false,
      deliveryStatus: deliveryStatus || "Not Started",
      status: status || "Pending",
      remarks,
      userId,
    });

    await newOrder.save();

    // 🧩 Populate templates for better admin display
    const populatedOrder = await newOrder.populate("templates", "title previewImage price");

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      order: populatedOrder,
    });
  } catch (err) {
    console.error("❌ Order creation failed:", err);
    res.status(500).json({ message: "Server error creating order" });
  }
};

// ✅ GET All Orders (with optional filters)
export const getAllOrders = async (req, res) => {
  try {
    const { status, paymentStatus, deliveryStatus, search } = req.query;

    const filter = {};

    if (status) filter.status = new RegExp(`^${status}$`, "i");
    if (paymentStatus) filter.paymentStatus = new RegExp(`^${paymentStatus}$`, "i");
    if (deliveryStatus) filter.deliveryStatus = new RegExp(`^${deliveryStatus}$`, "i");

    if (search && search.trim() !== "") {
      const searchRegex = new RegExp(search.trim(), "i");
      filter.$or = [
        { orderNumber: searchRegex },
        { customerEmail: searchRegex },
        { customerPhone: searchRegex },
        { "billingAddress.fullName": searchRegex },
      ];
    }

    const orders = await Order.find(filter)
      .populate("templates", "title previewImage price")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    console.error("❌ Error fetching orders:", err);
    res.status(500).json({ message: "Server error fetching orders" });
  }
};

// ✅ GET Single Order
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      "templates",
      "title previewImage price"
    );
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  } catch (err) {
    console.error("❌ Error fetching order:", err.message);
    res.status(500).json({ message: "Server error fetching order" });
  }
};

// ✅ UPDATE Order (Admin edit or status change)
export const updateOrder = async (req, res) => {
  try {
    const updateData = req.body;

    // 🧠 Protect orderNumber uniqueness
    if (updateData.orderNumber) delete updateData.orderNumber;

    const updatedOrder = await Order.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    }).populate("templates", "title previewImage price");

    if (!updatedOrder)
      return res.status(404).json({ message: "Order not found" });

    res.json({
      success: true,
      message: "Order updated successfully",
      order: updatedOrder,
    });
  } catch (err) {
    console.error("❌ Error updating order:", err.message);
    res.status(500).json({ message: "Server error updating order" });
  }
};

// ✅ DELETE Order
export const deleteOrder = async (req, res) => {
  try {
    const deleted = await Order.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Order not found" });
    res.json({ success: true, message: "Order deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting order:", err.message);
    res.status(500).json({ message: "Server error deleting order" });
  }
};
