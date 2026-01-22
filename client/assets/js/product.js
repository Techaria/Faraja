let currentProduct = null;
let cart = [];

function getId() {
  const p = new URLSearchParams(location.search);
  return p.get('id');
}

function loadCart() {
  const saved = localStorage.getItem('fh_cart');
  cart = saved ? JSON.parse(saved) : [];
}

function saveCart() {
  localStorage.setItem('fh_cart', JSON.stringify(cart));
}

async function loadCategories() {
  const container = document.getElementById('sidebar-categories');
  if (!container) return;
  
  try {
    const categories = await API.getCategories();
    container.innerHTML = categories.map(c => `
      <a href="/products.html?category_id=${c.id}" class="block px-3 py-2 rounded hover:bg-primary/10 text-primary hover:text-primary transition font-medium text-sm">
        ${c.name}
      </a>
    `).join('');
  } catch (err) {
    console.error('Failed to load categories', err);
  }
}

function renderCart() {
  const list = document.getElementById('cartItems');
  const totalEl = document.getElementById('cartTotal');
  if (!list || !totalEl) return;
  
  if (cart.length === 0) {
    list.innerHTML = '<div class="text-xs text-gray-500">Your cart is empty.</div>';
    totalEl.textContent = 'Ksh 0.00';
    if (window.updateCartCount) window.updateCartCount();
    return;
  }
  
  list.innerHTML = cart.map(item => `
    <div class="flex items-center justify-between gap-2 border-b pb-2">
      <div>
        <div class="font-medium text-xs">${item.name}</div>
        <div class="text-xs text-gray-500">Ksh ${Number(item.price).toFixed(2)} x ${item.quantity}</div>
      </div>
      <div class="flex items-center gap-1">
        <button class="text-gray-600 border px-1.5 rounded qty-btn text-xs" data-id="${item.id}" data-delta="-1">−</button>
        <span class="w-5 text-center text-xs">${item.quantity}</span>
        <button class="text-gray-600 border px-1.5 rounded qty-btn text-xs" data-id="${item.id}" data-delta="1">+</button>
        <button class="text-red-600 text-xs remove-btn ml-1" data-id="${item.id}">✕</button>
      </div>
    </div>
  `).join('');
  
  const total = cart.reduce((sum, it) => sum + Number(it.price) * Number(it.quantity), 0);
  totalEl.textContent = `Ksh ${total.toFixed(2)}`;

  list.querySelectorAll('.qty-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = Number(btn.dataset.id);
      const delta = Number(btn.dataset.delta);
      const item = cart.find(i => i.id === id);
      if (!item) return;
      item.quantity = Math.max(1, item.quantity + delta);
      saveCart();
      renderCart();
    });
  });
  
  list.querySelectorAll('.remove-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = Number(btn.dataset.id);
      cart = cart.filter(i => i.id !== id);
      saveCart();
      renderCart();
    });
  });

  if (window.updateCartCount) window.updateCartCount();
}

async function loadProduct() {
  const id = getId();
  const p = await API.getProduct(id);
  currentProduct = p;
  document.getElementById('name').textContent = p.name;
  document.getElementById('breadcrumb-name').textContent = p.name;
  document.getElementById('category').textContent = p.category || 'Uncategorized';
  document.getElementById('category-badge').textContent = p.category || 'Product';
  document.getElementById('price').textContent = `Ksh ${Number(p.price).toFixed(2)}`;
  const img = document.getElementById('image');
  if (p.image_path) { img.src = p.image_path; } else { img.style.display = 'none'; }
  
  loadSimilarProducts(p.category);
}

async function loadSimilarProducts(category) {
  const grid = document.getElementById('similar-products');
  if (!grid) return;
  
  try {
    const products = await API.getProducts({ limit: 8 });
    const similar = products
      .filter(p => p.category === category && p.id !== currentProduct.id)
      .slice(0, 4);
    
    grid.innerHTML = similar.length > 0 
      ? similar.map(p => `
          <div class="card-hover bg-white rounded-lg border border-gray-200 overflow-hidden">
            <img src="${p.image_path || '/uploads/default-hardware.jpg'}" alt="${p.name}" class="w-full h-40 object-cover" />
            <div class="p-4">
              <h3 class="font-semibold text-gray-900 text-sm mb-2 line-clamp-2">${p.name}</h3>
              <p class="text-accent font-bold text-lg mb-3">Ksh ${Number(p.price).toFixed(0)}</p>
              <a href="/product.html?id=${p.id}" class="block w-full text-center bg-primary hover:bg-secondary text-white py-2 rounded text-xs font-semibold transition">
                View Details
              </a>
            </div>
          </div>
        `).join('')
      : '<div class="col-span-full text-center py-8 text-gray-500">No similar products found</div>';
  } catch (err) {
    console.error('Failed to load similar products', err);
  }
}

function addToCart() {
  if (!currentProduct) return;
  const quantity = Math.max(1, parseInt(document.getElementById('quantity').value, 10) || 1);
  
  const existingItem = cart.find(i => i.id === currentProduct.id);
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.push({
      id: currentProduct.id,
      name: currentProduct.name,
      price: currentProduct.price,
      quantity
    });
  }
  
  saveCart();
  renderCart();
  document.getElementById('quantity').value = 1;
  if (window.showToast) window.showToast(`✓ ${currentProduct.name} (${quantity}) added to cart`);
}

// Quantity controls
const qtyInput = document.getElementById('quantity');
const qtyMinus = document.getElementById('qty-minus');
const qtyPlus = document.getElementById('qty-plus');

if (qtyMinus) {
  qtyMinus.addEventListener('click', (e) => {
    e.preventDefault();
    const val = Math.max(1, parseInt(qtyInput.value, 10) - 1);
    qtyInput.value = val;
  });
}

if (qtyPlus) {
  qtyPlus.addEventListener('click', (e) => {
    e.preventDefault();
    qtyInput.value = parseInt(qtyInput.value, 10) + 1;
  });
}

const yearEl = document.querySelector('[data-year]');
if (yearEl) yearEl.textContent = new Date().getFullYear();

const clearCartBtn = document.getElementById('clearCartBtn');
if (clearCartBtn) {
  clearCartBtn.addEventListener('click', () => {
    cart = [];
    saveCart();
    renderCart();
  });
}

loadCart();
renderCart();
loadCategories();
loadProduct();

// Add to Cart button handler
const addToCartBtn = document.getElementById('addToCartBtn');
if (addToCartBtn) {
  addToCartBtn.addEventListener('click', addToCart);
}
