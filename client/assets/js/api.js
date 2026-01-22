const API = {
  async getCategories() {
    const res = await fetch('/api/categories');
    return res.json();
  },
  async getProducts(params = {}) {
    const q = new URLSearchParams(params).toString();
    const res = await fetch('/api/products' + (q ? `?${q}` : ''));
    return res.json();
  },
  async getProduct(id) {
    const res = await fetch(`/api/products/${id}`);
    return res.json();
  },
  getProductImageUrl(id) {
    return `/api/products/${id}/image`;
  },
  async createOrder(payload) {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return res.json();
  },
  async checkoutCart(payload) {
    const res = await fetch('/api/orders/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return res.json();
  }
};