import pool from '../config/db.js'; // ⚡ same as other files

const Order = {
  create: (customerName, phone, location, productId, callback) => {
    const query = `
      INSERT INTO orders (customerName, phone, location, productId)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
    const values = [customerName, phone, location, productId];

    pool.query(query, values, (err, result) => {
      if (err) return callback(err);
      callback(null, result.rows[0]);
    });
  },

  getAll: (callback) => {
    const query = `
      SELECT o.*, p.name AS productName, p.price AS productPrice, o.created_at
      FROM orders o
      LEFT JOIN products p ON o.productId = p.id
      ORDER BY o.created_at DESC;
    `;

    pool.query(query, [], (err, result) => {
      if (err) return callback(err);
      callback(null, result.rows);
    });
  }
};

export default Order;
