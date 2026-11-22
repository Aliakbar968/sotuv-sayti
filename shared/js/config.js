const SHOP_NAME = "Do'konim";

const STORAGE_KEYS = {
  PRODUCTS: 'shop.products',
  ORDERS: 'shop.orders'
};

const CATEGORIES = [
  { id: 'telefon', name: 'Telefonlar' },
  { id: 'noutbuk', name: 'Noutbuklar' },
  { id: 'planshet', name: 'Planshetlar' },
  { id: 'aksessuar', name: 'Aksessuarlar' }
];

const ORDER_STATUSES = {
  new: 'Yangi',
  processing: 'Jarayonda',
  delivered: 'Yetkazildi',
  cancelled: 'Bekor qilindi'
};

const DELIVERY = {
  fee: 30000,
  freeThreshold: 500000
};
