// Shared layout for header and footer
(function() {
  const headerEl = document.getElementById('site-header');
  const footerEl = document.getElementById('site-footer');

  const header = `
    <header class="bg-white/95 backdrop-blur sticky top-0 z-40 shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
        <a href="/" class="text-xl sm:text-2xl font-bold text-primary">Faraja Holdings</a>
        <nav class="hidden md:flex items-center gap-6 text-sm text-gray-700">
          <a href="/products.html" class="hover:text-primary transition">Products</a>
          <a href="/products.html#cart" class="relative hover:text-primary transition flex items-center gap-2">
            <span>Cart</span>
            <span id="cartCount" class="hidden bg-accent text-white text-xs font-bold px-2 py-0.5 rounded-full min-w-[1.75rem] text-center"></span>
          </a>
          <a href="/contact.html" class="hover:text-primary transition">Contact</a>
          <a href="/admin" class="hover:text-secondary transition">Admin</a>
        </nav>
        <button id="mobileMenuBtn" class="md:hidden text-primary text-2xl" aria-label="Toggle menu">☰</button>
      </div>
      <nav id="mobileMenu" class="hidden md:hidden bg-white border-t">
        <div class="px-4 py-2 space-y-2 text-sm">
          <a href="/products.html" class="block py-2 hover:text-primary">Products</a>
          <a href="/products.html#cart" class="relative block py-2 hover:text-primary">Cart <span id="cartCountMobile" class="hidden ml-2 bg-accent text-white text-xs font-bold px-2 py-0.5 rounded-full min-w-[1.75rem] inline-block text-center"></span></a>
          <a href="/contact.html" class="block py-2 hover:text-primary">Contact</a>
          <a href="/admin" class="block py-2 hover:text-primary">Admin</a>
        </div>
      </nav>
    </header>
  `;

  const footer = `
    <footer class="bg-gray-900 text-gray-300 mt-12">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
        <div>
          <h3 class="text-white font-bold mb-3">Faraja Holdings</h3>
          <p class="text-sm leading-relaxed">Premium hardware and building supplies for professionals and DIY enthusiasts across Kenya.</p>
        </div>
        <div>
          <h3 class="text-white font-bold mb-3">Quick Links</h3>
          <ul class="text-sm space-y-1.5">
            <li><a href="/products.html" class="hover:text-white transition">Products</a></li>
            <li><a href="/contact.html" class="hover:text-white transition">Contact Us</a></li>
            <li><a href="/" class="hover:text-white transition">Home</a></li>
          </ul>
        </div>
        <div>
          <h3 class="text-white font-bold mb-3">Contact & Hours</h3>
          <p class="text-sm">📞 +254 700 123 456</p>
          <p class="text-sm">📧 info@farajaholdings.com</p>
          <p class="text-sm mt-3 font-semibold">Hours:</p>
          <p class="text-sm">Mon-Fri: 8AM - 6PM</p>
          <p class="text-sm">Sat: 9AM - 4PM</p>
        </div>
      </div>
      <div class="border-t border-gray-700 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 text-sm text-gray-500 text-center">© <span data-year></span> Faraja Holdings. All rights reserved.</div>
    </footer>
  `;

  const toast = `<div id="toast" class="hidden fixed top-20 right-4 bg-primary text-white px-4 py-3 rounded-lg shadow-lg z-50 transition-opacity duration-300"></div>`;

  if (headerEl) headerEl.innerHTML = header;
  if (footerEl) footerEl.innerHTML = footer;
  if (!document.getElementById('toast')) {
    document.body.insertAdjacentHTML('beforeend', toast);
  }

  const mobileBtn = document.getElementById('mobileMenuBtn');
  const mobileMenu = document.getElementById('mobileMenu');
  if (mobileBtn && mobileMenu) {
    mobileBtn.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
    });
  }

  window.updateCartCount = () => {
    const raw = localStorage.getItem('fh_cart') || localStorage.getItem('cart') || '[]';
    const cartItems = JSON.parse(raw);
    const count = cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0);
    const desktopBadge = document.getElementById('cartCount');
    const mobileBadge = document.getElementById('cartCountMobile');

    [desktopBadge, mobileBadge].forEach(badge => {
      if (!badge) return;
      if (count > 0) {
        badge.textContent = count;
        badge.classList.remove('hidden');
      } else {
        badge.classList.add('hidden');
      }
    });
  };

  window.updateCartCount();

  window.showToast = (message, duration = 3000) => {
    const toastEl = document.getElementById('toast');
    if (!toastEl) return;
    toastEl.textContent = message;
    toastEl.classList.remove('hidden');
    toastEl.classList.add('opacity-100');
    setTimeout(() => {
      toastEl.classList.remove('opacity-100');
      toastEl.classList.add('opacity-0');
      setTimeout(() => toastEl.classList.add('hidden'), 300);
    }, duration);
  };

  document.querySelectorAll('[data-year]').forEach(el => {
    el.textContent = new Date().getFullYear();
  });
})();
