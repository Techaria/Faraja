require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Static: client, admin, uploads
app.use(express.static(path.resolve(__dirname, '../client')));
app.use('/admin', express.static(path.resolve(__dirname, '../admin')));
app.use('/uploads', express.static(path.resolve(__dirname, '../uploads')));

// API routes
const categoriesRouter = require('./routes/categories');
const productsRouter = require('./routes/products');
const ordersRouter = require('./routes/orders');

app.use('/api/categories', categoriesRouter);
app.use('/api/products', productsRouter);
app.use('/api/orders', ordersRouter);

// Health
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Database test (temporary, for debugging)
app.get('/api/test-db', async (req, res, next) => {
  try {
    const pool = require('./db');
    const [rows] = await pool.query('SELECT 1 as connection_test');
    res.json({
      status: 'Database connection successful',
      test: rows[0],
      config: {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 3306,
        user: process.env.DB_USER || 'root',
        database: process.env.DB_NAME || 'faraja_db'
      }
    });
  } catch (err) {
    res.status(500).json({
      status: 'Database connection failed',
      error: err.message,
      config: {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 3306,
        user: process.env.DB_USER || 'root',
        database: process.env.DB_NAME || 'faraja_db'
      }
    });
  }
});

// Fallback to client index for root
app.get('/', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../client/index.html'));
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({ error: err.message || 'Server error' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Faraja Holdings server running at http://localhost:${PORT}`);
});
