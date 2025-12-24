const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

// NOTE: These controllers must be implemented correctly!
const {
  getProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  uploadImage,
  getOrders,
  getAdminStats // <--- 🛑 NEW: We now import the function that fetches all the dashboard counts (8, 0, 0)
} = require('../controllers/adminController');

// Multer setup (Kept as is - this correctly handles physical file saving)
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.resolve(__dirname, '../../uploads')),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    // Unique filename to prevent overwrites
    const name = Date.now() + '-' + Math.round(Math.random() * 1e9) + ext;
    cb(null, name);
  }
});
const upload = multer({ storage });

// ------------------------------------------------------------------
// DASHBOARD STATS ROUTE (NEW ROUTE)
// ------------------------------------------------------------------
router.get('/stats', getAdminStats); // <--- 🛑 NEW: This route provides the counts for the tiles!

// ------------------------------------------------------------------
// PRODUCT CRUD ROUTES (Expects JSON data, including the image URL string)
// ------------------------------------------------------------------
router.get('/products', getProducts); 
router.post('/products', addProduct); 
router.put('/products/:id', updateProduct); 
router.delete('/products/:id', deleteProduct); 

// ------------------------------------------------------------------
// IMAGE UPLOAD ROUTE (Handles the actual file and returns the URL/path)
// ------------------------------------------------------------------
router.post('/upload', upload.single('image'), uploadImage); 

// ORDERS
router.get('/orders', getOrders); 

module.exports = router;