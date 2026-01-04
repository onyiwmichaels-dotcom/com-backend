import express from "express";
const router = express.Router();

// ADMIN CONTROLLERS
import {
  getProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  getOrders,
  getAdminStats
} from "../controllers/adminController.js";

// ==========================================================
// DASHBOARD STATS
// ==========================================================
router.get("/stats", getAdminStats);

// ==========================================================
// PRODUCT CRUD (ADMIN)
// ==========================================================
router.get("/products", getProducts);
router.post("/products", addProduct);
router.put("/products/:id", updateProduct);
router.delete("/products/:id", deleteProduct);

// ==========================================================
// ORDERS
// ==========================================================
router.get("/orders", getOrders);

export default router;
