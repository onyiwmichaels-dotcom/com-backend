import pool from "../config/db.js";
import path from "path";

// ==========================================================
// 1. PRODUCT CRUD HANDLERS (ADMIN)
// ==========================================================

// GET products (Admin dashboard – includes ALL statuses)
export const getProducts = async (req, res) => {
  try {
    let query = `SELECT * FROM products ORDER BY created_at DESC`;
    const { rows } = await pool.query(query);
    res.json(rows);
  } catch (err) {
    console.error("❌ Admin Get Products Error:", err.message);
    res.status(500).json({ message: err.message });
  }
};

// POST Add Product (ADMIN UPLOAD – AUTO APPROVED)
export const addProduct = async (req, res) => {
  try {
    const {
      name,
      price,
      description,
      image,
      type,
      category,
      sellerPhone,
      location
    } = req.body;

    if (!name || !price || !image || !sellerPhone) {
      return res.status(400).json({
        message: "Name, price, image URL, and seller phone number are required."
      });
    }

    const query = `
      INSERT INTO products
      (name, price, description, image, type, category, sellerPhone, location, status)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'approved')
      RETURNING id
    `;

    const values = [
      name,
      price,
      description,
      image,
      type,
      category,
      sellerPhone,
      location
    ];

    const { rows } = await pool.query(query, values);

    res.status(201).json({
      message: "Product added and is live!",
      id: rows[0].id
    });
  } catch (err) {
    console.error("❌ Admin Insert Error:", err.message);
    res.status(500).json({ message: err.message });
  }
};

// PUT Update Product
export const updateProduct = async (req, res) => {
  try {
    const id = req.params.id;
    const {
      name,
      price,
      description,
      image,
      type,
      category,
      sellerPhone,
      location
    } = req.body;

    if (!id || !name || !price || !sellerPhone) {
      return res.status(400).json({
        message: "ID, name, price, and seller phone required"
      });
    }

    const query = `
      UPDATE products SET
      name=$1, price=$2, description=$3, image=$4,
      type=$5, category=$6, sellerPhone=$7, location=$8
      WHERE id=$9
    `;

    await pool.query(query, [
      name,
      price,
      description,
      image,
      type,
      category,
      sellerPhone,
      location,
      id
    ]);

    res.json({ message: "Updated" });
  } catch (err) {
    console.error("❌ Admin Update Error:", err.message);
    res.status(500).json({ message: err.message });
  }
};

// DELETE Product
export const deleteProduct = async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) return res.status(400).json({ message: "ID required" });

    await pool.query(`DELETE FROM products WHERE id = $1`, [id]);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ==========================================================
// 2. IMAGE UPLOAD HANDLER (UNCHANGED)
// ==========================================================

export const uploadImage = (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No file uploaded" });
  const filePath = `/uploads/${req.file.filename}`;
  res.json({ filePath });
};

// ==========================================================
// 3. ORDER HANDLERS
// ==========================================================

export const getOrders = async (req, res) => {
  try {
    const query = `
      SELECT o.*, p.name AS productName, p.price AS productPrice
      FROM orders o
      LEFT JOIN products p ON o.productId = p.id
      ORDER BY o.date DESC
    `;
    const { rows } = await pool.query(query);
    res.json(rows);
  } catch (err) {
    console.error("❌ Orders Fetch Error:", err.message);
    res.status(500).json({ message: err.message });
  }
};

// ==========================================================
// 4. ADMIN DASHBOARD STATS
// ==========================================================

export const getAdminStats = async (req, res) => {
  try {
    const totalOrders = await pool.query(
      `SELECT COUNT(id) FROM orders`
    );

    const pendingRequests = await pool.query(
      `SELECT COUNT(id) FROM products WHERE status='pending'`
    );

    const activeInventory = await pool.query(
      `SELECT COUNT(id) FROM products WHERE status='approved'`
    );

    const stats = {
      totalOrders: totalOrders.rows[0].count,
      pendingRequests: pendingRequests.rows[0].count,
      activeInventory: activeInventory.rows[0].count
    };

    console.log("📈 [Admin Stats]", stats);
    res.json(stats);
  } catch (err) {
    console.error("❌ Admin Stats Error:", err.message);
    res.status(500).json({ message: err.message });
  }
};
