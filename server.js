const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

// =================================================================
// 🚨 1. GLOBAL CRASH DETECTORS (THE GHOST BUSTERS) 🚨
// =================================================================
process.on('unhandledRejection', (reason, promise) => {
    console.error('🛑 UNHANDLED PROMISE REJECTION (GLOBAL CATCH) 🛑');
    console.error('Reason:', reason);
    // You can uncomment the line below if you want the server to stop on error:
    // process.exit(1); 
});

process.on('uncaughtException', (err) => {
    console.error('🔥 UNCAUGHT EXCEPTION (GLOBAL CRASH) 🔥');
    console.error('Error:', err);
    // process.exit(1);
});
// =================================================================

// --- IMPORT ROUTES ---
// Ensure these paths match your actual folder structure!
const productRoutes = require('./src/routes/productRoutes');
const orderRoutes = require('./src/routes/orderRoutes');
const adminRoutes = require('./src/routes/adminRoutes');
const authRoutes = require('./src/routes/authRoutes'); // Ensure this file exists for login

const app = express();
const PORT = process.env.PORT || 8080;

// =================================================================
// 2. MIDDLEWARE (The "Gatekeepers")
// =================================================================

// ✅ CORS FIX: Allow ANY localhost port to connect.
const allowedOrigins = [
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174",
  "http://127.0.0.1:5175",
  "http://127.0.0.1:5176",
  "http://127.0.0.1:5178" 
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      return callback(null, true); // Temporarily allowing ALL for debugging
    }
    return callback(null, true);
  },
  credentials: true
}));

// ✅ BODY PARSER FIX
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

// ✅ STATIC FILES
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ✅ DEBUG LOGGING
app.use((req, res, next) => {
  console.log(`📢 Request received: [${req.method}] ${req.path}`);
  console.log('   Data:', req.body); // Shows what data arrived
  next();
});

// =================================================================
// 3. ROUTES (The "Map")
// =================================================================

app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/auth', authRoutes); // Login route (check pin)

// Fallback for browser testing
app.get('/', (req, res) => {
  res.send('✅ Backend is Running!');
});

// =================================================================
// 4. START SERVER
// =================================================================
app.listen(PORT, () => {
  console.log(`\n🚀 SERVER STARTED ---------------------------`);
  console.log(`✅ Backend running at: http://127.0.0.1:${PORT}`);
  console.log(`📂 Serving images from: ${path.join(__dirname, 'uploads')}`);
  console.log(`---------------------------------------------\n`);
});