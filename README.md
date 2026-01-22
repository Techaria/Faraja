# Faraja Holdings

A professional, modern hardware store website with a public client side and a simple admin side (no authentication).

Stack: HTML + JavaScript (Tailwind via CDN), Node.js (Express), MySQL (phpMyAdmin), uploads for product images.

## Project Structure

- client/ — Public site (Home, Products, Product Details, Contact)
- admin/ — Admin dashboard (Products, Categories, Orders)
- server/ — Express API and static hosting
- uploads/ — Product images

## Setup

1. Create MySQL database and import schema:
   - Create database (e.g., `faraja_db`).
   - Import `server/schema.sql` via phpMyAdmin.

2. Configure environment:
   - Copy `server/.env.example` to `server/.env` and update DB credentials.

3. Install and run backend:

```bash
cd server
npm install
npm start
```

Server runs at http://localhost:3000 and serves:
- Client: http://localhost:3000/
- Admin: http://localhost:3000/admin
- API: http://localhost:3000/api/*
- Uploads: http://localhost:3000/uploads/*

## Admin Features
- Add/edit/delete products (name, price, category, image upload)
- Manage categories (add/edit/delete)
- View orders/inquiries

## Client Features
- Home: Hero, categories, featured products
- Products: Filter by category, search
- Product Details: Large image, name, price, category; inquiry form
- Contact: Company info, general inquiry form

## Notes
- Images are stored under `uploads/` and paths are saved in the database.
- Tailwind uses CDN for simplicity; no build step required.
- No authentication, as requested.
