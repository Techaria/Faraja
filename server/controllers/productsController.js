const pool = require('../db');

exports.getAll = async (req, res, next) => {
  try {
    const { category_id, limit, search } = req.query;
    const params = [];
    let sql = `SELECT p.id, p.name, p.price, p.created_at, c.id AS category_id, c.name AS category,
                      (p.image_data IS NOT NULL) AS has_image
               FROM products p LEFT JOIN categories c ON p.category_id=c.id`;
    const where = [];
    if (category_id) {
      where.push('p.category_id = ?');
      params.push(category_id);
    }
    if (search) {
      where.push('p.name LIKE ?');
      params.push(`%${search}%`);
    }
    if (where.length) sql += ' WHERE ' + where.join(' AND ');
    sql += ' ORDER BY p.created_at DESC';
    if (limit) {
      sql += ' LIMIT ?';
      params.push(Number(limit));
    }
    const [rows] = await pool.query(sql, params);
    res.json(rows || []);
  } catch (err) {
    console.error('Products getAll error:', err.message);
    // Fallback: try the old image_path column if image_data doesn't exist
    try {
      const { category_id, limit, search } = req.query;
      const params = [];
      let sql = `SELECT p.id, p.name, p.price, p.image_path, p.created_at, c.id AS category_id, c.name AS category
                 FROM products p LEFT JOIN categories c ON p.category_id=c.id`;
      const where = [];
      if (category_id) {
        where.push('p.category_id = ?');
        params.push(category_id);
      }
      if (search) {
        where.push('p.name LIKE ?');
        params.push(`%${search}%`);
      }
      if (where.length) sql += ' WHERE ' + where.join(' AND ');
      sql += ' ORDER BY p.created_at DESC';
      if (limit) {
        sql += ' LIMIT ?';
        params.push(Number(limit));
      }
      const [rows] = await pool.query(sql, params);
      res.json(rows || []);
    } catch (fallbackErr) {
      next(err);
    }
  }
};

exports.getById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(
      `SELECT p.id, p.name, p.price, p.created_at, c.id AS category_id, c.name AS category,
              (p.image_data IS NOT NULL) AS has_image
       FROM products p LEFT JOIN categories c ON p.category_id=c.id WHERE p.id=?`,
      [id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Product not found' });
    res.json(rows[0]);
  } catch (err) {
    // Fallback to old schema
    try {
      const { id } = req.params;
      const [rows] = await pool.query(
        `SELECT p.id, p.name, p.price, p.image_path, p.created_at, c.id AS category_id, c.name AS category
         FROM products p LEFT JOIN categories c ON p.category_id=c.id WHERE p.id=?`,
        [id]
      );
      if (!rows.length) return res.status(404).json({ error: 'Product not found' });
      res.json(rows[0]);
    } catch (fallbackErr) {
      next(err);
    }
  }
};

exports.getImage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT image_data, image_mime_type FROM products WHERE id=?', [id]);
    if (!rows.length || !rows[0].image_data) {
      return res.status(404).json({ error: 'Image not found' });
    }
    res.set('Content-Type', rows[0].image_mime_type || 'image/jpeg');
    res.send(rows[0].image_data);
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { name, category_id, price } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ error: 'Name is required' });
    if (!price || isNaN(price)) return res.status(400).json({ error: 'Valid price is required' });
    const imageData = req.file ? req.file.buffer : null;
    const imageMimeType = req.file ? req.file.mimetype : null;
    const [result] = await pool.query(
      'INSERT INTO products (name, category_id, price, image_data, image_mime_type) VALUES (?, ?, ?, ?, ?)',
      [name.trim(), category_id || null, price, imageData, imageMimeType]
    );
    res.status(201).json({ 
      id: result.insertId, 
      name: name.trim(), 
      category_id: category_id || null, 
      price: Number(price), 
      has_image: !!imageData
    });
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, category_id, price } = req.body;
    const imageData = req.file ? req.file.buffer : undefined;
    const imageMimeType = req.file ? req.file.mimetype : undefined;

    // Fetch current
    const [rows] = await pool.query('SELECT * FROM products WHERE id=?', [id]);
    if (!rows.length) return res.status(404).json({ error: 'Product not found' });
    const current = rows[0];

    const newName = name !== undefined ? name.trim() : current.name;
    const newCategoryId = category_id !== undefined ? (category_id || null) : current.category_id;
    const newPrice = price !== undefined ? price : current.price;
    const newImageData = imageData !== undefined ? imageData : current.image_data;
    const newImageMimeType = imageMimeType !== undefined ? imageMimeType : current.image_mime_type;

    const [result] = await pool.query(
      'UPDATE products SET name=?, category_id=?, price=?, image_data=?, image_mime_type=? WHERE id=?',
      [newName, newCategoryId, newPrice, newImageData, newImageMimeType, id]
    );
    res.json({ 
      id: Number(id), 
      name: newName, 
      category_id: newCategoryId, 
      price: Number(newPrice), 
      has_image: !!newImageData
    });
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM products WHERE id=?', [id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Product not found' });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};