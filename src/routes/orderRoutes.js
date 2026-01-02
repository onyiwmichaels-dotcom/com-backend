import express from "express";
import {
  createOrder,
  getOrders
} from "../controllers/orderController.js";

const router = express.Router();

// Route to place a new order
router.post("/", createOrder);

// Route to get all orders (for admin)
router.get("/", getOrders);

export default router;
