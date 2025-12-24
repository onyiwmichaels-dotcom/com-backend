const Product = require('../models/productModel'); 

// Fetch products for the shop
const listProducts = (req, res) => {
  const filters = {
    type: req.query.type,
    category: req.query.category,
    search: req.query.search,
    status: req.query.status // Admin can send ?status=pending
  };

  Product.getAll(filters, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
};

// Handle uploads from both Admin and Public
const submitProduct = (req, res) => {
  const { name, price, description, image, type, category, sellerPhone, isAdmin } = req.body;

  if (!name || !price || !image) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const newProduct = {
    name,
    price,
    description,
    image,
    type,
    category,
    sellerPhone,
    // If the request comes from Admin Dashboard, it's approved immediately!
    status: isAdmin ? 'approved' : 'pending' 
  };

  Product.create(newProduct, (err, result) => {
    if (err) return res.status(500).json({ message: err.message });
    res.status(201).json({
      message: isAdmin ? "Product live!" : "Submitted for approval",
      id: result.id
    });
  });
};

const getProduct = (req, res) => {
  Product.getById(req.params.id, (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(row);
  });
};

const updateProduct = (req, res) => {
  Product.update(req.params.id, req.body, (err) => {
    if (err) return res.status(500).json({ message: err.message });
    res.json({ message: "Updated successfully" });
  });
};

const deleteProduct = (req, res) => {
  Product.remove(req.params.id, (err) => {
    if (err) return res.status(500).json({ message: err.message });
    res.json({ message: "Deleted successfully" });
  });
};

const getLatestProducts = (req, res) => {
  Product.getLatest((err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
};

module.exports = {
  listProducts,
  getProduct,
  submitProduct,
  getLatestProducts,
  updateProduct,
  deleteProduct
};