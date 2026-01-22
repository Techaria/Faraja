// Mobile menu toggle
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const mobileMenu = document.getElementById('mobileMenu');
if (mobileMenuBtn && mobileMenu) {
  mobileMenuBtn.addEventListener('click', () => {
    mobileMenu.classList.toggle('hidden');
  });
}

// Tab Switching
const tabs = document.querySelectorAll('.tab-btn');
tabs.forEach(btn => {
  btn.addEventListener('click', () => {
    const tabName = btn.dataset.tab;
    
    // Hide all tabs
    document.querySelectorAll('.tab').forEach(t => t.classList.add('hidden'));
    document.getElementById(`tab-${tabName}`).classList.remove('hidden');
    
    // Update button styles
    tabs.forEach(b => {
      b.classList.remove('border-primary', 'text-primary');
      b.classList.add('border-transparent', 'text-gray-600');
    });
    btn.classList.remove('border-transparent', 'text-gray-600');
    btn.classList.add('border-primary', 'text-primary');
  });
});


// ============ DASHBOARD ============
async function loadStats() {
  const [products, categories, orders] = await Promise.all([
    API.getProducts(),
    API.getCategories(),
    fetch('/api/orders').then(r => r.json())
  ]);
  document.getElementById('stat-products').textContent = products.length;
  document.getElementById('stat-categories').textContent = categories.length;
  document.getElementById('stat-orders').textContent = orders.length;
}


// ============ CATEGORIES ============
async function loadCategoriesAdmin() {
  const list = document.getElementById('categoriesList');
  const noEl = document.getElementById('noCategories');
  const cats = await API.getCategories();
  const select = document.getElementById('prodCategory');
  
  select.innerHTML = '<option value="">Uncategorized</option>' + cats.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
  
  if (cats.length === 0) {
    list.classList.add('hidden');
    noEl.classList.remove('hidden');
    return;
  }
  
  list.classList.remove('hidden');
  noEl.classList.add('hidden');
  
  list.innerHTML = cats.map(c => `
    <div class="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all-smooth">
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-base sm:text-lg font-semibold text-gray-900">${c.name}</h3>
        <span class="text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full font-medium">ID: ${c.id}</span>
      </div>
      <div class="flex flex-col sm:flex-row gap-2">
        <button class="flex-1 text-sm bg-primary/10 hover:bg-primary/20 text-primary px-4 py-2 rounded-lg transition-all-smooth font-medium" onclick="editCategory(${c.id}, '${c.name.replace(/'/g, "\\'")}')">
          Edit
        </button>
        <button class="flex-1 text-sm bg-red-50 hover:bg-red-100 text-red-700 px-4 py-2 rounded-lg transition-all-smooth font-medium" onclick="deleteCategory(${c.id})">
          Delete
        </button>
      </div>
    </div>
  `).join('');
}

