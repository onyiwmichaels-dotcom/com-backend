const express = require('express');
const router = express.Router();
const { createOrder, getOrders } = require('../controllers/orderController');

// Route to place a new order
router.post('/', createOrder);

// Route to get all orders (for admin)
router.get('/', getOrders);

module.exports = router;
