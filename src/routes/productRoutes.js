const express = require('express');
const router = express.Router();
const {
  listProducts,
  getProduct,
  submitProduct,
  getLatestProducts
} = require('../controllers/productController');

// GET Latest Products (Trending = Newest)
router.get('/latest', getLatestProducts);

// GET Public Shop Items (Approved Only)
router.get('/', listProducts);

// POST Submit New Item (From SellItem.jsx -> Pending)
router.post('/', submitProduct);

// GET Single Item
router.get('/:id', getProduct);

module.exports = router;
