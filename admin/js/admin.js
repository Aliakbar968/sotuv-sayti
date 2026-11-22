// Holat (State) o'zgaruvchilari
let allProducts = [];
let editingId = null;

// DOM elementlar
const form = document.getElementById('product-form');
const formTitle = document.getElementById('form-title');
const idInput = document.getElementById('product-id');
const categorySelect = document.getElementById('product-category');
const filterSelect = document.getElementById('filter-category');
const imageInput = document.getElementById('product-image');
const imagePreview = document.getElementById('image-preview');
const formError = document.getElementById('form-error');
const submitBtn = document.getElementById('submit-btn');
const cancelBtn = document.getElementById('cancel-btn');
const tbody = document.getElementById('products-body');
const toastEl = document.getElementById('toast');

// 1. Boshlang'ich sozlash
function init() {
  document.getElementById('shop-name-display').textContent = SHOP_NAME;

  // Kategoriyalarni select larga to'ldirish
  CATEGORIES.forEach(cat => {
    const opt1 = document.createElement('option');
    opt1.value = cat.id;
    opt1.textContent = cat.name;
    categorySelect.appendChild(opt1);

    const opt2 = document.createElement('option');
    opt2.value = cat.id;
    opt2.textContent = cat.name;
    filterSelect.appendChild(opt2);
  });

  // Hodisalarni ulash
  form.addEventListener('submit', handleSubmit);
  cancelBtn.addEventListener('click', resetForm);
  tbody.addEventListener('click', handleTableClick);
  filterSelect.addEventListener('change', renderTable);
  imageInput.addEventListener('input', handleImagePreview);

  loadAndRender();
}

// 2. Ma'lumotlarni yuklash va chizish
async function loadAndRender() {
  allProducts = await Store.getProducts();
  renderTable();
}

// 3. Jadvalni chizish
function renderTable() {
  const selectedCat = filterSelect.value;
  const filtered = selectedCat === 'all'
    ? allProducts
    : allProducts.filter(p => p.category === selectedCat);

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:24px; color:#666;">Mahsulot yo'q</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map(product => {
    const catObj = CATEGORIES.find(c => c.id === product.category);
    const catName = catObj ? catObj.name : product.category;
    const imgSrc = product.image ? escapeHTML(product.image) : '/shared/img/placeholder.svg';

    return `
      <tr>
        <td>
          <img class="thumb" src="${imgSrc}" alt="${escapeHTML(product.name)}" onerror="this.src='/shared/img/placeholder.svg'">
        </td>
        <td><strong>${escapeHTML(product.name)}</strong></td>
        <td>${escapeHTML(catName)}</td>
        <td>${formatPrice(product.price)}</td>
        <td>
          <div class="action-btns">
            <button type="button" class="btn-sm" data-action="edit" data-id="${product.id}">O'zgartirish</button>
            <button type="button" class="btn-sm btn-danger" data-action="delete" data-id="${product.id}">O'chirish</button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

// 4. Formani saqlash (qo'shish yoki yangilash)
async function handleSubmit(e) {
  e.preventDefault();
  formError.classList.add('hidden');

  const formData = Object.fromEntries(new FormData(form));

  try {
    if (editingId) {
      await Store.updateProduct(editingId, formData);
      showToast('Mahsulot yangilandi');
    } else {
      await Store.addProduct(formData);
      showToast("Mahsulot qo'shildi");
    }

    resetForm();
    await loadAndRender();
  } catch (err) {
    formError.textContent = err.message;
    formError.classList.remove('hidden');
  }
}

// 5. Jadvaldagi tugmalarni boshqarish (Event Delegation)
function handleTableClick(e) {
  const btn = e.target.closest('[data-action]');
  if (!btn) return;

  const { action, id } = btn.dataset;
  if (action === 'edit') {
    startEdit(id);
  } else if (action === 'delete') {
    handleDelete(id);
  }
}

// 6. Tahrirlashni boshlash
function startEdit(id) {
  const product = allProducts.find(p => p.id === id);
  if (!product) return;

  editingId = product.id;
  idInput.value = product.id;
  form.elements.name.value = product.name;
  form.elements.price.value = product.price;
  form.elements.category.value = product.category;
  form.elements.image.value = product.image || '';
  form.elements.description.value = product.description || '';

  handleImagePreview();
  formTitle.textContent = 'Mahsulotni tahrirlash';
  submitBtn.textContent = 'Yangilash';
  cancelBtn.classList.remove('hidden');
  formError.classList.add('hidden');

  form.scrollIntoView({ behavior: 'smooth' });
}

// 7. O'chirish
async function handleDelete(id) {
  const confirmed = confirm("Shu mahsulot o'chirilsinmi?");
  if (!confirmed) return;

  await Store.deleteProduct(id);

  if (editingId === id) {
    resetForm();
  }

  await loadAndRender();
  showToast("Mahsulot o'chirildi");
}

// 8. Formani tozalash
function resetForm() {
  form.reset();
  idInput.value = '';
  editingId = null;
  formTitle.textContent = 'Yangi mahsulot';
  submitBtn.textContent = 'Saqlash';
  cancelBtn.classList.add('hidden');
  formError.classList.add('hidden');
  imagePreview.classList.add('hidden');
}

// 10. Rasm ko'rinishi (ixtiyoriy)
function handleImagePreview() {
  const url = imageInput.value.trim();
  if (!url) {
    imagePreview.classList.add('hidden');
    return;
  }
  imagePreview.src = url;
  imagePreview.classList.remove('hidden');
  imagePreview.onerror = () => imagePreview.classList.add('hidden');
}

// Qisqa xabar ko'rsatish (Toast)
let toastTimer;
function showToast(message) {
  toastEl.textContent = message;
  toastEl.classList.remove('hidden');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toastEl.classList.add('hidden');
  }, 2500);
}
// Kompyuterdan rasm tanlanganda uni matnga (Base64) aylantirib maydonga yozish
document.getElementById('product-file').addEventListener('change', function (e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (event) {
    imageInput.value = event.target.result;
    handleImagePreview();
  };
  reader.readAsDataURL(file);
});


// Dasturni ishga tushirish
init();
