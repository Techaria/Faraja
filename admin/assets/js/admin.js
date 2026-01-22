// Tabs
const tabs = document.querySelectorAll('.tab-btn');
tabs.forEach(btn => btn.addEventListener('click', () => {
  document.querySelectorAll('.tab').forEach(t => t.classList.add('hidden'));
  document.getElementById(`tab-${btn.dataset.tab}`).classList.remove('hidden');
  tabs.forEach(b => b.classList.remove('bg-primary','text-white'));
  tabs.forEach(b => b.classList.add('bg-white','border'));
  btn.classList.add('bg-primary','text-white');
  btn.classList.remove('bg-white','border');
}));

// Stats
async function loadStats() {
  const [products, categories, orders] = await Promise.all([
    API.getProducts(), API.getCategories(), fetch('/api/orders').then(r=>r.json())
  ]);
  document.getElementById('stat-products').textContent = products.length;
  document.getElementById('stat-categories').textContent = categories.length;
  document.getElementById('stat-orders').textContent = orders.length;
}

// Categories management
async function loadCategoriesAdmin() {
  const list = document.getElementById('categoriesList');
  const cats = await API.getCategories();
  const select = document.getElementById('prodCategory');
  select.innerHTML = '<option value="">Uncategorized</option>' + cats.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
  list.innerHTML = cats.map(c => `
    <div class="border rounded p-3 flex items-center justify-between">
      <div>${c.name}</div>
      <div class="space-x-2">
        <button class="px-3 py-1 border rounded" onclick="editCategory(${c.id}, '${c.name}')">Edit</button>
        <button class="px-3 py-1 bg-red-600 text-white rounded" onclick="deleteCategory(${c.id})">Delete</button>
      </div>
    </div>
  `).join('');
}

