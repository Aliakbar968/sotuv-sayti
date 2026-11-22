// Yordamchi funksiyalar (tashqariga chiqmaydi)
function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    return fallback;
  }
}

function write(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function makeId(prefix) {
  const rand = Math.random().toString(36).substring(2, 6);
  return prefix + Date.now().toString(36) + rand;
}

function validateProduct(data) {
  const name = (data.name || '').trim();
  if (name.length < 2 || name.length > 80) {
    throw new Error("Mahsulot nomi 2 dan 80 belgigacha bo'lishi kerak");
  }

  const price = Number(data.price);
  if (isNaN(price) || price <= 0) {
    throw new Error("Narx 0 dan katta son bo'lishi kerak");
  }

  const validCategory = CATEGORIES.some(c => c.id === data.category);
  if (!validCategory) {
    throw new Error("Noto'g'ri kategoriya tanlandi");
  }

  const description = (data.description || '').trim();
  if (description.length > 500) {
    throw new Error("Tavsif 500 belgidan oshmasligi kerak");
  }

  const image = (data.image || '').trim();

  return { name, price, category: data.category, image, description };
}

function seedIfNeeded() {
  if (localStorage.getItem(STORAGE_KEYS.PRODUCTS) === null) {
    const now = Date.now();
    const initialProducts = [
      { id: makeId('p_'), name: 'Samsung Galaxy A55', price: 4500000, category: 'telefon', image: '/shared/img/products/telefon-1.webp', description: '8/256 GB, Super AMOLED ekran, 50 MP kamera', createdAt: now - 7000 },
      { id: makeId('p_'), name: 'iPhone 15 Pro', price: 13200000, category: 'telefon', image: '/shared/img/products/telefon-2.webp', description: '256 GB, Titan korpus, A17 Pro chip', createdAt: now - 6000 },
      { id: makeId('p_'), name: 'MacBook Air M2', price: 12800000, category: 'noutbuk', image: '/shared/img/products/laptop-1.webp', description: '13.6 dyuym, 8/256 GB, yengil va tezkor', createdAt: now - 5000 },
      { id: makeId('p_'), name: 'ASUS Vivobook 15', price: 6900000, category: 'noutbuk', image: '/shared/img/products/laptop-2.jpg', description: 'Core i5, 16/512 GB SSD, ofis va o‘qish uchun', createdAt: now - 4000 },
      { id: makeId('p_'), name: 'iPad Air 5', price: 7800000, category: 'planshet', image: '/shared/img/products/planshet-1.jpg', description: 'M1 chip, 10.9 dyuym Liquid Retina ekran', createdAt: now - 3000 },
      { id: makeId('p_'), name: 'Samsung Galaxy Tab S9', price: 8900000, category: 'planshet', image: '/shared/img/products/planshet-2.jpg', description: 'S-Pen bilan, AMOLED 120Hz ekran', createdAt: now - 2000 },
      { id: makeId('p_'), name: 'AirPods Pro 2', price: 2950000, category: 'aksessuar', image: '/shared/img/products/aksessuar-1.jpg', description: 'Faol shovqinni bosish, MagSafe quti', createdAt: now - 1000 },
      { id: makeId('p_'), name: 'Logitech MX Master 3S', price: 1250000, category: 'aksessuar', image: '/shared/img/products/aksessuar-2.jpg', description: 'Simsiz ergonomik sichqoncha, 8000 DPI', createdAt: now }
    ];
    write(STORAGE_KEYS.PRODUCTS, initialProducts);
  }
}


// Tashqariga chiqadigan asosiy obyekt
const Store = {
  async getProducts() {
    const products = read(STORAGE_KEYS.PRODUCTS, []);
    return products.sort((a, b) => b.createdAt - a.createdAt);
  },

  async getProduct(id) {
    const products = read(STORAGE_KEYS.PRODUCTS, []);
    return products.find(p => p.id === id) || null;
  },

  async addProduct(data) {
    const clean = validateProduct(data);
    const products = read(STORAGE_KEYS.PRODUCTS, []);
    const newProduct = {
      id: makeId('p_'),
      ...clean,
      createdAt: Date.now()
    };
    products.push(newProduct);
    write(STORAGE_KEYS.PRODUCTS, products);
    return newProduct;
  },

  async updateProduct(id, data) {
    const clean = validateProduct(data);
    const products = read(STORAGE_KEYS.PRODUCTS, []);
    const index = products.findIndex(p => p.id === id);
    if (index === -1) {
      throw new Error("Mahsulot topilmadi");
    }
    products[index] = { ...products[index], ...clean };
    write(STORAGE_KEYS.PRODUCTS, products);
    return products[index];
  },

  async deleteProduct(id) {
    const products = read(STORAGE_KEYS.PRODUCTS, []);
    const filtered = products.filter(p => p.id !== id);
    write(STORAGE_KEYS.PRODUCTS, filtered);
    return true;
  },

  // Bonus: Buyurtmalar uchun funksiyalar
  async createOrder(data) {
    const orders = read(STORAGE_KEYS.ORDERS, []);
    const newOrder = {
      id: makeId('o_'),
      ...data,
      status: 'new',
      createdAt: Date.now()
    };
    orders.push(newOrder);
    write(STORAGE_KEYS.ORDERS, orders);
    return newOrder;
  },

  async getOrders() {
    const orders = read(STORAGE_KEYS.ORDERS, []);
    return orders.sort((a, b) => b.createdAt - a.createdAt);
  },

  async updateOrderStatus(id, status) {
    const orders = read(STORAGE_KEYS.ORDERS, []);
    const index = orders.findIndex(o => o.id === id);
    if (index === -1) throw new Error("Buyurtma topilmadi");
    orders[index].status = status;
    write(STORAGE_KEYS.ORDERS, orders);
    return orders[index];
  }
};

// Fayl yuklanganda boshlang'ich 8 ta mahsulotni tekshirib yozish
seedIfNeeded();
