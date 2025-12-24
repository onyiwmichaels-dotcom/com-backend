const db = require('../config/database');

const Product = {
  getAll: (filters = {}, callback) => {
    try {
      let sql = "SELECT * FROM products";
      const conditions = [];
      const params = [];

      if (filters.type) {
        conditions.push("type = ?");
        params.push(String(filters.type).toLowerCase());
      }
      if (filters.category) {
        conditions.push("category = ?");
        params.push(filters.category);
      }
      if (filters.search) {
        conditions.push("(name LIKE ? OR description LIKE ?)");
        params.push(`%${filters.search}%`, `%${filters.search}%`);
      }
      if (filters.status && filters.status !== 'all') {
        conditions.push("status = ?");
        params.push(filters.status);
      } else if (!filters.status) {
        conditions.push("status = ?");
        params.push("approved");
      }

      if (conditions.length) {
        sql += " WHERE " + conditions.join(" AND ");
      }
      sql += " ORDER BY id DESC";
      db.all(sql, params, callback);
    } catch (syncError) {
      return callback(syncError);
    }
  },

  create: (product, callback) => {
    const { name, price, description, image, type, category, status, sellerPhone } = product;
    const sql = `
      INSERT INTO products 
      (name, price, description, image, type, category, status, sellerPhone)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const params = [name, price, description || '', image || '', type || 'new', category || '', status || 'pending', sellerPhone || 'Admin'];
    db.run(sql, params, function (err) {
      if (err) return callback(err);
      callback(null, { id: this.lastID });
    });
  },

  // FIX: Explicitly handle callback to avoid "not a function" error
  update: (id, updatedData, callback) => {
    const allowedColumns = ['name', 'price', 'description', 'image', 'type', 'category', 'status', 'sellerPhone'];
    const fieldsToUpdate = Object.keys(updatedData).filter(key => allowedColumns.includes(key));
    
    if (fieldsToUpdate.length === 0) return callback(new Error("No valid fields to update"));

    const setClause = fieldsToUpdate.map(field => `${field} = ?`).join(', ');
    const params = fieldsToUpdate.map(field => updatedData[field]);
    
    const sql = `UPDATE products SET ${setClause} WHERE id = ?`;
    params.push(id);

    db.run(sql, params, (err) => {
        if (callback) callback(err);
    });
  },

  // FIX: Renamed 'remove' to 'delete' to match your adminController
  delete: (id, callback) => {
    db.run("DELETE FROM products WHERE id = ?", [id], (err) => {
        if (callback) callback(err);
    });
  },

  getById: (id, callback) => {
    db.get("SELECT * FROM products WHERE id = ?", [id], callback);
  },

  getLatest: (callback) => {
    const sql = `SELECT id, name, price, image FROM products WHERE status = 'approved' ORDER BY id DESC LIMIT 4`;
    db.all(sql, [], callback);
  }
};

module.exports = Product;