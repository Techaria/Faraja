const pool = require('../db');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === 'true',
  auth: process.env.SMTP_USER ? {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  } : undefined
});

async function sendOrderEmail({ items, customer }) {
  if (!process.env.COMPANY_EMAIL) return;
  const lines = items.map((it, idx) => `${idx + 1}. ${it.name} (x${it.quantity}) - Ksh ${Number(it.price).toFixed(2)}`).join('\n');
  const total = items.reduce((sum, it) => sum + (Number(it.price) * Number(it.quantity || 1)), 0);
  const text = `New cart order\n\nCustomer: ${customer.name}\nEmail: ${customer.email || 'N/A'}\nPhone: ${customer.phone || 'N/A'}\nNote: ${customer.note || 'N/A'}\n\nItems:\n${lines}\n\nTotal: Ksh ${total.toFixed(2)}`;
  await transporter.sendMail({
    from: process.env.FROM_EMAIL || process.env.SMTP_USER,
    to: process.env.COMPANY_EMAIL,
    subject: 'New Cart Order - Faraja Holdings',
    text
  });
}

exports.getAll = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT o.id, o.product_id, p.name AS product_name, o.name, o.email, o.phone, o.message, o.created_at
       FROM orders o LEFT JOIN products p ON o.product_id = p.id
       ORDER BY o.created_at DESC`
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { product_id, name, email, phone, message } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ error: 'Name is required' });
    const [result] = await pool.query(
      'INSERT INTO orders (product_id, name, email, phone, message) VALUES (?, ?, ?, ?, ?)',
      [product_id || null, name.trim(), email || null, phone || null, message || null]
    );
    res.status(201).json({ id: result.insertId });
  } catch (err) {
    next(err);
  }
};

exports.checkout = async (req, res, next) => {
  try {
    const { name, email, phone, note, items } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ error: 'Name is required' });
    if (!Array.isArray(items) || items.length === 0) return res.status(400).json({ error: 'Cart is empty' });

    const message = JSON.stringify({ items, note: note || null });
    const [result] = await pool.query(
      'INSERT INTO orders (product_id, name, email, phone, message) VALUES (?, ?, ?, ?, ?)',
      [null, name.trim(), email || null, phone || null, message]
    );

    await sendOrderEmail({ items, customer: { name: name.trim(), email, phone, note } }).catch(err => {
      console.error('Email send failed:', err);
    });

    res.status(201).json({ id: result.insertId });
  } catch (err) {
    next(err);
  }
};