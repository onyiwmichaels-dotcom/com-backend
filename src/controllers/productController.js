import pool from "../config/db.js";
import {supabase} from "../config/supabase.js"; 
import crypto from "crypto";
/**
 * GET /api/products
 * Public shop listing with filters
 */
export const listProducts = async (req, res) => {
  try {
    const { type, category, search, status } = req.query;

    let query = `SELECT * FROM products WHERE 1=1`;
    const values = [];

    if (status) {
      values.push(status);
      query += ` AND status = $${values.length}`;
    } else {
      values.push("approved");
      query += ` AND status = $${values.length}`;
    }

    if (type) {
      values.push(type);
      query += ` AND type = $${values.length}`;
    }

    if (category) {
      values.push(category);
      query += ` AND category = $${values.length}`;
    }

    if (search) {
      values.push(`%${search}%`);
      query += ` AND name ILIKE $${values.length}`;
    }

    query += ` ORDER BY created_at DESC`;

    const { rows } = await pool.query(query, values);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * POST /api/products
 * Submit new product
 */

export const submitProduct = async (req, res) => {
  try {
    console.log("📸 IMAGE TYPE:", typeof req.body.image);
console.log("📸 IMAGE PREVIEW:", req.body.image?.substring(0, 50));

    const {
      name,
      price,
      description,
      image, // base64 string
      type,
      category,
      sellerPhone,
      isAdmin
    } = req.body;

    if (!name || !price || !image) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    /* ---------------- IMAGE UPLOAD ---------------- */

    // Convert base64 → buffer
    const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");

    // Generate unique filename
    const fileName = `${crypto.randomUUID()}.jpg`;

    const { error: uploadError } = await supabase.storage
      .from("product-images")
      .upload(fileName, buffer, {
        contentType: "image/jpeg",
        upsert: false
      });

    if (uploadError) {
      throw uploadError;
    }

    // Get public URL
    const { data: publicData } = supabase.storage
      .from("product-images")
      .getPublicUrl(fileName);

    const imageUrl = publicData.publicUrl;

    /* ---------------- DATABASE ---------------- */

    const status = isAdmin ? "approved" : "pending";

    const query = `
      INSERT INTO products
      (name, price, description, image, type, category, sellerPhone, status)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
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
      status
    ];

    const { rows } = await pool.query(query, values);

    res.status(201).json({
      message: isAdmin ? "Product live!" : "Submitted for approval",
      id: rows[0].id
    });

  } catch (err) {
    console.error("❌ Image upload failed:", err);
    res.status(500).json({ message: err.message });
  }
};
/**
 * GET /api/products/:id
 */
export const getProduct = async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT * FROM products WHERE id = $1`,
      [req.params.id]
    );
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


/**
 * GET /api/products/latest
 */
export const getLatestProducts = async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT * FROM products WHERE status='approved' ORDER BY created_at DESC LIMIT 4`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
