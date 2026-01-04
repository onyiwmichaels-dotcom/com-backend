import pool from "../config/db.js";
import { supabase } from "../config/supabase.js";
import crypto from "crypto";


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
      image, // base64 string
      type,
      category,
      sellerPhone,
      location
    } = req.body;

    if (!name || !price || !image || !sellerPhone) {
      return res.status(400).json({
        message: "Name, price, image, and seller phone are required."
      });
    }

    /* -------- SUPABASE IMAGE UPLOAD -------- */

    const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");

    const fileName = `admin-${crypto.randomUUID()}.jpg`;

    const { error: uploadError } = await supabase.storage
      .from("product-images")
      .upload(fileName, buffer, {
        contentType: "image/jpeg",
        upsert: false
      });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from("product-images")
      .getPublicUrl(fileName);

    const imageUrl = data.publicUrl;

    /* -------- DATABASE INSERT -------- */

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
      imageUrl,
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
    console.error("❌ Admin Supabase Upload Error:", err.message);
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


// DELETE Product + Supabase Image
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ message: "Product ID required" });
    }

    // 1️⃣ Fetch image URL
    const result = await pool.query(
      `SELECT image FROM products WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    const imageUrl = result.rows[0].image;

    // 2️⃣ Extract Supabase file path
    const filePath = imageUrl?.split("/product-images/")[1];

    // 3️⃣ Delete image from Supabase
    if (filePath) {
      const { error: storageError } = await supabase.storage
        .from("product-images")
        .remove([filePath]);

      if (storageError) {
        console.error("❌ Supabase Image Delete Error:", storageError.message);
        return res.status(500).json({
          message: "Failed to delete product image"
        });
      }
    }

    // 4️⃣ Delete product record
    await pool.query(`DELETE FROM products WHERE id = $1`, [id]);

    res.json({ message: "Product and image deleted successfully" });

  } catch (err) {
    console.error("❌ Delete Product Error:", err.message);
    res.status(500).json({ message: err.message });
  }
};


// ==========================================================
// 2. IMAGE UPLOAD HANDLER (UNCHANGED)
// ==========================================================



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
