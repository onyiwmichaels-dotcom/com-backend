import pool from '../config/db.js';

const Product = {
  // =====================================================
  // GET ALL PRODUCTS (SHOP + ADMIN)
  // =====================================================
  getAll: (filters = {}, callback) => {
    try {
      let sql = "SELECT * FROM products";
      const conditions = [];
      const params = [];

      if (filters.type) {
        params.push(String(filters.type).toLowerCase());
        conditions.push(`type = $${params.length}`);
      }

      if (filters.category) {
        params.push(filters.category);
        conditions.push(`category = $${params.length}`);
      }

      if (filters.search) {
        params.push(`%${filters.search}%`);
        params.push(`%${filters.search}%`);
        conditions.push(
          `(name ILIKE $${params.length - 1} OR description ILIKE $${params.length})`
        );
      }

      if (filters.status && filters.status !== 'all') {
        params.push(filters.status);
        conditions.push(`status = $${params.length}`);
      } else if (!filters.status) {
        params.push('approved');
        conditions.push(`status = $${params.length}`);
      }

      if (conditions.length) {
        sql += " WHERE " + conditions.join(" AND ");
      }

      sql += " ORDER BY id DESC";

      pool.query(sql, params, (err, result) => {
        if (err) return callback(err);
        callback(null, result.rows);
      });
    } catch (error) {
      callback(error);
    }
  },

  // =====================================================
  // CREATE PRODUCT
  // =====================================================
  create: (product, callback) => {
    const {
      name,
      price,
      description = '',
      image = '',
      type = 'new',
      category = '',
      status = 'pending',
      sellerPhone = 'Admin'
    } = product;

    const sql = `
      INSERT INTO products
      (name, price, description, image, type, category, status, sellerPhone)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id;
    `;

    const params = [
      name,
      price,
      description,
      image,
      type,
      category,
      status,
      sellerPhone
    ];

    pool.query(sql, params, (err, result) => {
      if (err) return callback(err);
      callback(null, { id: result.rows[0].id });
    });
  },

  // =====================================================
  // UPDATE PRODUCT
  // =====================================================
  update: (id, updatedData, callback) => {
    const allowedColumns = [
      'name',
      'price',
      'description',
      'image',
      'type',
      'category',
      'status',
      'sellerPhone'
    ];

    const fields = Object.keys(updatedData).filter(key =>
      allowedColumns.includes(key)
    );

    if (fields.length === 0) {
      return callback(new Error("No valid fields to update"));
    }

    const setClause = fields
      .map((field, index) => `${field} = $${index + 1}`)
      .join(', ');

    const params = fields.map(field => updatedData[field]);
    params.push(id);

    const sql = `UPDATE products SET ${setClause} WHERE id = $${params.length}`;

    pool.query(sql, params, (err) => {
      if (callback) callback(err);
    });
  },

  // =====================================================
  // DELETE PRODUCT
  // =====================================================
  delete: (id, callback) => {
    pool.query(
      "DELETE FROM products WHERE id = $1",
      [id],
      (err) => {
        if (callback) callback(err);
      }
    );
  },

  // =====================================================
  // GET PRODUCT BY ID
  // =====================================================
  getById: (id, callback) => {
    pool.query(
      "SELECT * FROM products WHERE id = $1",
      [id],
      (err, result) => {
        if (err) return callback(err);
        callback(null, result.rows[0]);
      }
    );
  },

  // =====================================================
  // GET LATEST PRODUCTS (HOME PAGE)
  // =====================================================
  getLatest: (callback) => {
    const sql = `
      SELECT id, name, price, image
      FROM products
      WHERE status = 'approved'
      ORDER BY id DESC
      LIMIT 4
    `;

    pool.query(sql, [], (err, result) => {
      if (err) return callback(err);
      callback(null, result.rows);
    });
  }
};

export default Product;
