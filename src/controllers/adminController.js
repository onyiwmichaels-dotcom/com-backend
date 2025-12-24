const Product = require('../models/productModel');
const db = require('../config/database');
const path = require('path');

// ==========================================================
// 1. PRODUCT CRUD HANDLERS
// ==========================================================

// GET products (Used by Admin Dashboard for product list)
const getProducts = (req, res) => {
    // 🛑 CRITICAL FIX: Explicitly set the status filter to 'all' for the Admin view.
    // This overrides the 'approved' default in productModel.js, ensuring
    // pending products are returned to populate the Submission Inbox tab.
    const filters = { ...req.query, status: 'all' };
    
    Product.getAll(filters, (err, rows) => {
        if (err) {
            console.error("❌ Admin Get Products Error:", err.message);
            return res.status(500).json({ message: err.message });
        }
        res.json(rows);
    });
};

// POST Add Product (ADMIN UPLOAD - AUTO APPROVED)
const addProduct = (req, res) => {
    const { name, price, description, image, type, category, sellerPhone, location } = req.body;
    
    // Validation
    if (!name || !price || !image || !sellerPhone) {
        return res.status(400).json({ message: "Name, price, image URL, and seller phone number are required." });
    }

    // 🛑 KEY FIX: We verify that 'status' is set to 'approved' for Admin uploads
    Product.create({ 
        name, 
        price, 
        description, 
        image, 
        type, 
        category, 
        sellerPhone, 
        location,
        status: 'approved' // ✅ FORCE APPROVED STATUS (Live immediately)
    }, function(err) {
        if (err) {
            console.error("❌ Database Insert Error:", err.message);
            return res.status(500).json({ message: err.message });
        }
        
        res.status(201).json({ message: "Product added and is live!", id: this.lastID });
    });
};

// PUT Update Product
const updateProduct = (req, res) => {
    const id = req.params.id;
    const { name, price, description, image, type, category, sellerPhone, location } = req.body;
    
    if (!id || !name || !price || !sellerPhone) {
        return res.status(400).json({ message: "ID, name, price, and seller phone required" });
    }

    Product.update({ id, name, price, description, image, type, category, sellerPhone, location }, (err) => {
        if (err) {
            console.error("❌ Database Update Error:", err.message);
            return res.status(500).json({ message: err.message });
        }
        res.json({ message: "Updated" });
    });
};

// DELETE Product
const deleteProduct = (req, res) => {
    const id = req.params.id;
    
    if (!id) return res.status(400).json({ message: "ID required" });
    
    Product.delete(id, (err) => {
        if (err) return res.status(500).json({ message: err.message });
        res.status(204).send();
    });
};

// ==========================================================
// 2. IMAGE UPLOAD HANDLER
// ==========================================================

const uploadImage = (req, res) => {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });
    const filePath = `/uploads/${req.file.filename}`;
    res.json({ filePath });
};

// ==========================================================
// 3. ORDER HANDLERS
// ==========================================================

const getOrders = (req, res) => {
    db.all("SELECT o.*, p.name AS productName, p.price AS productPrice FROM orders o LEFT JOIN products p ON o.productId = p.id ORDER BY o.date DESC", [], (err, rows) => {
        if (err) {
            console.error("SQL Error in getOrders:", err.message);
            return res.status(500).json({ message: err.message });
        }
        res.json(rows);
    });
};

// ==========================================================
// 4. ADMIN DASHBOARD STATS HANDLER (FIXED)
// ==========================================================

const getAdminStats = (req, res) => {
    // 1. Get Total Orders Count
    db.get("SELECT COUNT(id) AS totalOrders FROM orders", (err1, orderRow) => {
        if (err1) {
            console.error("❌ Stats Error: Total Orders:", err1.message);
            return res.status(500).json({ message: "Error fetching orders count: " + err1.message });
        }

        // 2. Get Pending Requests Count (Using robust LOWER() comparison)
        db.get("SELECT COUNT(id) AS pendingRequests FROM products WHERE LOWER(status) = 'pending'", (err2, pendingRow) => {
            if (err2) {
                console.error("❌ Stats Error: Pending Requests:", err2.message);
                return res.status(500).json({ message: "Error fetching pending count: " + err2.message });
            }

            // 3. Get Active Inventory Count (Status = Approved)
            db.get("SELECT COUNT(id) AS activeInventory FROM products WHERE LOWER(status) = 'approved'", (err3, activeRow) => {
                if (err3) {
                    console.error("❌ Stats Error: Active Inventory:", err3.message);
                    return res.status(500).json({ message: "Error fetching active inventory count: " + err3.message });
                }

                const stats = {
                    totalOrders: orderRow ? orderRow.totalOrders : 0,
                    activeInventory: activeRow ? activeRow.activeInventory : 0,
                    pendingRequests: pendingRow ? pendingRow.pendingRequests : 0
                };
                
                // 🕵️ FINAL DEBUG LOG: Check this in your terminal when you load the dashboard!
                console.log("📈 [Admin Stats] Final Dashboard Data:", stats); 

                res.json(stats);
            });
        });
    });
};

module.exports = {
    getProducts,
    addProduct,
    updateProduct,
    deleteProduct,
    uploadImage,
    getOrders,
    getAdminStats
};