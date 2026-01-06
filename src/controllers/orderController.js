import pool from "../config/db.js";
import { sendTelegramMessage } from "../utils/telegram.js";

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

    // 1️⃣ Save order in database
    const query = `
      INSERT INTO orders
      (customerName, phone, location, productId)
      VALUES ($1, $2, $3, $4)
      RETURNING id
    `;

    const { rows } = await pool.query(query, [
      customerName,
      phone,
      location,
      productId
    ]);

    const orderId = rows[0].id;

    // 2️⃣ Fetch product details for Telegram message
    const productQuery = `
      SELECT name, price
      FROM products
      WHERE id = $1
    `;

    const productResult = await pool.query(productQuery, [productId]);
    const product = productResult.rows[0];

    // 3️⃣ Send Telegram notification (AFTER DB SUCCESS)
    const message = `
🛒 *NEW ORDER RECEIVED*

🆔 Order ID: ${orderId}
📦 Product: ${product?.name || "Unknown"}
💰 Price: KES ${product?.price || "N/A"}

👤 Customer: ${customerName}
📞 Phone: ${phone}
📍 Location: ${location}

🕒 Time: ${new Date().toLocaleString()}
    `;

    await sendTelegramMessage(message);

    // 4️⃣ Respond to client
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
      SELECT
        o.id,
        o.customername AS "customerName",
        o.phone,
        o.location,
        o.created_at AS "date",
        p.name AS "productName",
        p.price AS "productPrice"
      FROM orders o
      LEFT JOIN products p ON o.productid = p.id
      ORDER BY o.created_at DESC
    `;

    const { rows } = await pool.query(query);

    console.log("📦 ADMIN ORDERS API RESPONSE:", rows);

    res.json(rows);
  } catch (err) {
    console.error("❌ Get Orders Error:", err.message);
    res.status(500).json({ error: err.message });
  }
};

