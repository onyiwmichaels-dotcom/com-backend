const db = require('../config/database');

const Order = {
  create: (customerName, phone, location, productId, callback) => {
    db.run(
      "INSERT INTO orders (customerName, phone, location, productId) VALUES (?, ?, ?, ?)",
      [customerName, phone, location, productId],
      callback
    );
  },

  getAll: (callback) => {
    db.all("SELECT o.*, p.name as productName, p.price as productPrice, o.created_at FROM orders o LEFT JOIN products p ON o.productId = p.id ORDER BY o.created_at DESC", [], callback);
  }
};

module.exports = Order;
