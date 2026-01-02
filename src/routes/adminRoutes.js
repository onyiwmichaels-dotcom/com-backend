import express from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";

// Resolve __dirname (required in ES modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// CONTROLLERS (unchanged logic, just ES imports)
import {
  getProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  uploadImage,
  getOrders,
  getAdminStats
} from "../controllers/adminController.js";

// ==========================================================
// MULTER CONFIG (UNCHANGED — still saves to /uploads)
// ==========================================================

const storage = multer.diskStorage({
  destination: (req, file, cb) =>
    cb(null, path.resolve(__dirname, "../../uploads")),

  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name =
      Date.now() + "-" + Math.round(Math.random() * 1e9) + ext;
    cb(null, name);
  }
});

const upload = multer({ storage });

// ==========================================================
// DASHBOARD STATS
// ==========================================================

router.get("/stats", getAdminStats);

// ==========================================================
// PRODUCT CRUD ROUTES
// ==========================================================

router.get("/products", getProducts);
router.post("/products", addProduct);
router.put("/products/:id", updateProduct);
router.delete("/products/:id", deleteProduct);

// ==========================================================
// IMAGE UPLOAD ROUTE
// ==========================================================

router.post("/upload", upload.single("image"), uploadImage);

// ==========================================================
// ORDERS
// ==========================================================

router.get("/orders", getOrders);

export default router;
