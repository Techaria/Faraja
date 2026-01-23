const yearEl = document.querySelector('[data-year]');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// Category icons mapping
const categoryIcons = {
  'Tools': '🔨',
  'Building Materials': '🧱',
  'Hardware': '🔧',
  'Safety': '🦺',
  'Paint': '🎨',
  'Plumbing': '🚰',
  'Electrical': '⚡',
  'Lumber': '🪵'
};

async function loadCategories() {
  const categoriesEl = document.getElementById('hero-categories');
  if (!categoriesEl) return;
  const categories = await API.getCategories().catch(err => {
    console.error('Failed to load categories', err);
    return [];
  });
  categoriesEl.innerHTML = categories.map(c => `
    <a href="/products.html?category_id=${c.id}" class="card-hover block bg-white/90 backdrop-blur border border-white/40 rounded-lg p-5 text-center shadow">
      <div class="text-4xl mb-3">${categoryIcons[c.name] || '📦'}</div>
      <h3 class="font-semibold text-gray-900 text-sm sm:text-base">${c.name}</h3>
      <p class="text-xs text-primary mt-1 hover:underline">Shop now →</p>
    </a>
  `).join('');
}

// Hero background slider
let heroImages = [];
const heroBg = document.getElementById('hero-bg');
const dots = document.getElementById('hero-dots');
let heroIndex = 0;

function renderDots() {
  if (!dots) return;
  dots.innerHTML = heroImages.map((_, i) => `
    <button aria-label="Slide ${i + 1}" class="h-2 w-2 rounded-full transition-all ${i === heroIndex ? 'bg-white w-6' : 'bg-white/50 hover:bg-white/80'}" data-idx="${i}"></button>
  `).join('');
  Array.from(dots.children).forEach(btn => btn.addEventListener('click', () => {
    heroIndex = Number(btn.dataset.idx);
    setHeroImage();
  }));
}

function setHeroImage() {
  if (!heroBg) return;
  heroBg.style.backgroundImage = `url('${heroImages[heroIndex]}')`;
  renderDots();
}

async function startHeroSlider() {
  if (!heroBg) return;
  try {
    const products = await API.getProducts({ limit: 6 });
    heroImages = products.filter(p => p.has_image).map(p => API.getProductImageUrl(p.id));
    if (heroImages.length === 0) {
      heroImages = ['/assets/img/default-hardware.svg'];
    }
    setHeroImage();
    setInterval(() => {
      heroIndex = (heroIndex + 1) % heroImages.length;
      setHeroImage();
    }, 5000);
  } catch (err) {
    console.error('Hero slider error:', err);
    heroImages = ['/assets/img/default-hardware.svg'];
    setHeroImage();
  }
}

loadCategories();
startHeroSlider();

// Countdown Timer
function startCountdown() {
  const countdownEl = document.getElementById('countdown');
  if (!countdownEl) return;
  
  function updateCountdown() {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const diff = tomorrow - now;
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    
    countdownEl.textContent = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }
  
  updateCountdown();
  setInterval(updateCountdown, 1000);
}

// Load Limited Time Offers
async function loadOffers() {
  const offersGrid = document.getElementById('offers-grid');
  if (!offersGrid) return;
  
  try {
    const products = await API.getProducts({ limit: 4 });
    offersGrid.innerHTML = products.map(p => `
      <div class="card-hover bg-white rounded-lg border border-orange-200 overflow-hidden">
        <div class="relative">
          <img src="${p.has_image ? API.getProductImageUrl(p.id) : '/assets/img/default-hardware.svg'}" alt="${p.name}" class="w-full h-40 object-cover" />
          <div class="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold">
            -15%
          </div>
        </div>
        <div class="p-4">
          <h3 class="font-semibold text-gray-900 text-sm mb-1 line-clamp-2">${p.name}</h3>
          <div class="flex items-baseline gap-2 mb-3">
            <span class="text-lg font-bold text-primary">Ksh ${(p.price * 0.85).toFixed(0)}</span>
            <span class="text-xs text-gray-500 line-through">Ksh ${Number(p.price).toFixed(0)}</span>
          </div>
          <a href="/product.html?id=${p.id}" class="block text-center bg-primary hover:bg-secondary text-white py-2 rounded text-xs font-semibold transition">
            Shop Now
          </a>
        </div>
      </div>
    `).join('');
  } catch (err) {
    console.error('Failed to load offers', err);
  }
}

// Newsletter form submission
const newsletterForm = document.getElementById('newsletterForm');
if (newsletterForm) {
  newsletterForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = newsletterForm.querySelector('input[type="email"]').value;
    // In a real app, you'd send this to a newsletter service
    alert(`Thanks! You're subscribed with ${email}`);
    newsletterForm.reset();
  });
}

startCountdown();
loadOffers();
