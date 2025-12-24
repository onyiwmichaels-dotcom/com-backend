const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Keep your existing database file path
const dbPath = path.resolve(__dirname, '..', '..', 'shop.sqlite'); 

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) console.error("Database connection error:", err.message);
    else console.log("Database connected successfully.");
});

// Create tables
db.serialize(() => {
    // 1. PRODUCTS TABLE
    // FIX: Added 'sellerPhone' so the dashboard stops crashing when saving/approving
    db.run(`CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        price REAL NOT NULL,
        description TEXT,
        image TEXT,
        type TEXT,
        category TEXT,
        sellerPhone TEXT,   
        status TEXT DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // 2. ORDERS TABLE
    // FIX: Added 'productName' so your Orders list shows what was bought
    db.run(`CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        customerName TEXT NOT NULL,
        phone TEXT NOT NULL,
        location TEXT NOT NULL,
        productId INTEGER NOT NULL,
        productName TEXT,
        date DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (productId) REFERENCES products(id) ON DELETE CASCADE
    )`);

    // 3. ADMIN TABLE (Unchanged)
    db.run(`CREATE TABLE IF NOT EXISTS admin (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        pin TEXT NOT NULL
    )`, (err) => {
        if (!err) {
            db.get("SELECT COUNT(*) AS count FROM admin", (err, row) => {
                if (row && row.count === 0) {
                    db.run("INSERT INTO admin (pin) VALUES (?)", ['WalterPIN2025']);
                }
            });
        }
    });
});

module.exports = db;