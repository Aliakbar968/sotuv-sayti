// Holat (State)
let allProducts = [];
let activeCategory = 'all';

// DOM elementlar
const filtersEl = document.getElementById('filters');
const productsEl = document.getElementById('products');
const emptyEl = document.getElementById('empty');

// 1. Boshlang'ich sozlash
function init() {
  document.getElementById('shop-logo-name').textContent = SHOP_NAME;
  document.getElementById('footer-shop-name').textContent = SHOP_NAME;
  document.getElementById('footer-year').textContent = new Date().getFullYear();

  renderFilters();
  loadAndRender();

  // 5. Filtr bosilganda (Event Delegation)
  filtersEl.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-category]');
    if (!btn) return;

    activeCategory = btn.dataset.category;

    // Tugmalarning .is-active holatini yangilash
    filtersEl.querySelectorAll('.filter-btn').forEach(b => {
      const isActive = b.dataset.category === activeCategory;
      b.classList.toggle('is-active', isActive);
      b.setAttribute('aria-pressed', isActive);
    });

    renderProducts();
  });

  // 6. Rasm yuklanmaganda placeholder qo'yish (capture bosqichida)
  productsEl.addEventListener('error', (e) => {
    if (e.target.tagName === 'IMG' && !e.target.src.endsWith('/shared/img/placeholder.svg')) {
      e.target.src = '/shared/img/placeholder.svg';
    }
  }, true);
}

// 2. Kategoriya tugmalarini chizish
function renderFilters() {
  const buttons = [{ id: 'all', name: 'Hammasi' }, ...CATEGORIES];

  filtersEl.innerHTML = buttons.map(cat => {
    const isActive = cat.id === activeCategory;
    return `
      <button 
        type="button" 
        class="filter-btn ${isActive ? 'is-active' : ''}" 
        data-category="${cat.id}" 
        aria-pressed="${isActive}">
        ${escapeHTML(cat.name)}
      </button>
    `;
  }).join('');
}

// 3. Ma'lumotlarni yuklash va chizish
async function loadAndRender() {
  allProducts = await Store.getProducts();
  renderProducts();
}

// 4. Mahsulot kartalarini chizish
function renderProducts() {
  const filtered = activeCategory === 'all'
    ? allProducts
    : allProducts.filter(p => p.category === activeCategory);

  if (filtered.length === 0) {
    productsEl.innerHTML = '';
    emptyEl.hidden = false;
    return;
  }

  emptyEl.hidden = true;

  productsEl.innerHTML = filtered.map(p => {
    const catName = CATEGORIES.find(c => c.id === p.category)?.name || p.category;
    const imgSrc = p.image ? escapeHTML(p.image) : '/shared/img/placeholder.svg';

    return `
      <li class="card">
        <img class="card__img" src="${imgSrc}" alt="${escapeHTML(p.name)}" loading="lazy">
        <span class="card__category">${escapeHTML(catName)}</span>
        <h3 class="card__title">${escapeHTML(p.name)}</h3>
        <p class="card__price">${formatPrice(p.price)}</p>
        <button type="button" class="card__btn" data-id="${p.id}">Buyurtma berish</button>
      </li>
    `;
  }).join('');
}

// 7. Boshqa tabda (Admin panelda) o'zgarish bo'lganda avtomatik yangilanish
window.addEventListener('storage', (e) => {
  if (e.key === STORAGE_KEYS.PRODUCTS) {
    loadAndRender();
  }
});

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    loadAndRender();
  }
});

// Dasturni ishga tushirish
init();
