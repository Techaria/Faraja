const CART_KEY = 'fh_cart';
let cart = [];

function loadCart() {
  const saved = localStorage.getItem(CART_KEY);
  cart = saved ? JSON.parse(saved) : [];
}

function saveCart() {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function renderCart() {
  const list = document.getElementById('cartItems');
  const totalEl = document.getElementById('cartTotal');
  const cartSidebar = document.getElementById('cartSidebar');
  
  if (!list) return;
  
  // Show cart sidebar if there are items, hide if empty
  if (cart.length > 0 && cartSidebar) {
    cartSidebar.classList.remove('hidden');
  } else if (cart.length === 0 && cartSidebar) {
    cartSidebar.classList.add('hidden');
  }
  
  if (cart.length === 0) {
    list.innerHTML = '<div class="text-sm text-gray-500">Your cart is empty.</div>';
    totalEl.textContent = 'Ksh 0.00';
    return;
  }
  list.innerHTML = cart.map(item => `
    <div class="flex items-center justify-between gap-3 border-b py-2">
      <div>
        <div class="font-medium text-sm">${item.name}</div>
        <div class="text-xs text-gray-500">Ksh ${Number(item.price).toFixed(2)} x ${item.quantity}</div>
      </div>
      <div class="flex items-center gap-2">
        <button class="text-gray-600 border px-2 rounded qty-btn" data-id="${item.id}" data-delta="-1">-</button>
        <button class="text-gray-600 border px-2 rounded qty-btn" data-id="${item.id}" data-delta="1">+</button>
        <button class="text-red-600 text-sm remove-btn" data-id="${item.id}">✕</button>
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
}

async function loadCategories() {
  const select = document.getElementById('category');
  const sidebar = document.getElementById('sidebar-categories');
  const cats = await API.getCategories();
  
  cats.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c.id; opt.textContent = c.name; select.appendChild(opt);
  });
  
  // Populate sidebar categories
  if (sidebar) {
    sidebar.innerHTML = cats.map(c => `
      <a href="/products.html?category_id=${c.id}" class="block px-3 py-2 rounded hover:bg-primary/10 text-primary hover:text-primary transition font-medium text-sm">
        ${c.name}
      </a>
    `).join('');
  }
}

function getQueryParams() {
  const p = new URLSearchParams(location.search);
  return { category_id: p.get('category_id') || '' };
}

function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

async function loadProducts(params = {}) {
  const grid = document.getElementById('grid');
  const items = await API.getProducts(params);
  const randomItems = shuffleArray(items);
  grid.innerHTML = randomItems.map(p => `
    <div class="group bg-white rounded-lg border overflow-hidden hover:shadow transition flex flex-col">
      <a href="/product.html?id=${p.id}" class="block">
        <img src="${p.image_path || ''}" alt="${p.name}" class="w-full h-40 object-cover group-hover:opacity-95 transition" onerror="this.style.display='none'" />
      </a>
      <div class="p-4 flex-1 flex flex-col gap-2">
        <div class="text-sm text-gray-500">${p.category || 'Uncategorized'}</div>
        <a href="/product.html?id=${p.id}" class="font-semibold hover:text-teal-700">${p.name}</a>
        <div class="text-primary font-medium">Ksh ${Number(p.price).toFixed(2)}</div>
        <button class="mt-auto bg-teal-700 hover:bg-teal-800 text-white text-sm px-3 py-2 rounded add-to-cart" data-id="${p.id}" data-name="${p.name}" data-price="${p.price}">Add to Cart</button>
      </div>
    </div>
  `).join('');

  grid.querySelectorAll('.add-to-cart').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = Number(btn.dataset.id);
      const name = btn.dataset.name;
      const price = Number(btn.dataset.price);
      const existing = cart.find(i => i.id === id);
      if (existing) {
        existing.quantity += 1;
      } else {
        cart.push({ id, name, price, quantity: 1 });
      }
      saveCart();
      renderCart();
    });
  });
}

async function checkoutCart(evt) {
  evt.preventDefault();
  const status = document.getElementById('checkoutStatus');
  if (cart.length === 0) {
    status.textContent = 'Add items to cart before checkout.';
    return;
  }
  const form = evt.target;
  const payload = {
    name: form.name.value.trim(),
    email: form.email.value.trim(),
    phone: form.phone.value.trim(),
    note: form.note.value.trim(),
    items: cart
  };
  if (!payload.name) {
    status.textContent = 'Name is required.';
    return;
  }
  status.textContent = 'Placing order...';
  const res = await API.checkoutCart(payload);
  if (res && res.id) {
    status.textContent = 'Order placed! We will contact you soon.';
    cart = [];
    saveCart();
    renderCart();
    form.reset();
  } else {
    status.textContent = res && res.error ? res.error : 'Failed to place order.';
  }
}

// Init
loadCart();
renderCart();
loadCategories();
const initial = getQueryParams();
if (initial.category_id) document.getElementById('category').value = initial.category_id;
loadProducts(initial);

// Event Listeners
const filterBtn = document.getElementById('filterBtn');
if (filterBtn) {
  filterBtn.addEventListener('click', () => {
    const category_id = document.getElementById('category').value;
    const search = document.getElementById('search').value.trim();
    loadProducts({ category_id, search });
  });
}

const checkoutForm = document.getElementById('checkoutForm');
if (checkoutForm) {
  checkoutForm.addEventListener('submit', checkoutCart);
}

const clearCartBtn = document.getElementById('clearCartBtn');
if (clearCartBtn) {
  clearCartBtn.addEventListener('click', () => {
    cart = [];
    saveCart();
    renderCart();
  });
}
