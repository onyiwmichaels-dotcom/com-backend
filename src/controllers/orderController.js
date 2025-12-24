const Order = require('../models/orderModel');

const createOrder = (req, res) => {
  const { customerName, phone, productId, location } = req.body;
  if (!customerName || !phone || !productId || !location) {
    return res.status(400).json({ error: "All fields are required" });
  }

  Order.create(customerName, phone, location, productId, (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Order placed successfully" });
  });
};

const getOrders = (req, res) => {
  Order.getAll((err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
};

module.exports = {
  createOrder,
  getOrders
};
