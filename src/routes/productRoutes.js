import express from 'express';
const router = express.Router();

// ✅ Use import with curly braces for named exports from your controller
// ⚠️ Note: You MUST include the '.js' extension for local files in ES Modules
import {
  listProducts,
  getProduct,
  submitProduct,
  getLatestProducts
} from '../controllers/productController.js';

// GET Latest Products (Trending = Newest)
router.get('/latest', getLatestProducts);

// GET Public Shop Items (Approved Only)
router.get('/', listProducts);

// POST Submit New Item (From SellItem.jsx -> Pending)
router.post('/', submitProduct);

// GET Single Item
router.get('/:id', getProduct);

// ✅ Change module.exports to export default
export default router;