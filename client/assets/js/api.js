const API = {
  async getCategories() {
    const res = await fetch('/api/categories');
    return res.json();
  },
  async getProducts(params = {}) {
    const q = new URLSearchParams(params).toString();
    const res = await fetch('/api/products' + (q ? `?${q}` : ''));
    const data = await res.json();
    // Support both old image_path and new has_image formats
    return Array.isArray(data) ? data.map(p => ({
      ...p,
      has_image: p.has_image !== undefined ? p.has_image : !!p.image_path
    })) : [];
  },
  async getProduct(id) {
    const res = await fetch(`/api/products/${id}`);
    const data = await res.json();
    // Support both old image_path and new has_image formats
    if (data && typeof data === 'object') {
      return {
        ...data,
        has_image: data.has_image !== undefined ? data.has_image : !!data.image_path
      };
    }
    return data;
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