window.editCategory = async function(id, currentName) {
  const name = prompt('Edit category name', currentName);
  if (!name || name === currentName) return;
  
  const res = await fetch(`/api/categories/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name })
  });
  
  if (res.ok) {
    showToast(`✓ Category updated`);
    loadCategoriesAdmin();
  } else {
    showToast('Failed to update category');
  }
}

window.deleteCategory = async function(id) {
  if (!confirm('Delete this category? Products without a category will be marked as Uncategorized.')) return;
  
  const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
  if (res.ok) {
    showToast(`✓ Category deleted`);
    loadCategoriesAdmin();
  } else {
    showToast('Failed to delete category');
  }
}

document.getElementById('categoryForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = e.target.name.value.trim();
  if (!name) return;
  
  const res = await fetch('/api/categories', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name })
  });
  
  if (res.ok) {
    e.target.reset();
    document.getElementById('catStatus').textContent = '✓ Category added successfully';
    setTimeout(() => document.getElementById('catStatus').textContent = '', 3000);
    loadCategoriesAdmin();
  } else {
    document.getElementById('catStatus').textContent = '✗ Failed to add category';
  }
});


// ============ PRODUCTS ============
async function loadProductsAdmin() {
  const list = document.getElementById('productsList');
  const noEl = document.getElementById('noProducts');
  const products = await API.getProducts();
  
  if (products.length === 0) {
    list.classList.add('hidden');
    noEl.classList.remove('hidden');
    return;
  }
  
  list.classList.remove('hidden');
  noEl.classList.add('hidden');
  
  list.innerHTML = products.map(p => `
    <div class="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all-smooth flex flex-col sm:flex-row">
      <!-- Image -->
      <div class="w-full sm:w-32 h-40 sm:h-32 flex-shrink-0 bg-gray-100 overflow-hidden">
        <img src="${p.has_image ? `/api/products/${p.id}/image` : '/uploads/default-hardware.jpg'}" alt="${p.name}" class="w-full h-full object-cover" onerror="this.src='/uploads/default-hardware.jpg'" />
      </div>
      
      <!-- Content -->
      <div class="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div class="mb-3">
          <h3 class="text-base sm:text-lg font-bold text-gray-900 line-clamp-2">${p.name}</h3>
          <div class="flex items-center gap-2 mt-2">
            <span class="text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full font-medium">${p.category || 'Uncategorized'}</span>
            <span class="text-sm text-gray-600">ID: ${p.id}</span>
          </div>
          <p class="text-lg sm:text-xl font-bold text-primary mt-2">Ksh ${Number(p.price).toFixed(2)}</p>
        </div>
        
        <div class="space-y-3">
          <!-- Image Upload -->
          <div class="flex flex-col sm:flex-row gap-2">
            <input type="file" accept="image/*" id="img-${p.id}" class="flex-1 text-xs border border-gray-300 rounded-lg px-3 py-2 file:mr-2 file:px-2 file:py-1 file:bg-primary/10 file:text-primary file:border-0 file:rounded file:cursor-pointer" />
            <button class="sm:w-auto bg-primary/10 hover:bg-primary/20 text-primary px-3 py-2 rounded-lg transition-all-smooth font-medium text-sm" onclick="updateProductImage(${p.id})">
              Update Image
            </button>
          </div>
          
          <!-- Action Buttons -->
          <div class="flex gap-2">
            <button class="flex-1 text-sm bg-primary/10 hover:bg-primary/20 text-primary px-4 py-2 rounded-lg transition-all-smooth font-medium" onclick="editProduct(${p.id})">
              Edit
            </button>
            <button class="flex-1 text-sm bg-red-50 hover:bg-red-100 text-red-700 px-4 py-2 rounded-lg transition-all-smooth font-medium" onclick="deleteProduct(${p.id})">
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  `).join('');
}

window.editProduct = async function(id) {
  const p = await API.getProduct(id);
  const name = prompt('Edit product name', p.name);
  if (name === null || name === p.name) return;
  
  const priceStr = prompt('Edit price', String(p.price));
  if (priceStr === null) return;
  const price = parseFloat(priceStr);
  if (isNaN(price) || price < 0) {
    showToast('Invalid price');
    return;
  }
  
  const formData = new FormData();
  formData.append('name', name);
  formData.append('price', price);
  
  const res = await fetch(`/api/products/${id}`, { method: 'PUT', body: formData });
  if (res.ok) {
    showToast('✓ Product updated');
    loadProductsAdmin();
    loadStats();
  } else {
    showToast('Failed to update product');
  }
}

window.deleteProduct = async function(id) {
  if (!confirm('Delete this product permanently?')) return;
  
  const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
  if (res.ok) {
    showToast('✓ Product deleted');
    loadProductsAdmin();
    loadStats();
  } else {
    showToast('Failed to delete product');
  }
}

window.updateProductImage = async function(id) {
  const input = document.getElementById(`img-${id}`);
  if (!input || !input.files.length) {
    showToast('Choose an image first');
    return;
  }
  
  const fd = new FormData();
  fd.append('image', input.files[0]);
  
  const res = await fetch(`/api/products/${id}`, { method: 'PUT', body: fd });
  if (res.ok) {
    showToast('✓ Image updated');
    input.value = '';
    loadProductsAdmin();
    loadStats();
  } else {
    showToast('Failed to update image');
  }
}

document.getElementById('productForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const fd = new FormData(e.target);
  
  const res = await fetch('/api/products', { method: 'POST', body: fd });
  if (res.ok) {
    e.target.reset();
    document.getElementById('prodStatus').textContent = '✓ Product added successfully';
    setTimeout(() => document.getElementById('prodStatus').textContent = '', 3000);
    loadProductsAdmin();
    loadStats();
  } else {
    document.getElementById('prodStatus').textContent = '✗ Failed to add product';
  }
});


// ============ ORDERS ============
async function loadOrdersAdmin() {
  const list = document.getElementById('ordersList');
  const noEl = document.getElementById('noOrders');
  const orders = await fetch('/api/orders').then(r => r.json());
  
  if (orders.length === 0) {
    list.classList.add('hidden');
    noEl.classList.remove('hidden');
    return;
  }
  
  list.classList.remove('hidden');
  noEl.classList.add('hidden');
  
  list.innerHTML = orders.map(o => {
    let itemsHTML = '';
    let total = 0;
    let items = [];
    
    try {
      if (o.message && o.message.startsWith('{')) {
        const parsed = JSON.parse(o.message);
        items = parsed.items || [];
      }
    } catch (e) {}
    
    if (items.length > 0) {
      itemsHTML = `
        <div class="overflow-x-auto">
          <table class="w-full text-xs sm:text-sm">
            <thead>
              <tr class="border-b bg-gray-50">
                <th class="text-left py-3 px-3 font-semibold text-gray-700">Product</th>
                <th class="text-right py-3 px-3 font-semibold text-gray-700">Price</th>
                <th class="text-right py-3 px-3 font-semibold text-gray-700">Qty</th>
                <th class="text-right py-3 px-3 font-semibold text-gray-700">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${items.map(item => {
                const subtotal = Number(item.price) * Number(item.quantity);
                total += subtotal;
                return `
                  <tr class="border-b hover:bg-gray-50">
                    <td class="py-2.5 px-3 text-gray-800 font-medium">${item.name}</td>
                    <td class="text-right py-2.5 px-3 text-gray-600">Ksh ${Number(item.price).toFixed(2)}</td>
                    <td class="text-right py-2.5 px-3 text-gray-600">${item.quantity}</td>
                    <td class="text-right py-2.5 px-3 text-gray-900 font-semibold">Ksh ${subtotal.toFixed(2)}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
        <div class="flex justify-end mt-4 pt-4 border-t">
          <div class="text-right">
            <div class="text-sm text-gray-600 mb-1">Order Total:</div>
            <div class="text-2xl sm:text-3xl font-bold text-primary">Ksh ${total.toFixed(2)}</div>
          </div>
        </div>
      `;
    } else if (o.message && !o.message.startsWith('{')) {
      itemsHTML = `
        <div class="bg-gray-50 p-4 rounded-lg mt-3 border-l-4 border-accent">
          <p class="text-sm text-gray-700"><strong>Message:</strong> ${o.message}</p>
        </div>
      `;
    }
    
    return `
      <div class="bg-white border border-gray-200 rounded-xl p-4 sm:p-6 shadow-sm">
        <!-- Order Header Grid -->
        <div class="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6 pb-4 border-b border-gray-200">
          <div>
            <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Client Name</p>
            <p class="text-sm sm:text-base font-bold text-gray-900">${o.name}</p>
          </div>
          <div>
            <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Email</p>
            <p class="text-sm text-gray-700 truncate">${o.email || '—'}</p>
          </div>
          <div>
            <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Phone</p>
            <p class="text-sm text-gray-700">${o.phone || '—'}</p>
          </div>
          <div>
            <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Date & Time</p>
            <p class="text-sm text-gray-700">${new Date(o.created_at).toLocaleDateString()} ${new Date(o.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
          </div>
        </div>
        
        <!-- Items/Products -->
        ${itemsHTML}
      </div>
    `;
  }).join('');
}

// ============ TOAST NOTIFICATION ============
function showToast(message, duration = 3000) {
  if (!window.showToast_func) {
    // Fallback toast if layout.js not loaded
    const toast = document.createElement('div');
    toast.className = 'fixed top-20 right-4 bg-primary text-white px-4 py-3 rounded-lg shadow-lg z-50';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), duration);
  } else {
    window.showToast_func(message, duration);
  }
}

// ============ INITIALIZATION ============
loadStats();
loadCategoriesAdmin();
loadProductsAdmin();
loadOrdersAdmin();

