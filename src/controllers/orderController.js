import pool from "../config/db.js";

// ==========================================================
// CREATE ORDER
// ==========================================================

export const createOrder = async (req, res) => {
  try {
    const { customerName, phone, productId, location } = req.body;

    if (!customerName || !phone || !productId || !location) {
      return res.status(400).json({
        error: "All fields are required"
      });
    }

    const query = `
      INSERT INTO orders
      (customerName, phone, location, productId)
      VALUES ($1, $2, $3, $4)
    `;

    await pool.query(query, [
      customerName,
      phone,
      location,
      productId
    ]);

    res.json({ message: "Order placed successfully" });
  } catch (err) {
    console.error("❌ Create Order Error:", err.message);
    res.status(500).json({ error: err.message });
  }
};

// ==========================================================
// GET ALL ORDERS
// ==========================================================

export const getOrders = async (req, res) => {
  try {
    const query = `
      SELECT *
      FROM orders
      ORDER BY date DESC
    `;
    const { rows } = await pool.query(query);
    console.log(rows);

    res.json(rows);
  } catch (err) {
    console.error("❌ Get Orders Error:", err.message);
    res.status(500).json({ error: err.message });
  }
};