async function editCategory(id, currentName) {
  const name = prompt('Edit category name', currentName);
  if (!name) return;
  await fetch(`/api/categories/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name }) });
  loadCategoriesAdmin();
}

async function deleteCategory(id) {
  if (!confirm('Delete this category?')) return;
  await fetch(`/api/categories/${id}`, { method: 'DELETE' });
  loadCategoriesAdmin();
}

document.getElementById('categoryForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = e.target.name.value.trim();
  await fetch('/api/categories', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name }) });
  e.target.reset();
  document.getElementById('catStatus').textContent = 'Category added.';
  loadCategoriesAdmin();
});

// Products management
async function loadProductsAdmin() {
  const list = document.getElementById('productsList');
  const products = await API.getProducts();
  list.innerHTML = products.map(p => `
    <div class="border rounded p-3 flex gap-3">
      <img src="${p.image_path || ''}" class="w-24 h-24 object-cover border rounded" onerror="this.style.display='none'" />
      <div class="flex-1">
        <div class="font-semibold">${p.name}</div>
        <div class="text-sm text-gray-500">${p.category || 'Uncategorized'}</div>
         <div class="text-primary">Ksh ${Number(p.price).toFixed(2)}</div>
        <div class="space-x-2 mt-2">
          <button class="px-3 py-1 border rounded" onclick="editProduct(${p.id})">Edit</button>
          <button class="px-3 py-1 bg-red-600 text-white rounded" onclick="deleteProduct(${p.id})">Delete</button>
        </div>
        <div class="mt-3 flex items-center gap-2 text-sm">
          <input type="file" accept="image/*" id="img-${p.id}" class="text-xs" />
          <button class="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded" onclick="updateProductImage(${p.id})">Update Image</button>
        </div>
      </div>
    </div>
  `).join('');
}

window.editProduct = async function(id) {
  const p = await API.getProduct(id);
  const name = prompt('Edit product name', p.name);
  if (name === null) return;
  const priceStr = prompt('Edit price', String(p.price));
  if (priceStr === null) return;
  const price = parseFloat(priceStr);
  const category_id = prompt('Edit category ID (blank for none)', p.category_id || '') || '';
  const formData = new FormData();
  formData.append('name', name);
  formData.append('price', price);
  if (category_id !== '') formData.append('category_id', category_id);
  await fetch(`/api/products/${id}`, { method: 'PUT', body: formData });
  loadProductsAdmin();
}

window.deleteProduct = async function(id) {
  if (!confirm('Delete this product?')) return;
  await fetch(`/api/products/${id}`, { method: 'DELETE' });
  loadProductsAdmin();
}

window.updateProductImage = async function(id) {
  const input = document.getElementById(`img-${id}`);
  if (!input || !input.files.length) {
    alert('Choose an image first.');
    return;
  }
  const fd = new FormData();
  fd.append('image', input.files[0]);
  const res = await fetch(`/api/products/${id}`, { method: 'PUT', body: fd });
  if (res.ok) {
    loadProductsAdmin();
    loadStats();
  } else {
    alert('Failed to update image');
  }
}

document.getElementById('productForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const fd = new FormData(e.target);
  const res = await fetch('/api/products', { method: 'POST', body: fd });
  if (res.ok) {
    e.target.reset();
    document.getElementById('prodStatus').textContent = 'Product added.';
    loadProductsAdmin();
    loadStats();
  } else {
    document.getElementById('prodStatus').textContent = 'Failed to add product.';
  }
});

// Orders
async function loadOrdersAdmin() {
  const list = document.getElementById('ordersList');
  const orders = await fetch('/api/orders').then(r => r.json());
  
  list.innerHTML = orders.map(o => {
    let itemsHTML = '';
    let total = 0;
    
    // Check if message is a JSON string (cart order with multiple items)
    let items = [];
    try {
      if (o.message && o.message.startsWith('{')) {
        const parsed = JSON.parse(o.message);
        items = parsed.items || [];
      }
    } catch (e) {
      // Not JSON, treat as simple message
    }
    
    // Build items table
    if (items.length > 0) {
      itemsHTML = `
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b bg-gray-50">
              <th class="text-left py-2 px-3 font-semibold">Product</th>
              <th class="text-right py-2 px-3 font-semibold">Price</th>
              <th class="text-right py-2 px-3 font-semibold">Qty</th>
              <th class="text-right py-2 px-3 font-semibold">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${items.map(item => {
              const subtotal = Number(item.price) * Number(item.quantity);
              total += subtotal;
              return `
                <tr class="border-b">
                  <td class="py-2 px-3">${item.name}</td>
                  <td class="text-right py-2 px-3">Ksh ${Number(item.price).toFixed(2)}</td>
                  <td class="text-right py-2 px-3">${item.quantity}</td>
                  <td class="text-right py-2 px-3 font-medium">Ksh ${subtotal.toFixed(2)}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
        <div class="flex justify-end mt-3 pt-3 border-t">
          <div class="text-right">
            <div class="text-gray-600 text-sm">Order Total:</div>
            <div class="text-2xl font-bold text-primary">Ksh ${total.toFixed(2)}</div>
          </div>
        </div>
      `;
    } else if (o.message && !o.message.startsWith('{')) {
      itemsHTML = `
        <div class="bg-gray-50 p-3 rounded mt-3">
          <p class="text-sm text-gray-700"><strong>Message:</strong> ${o.message}</p>
        </div>
      `;
    }
    
    return `
      <div class="border rounded-lg p-4 bg-white shadow-sm">
        <!-- Client Details Header -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 pb-4 border-b">
          <div>
            <p class="text-xs text-gray-500 font-semibold">CLIENT NAME</p>
            <p class="font-semibold text-gray-900">${o.name}</p>
          </div>
          <div>
            <p class="text-xs text-gray-500 font-semibold">EMAIL</p>
            <p class="text-sm text-gray-700">${o.email || 'N/A'}</p>
          </div>
          <div>
            <p class="text-xs text-gray-500 font-semibold">PHONE</p>
            <p class="text-sm text-gray-700">${o.phone || 'N/A'}</p>
          </div>
          <div>
            <p class="text-xs text-gray-500 font-semibold">DATE</p>
            <p class="text-sm text-gray-700">${new Date(o.created_at).toLocaleDateString()} ${new Date(o.created_at).toLocaleTimeString()}</p>
          </div>
        </div>
        
        <!-- Products/Items -->
        ${itemsHTML}
      </div>
    `;
  }).join('');
}

// Init
loadStats();
loadCategoriesAdmin();
loadProductsAdmin();
loadOrdersAdmin();
