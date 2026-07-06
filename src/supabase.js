import { createClient } from '@supabase/supabase-js';

// Ambil URL dan KEY dari environment variable Vite
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Cek apakah Supabase sudah dikonfigurasi
export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey && supabaseUrl !== 'YOUR_SUPABASE_URL');

// Inisialisasi Supabase Client jika dikonfigurasi
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// ==========================================
// MOCK DATA & LOCAL STORAGE BACKEND
// (Digunakan jika Supabase belum dikonfigurasi)
// ==========================================

const DEFAULT_CATEGORIES = [
  { id: 'cat-1', name: 'Dim Sum', slug: 'dim-sum', icon: 'Utensils', color: '#f97316' },
  { id: 'cat-2', name: 'Es Krim', slug: 'es-krim', icon: 'IceCream', color: '#ec4899' },
  { id: 'cat-3', name: 'Minuman', slug: 'minuman', icon: 'Coffee', color: '#06b6d4' },
  { id: 'cat-4', name: 'Camilan', slug: 'camilan', icon: 'Cookie', color: '#eab308' }
];

const DEFAULT_PRODUCTS = [
  { id: 'prod-1', name: 'Siomay Ayam (isi 4)', description: 'Siomay ayam kukus lembut disajikan dengan saus sambal.', price: 15000, category_id: 'cat-1', stock: 50, active: true, image_url: '' },
  { id: 'prod-2', name: 'Hakau Udang (isi 3)', description: 'Hakau udang transparan isi udang utuh segar.', price: 18000, category_id: 'cat-1', stock: 30, active: true, image_url: '' },
  { id: 'prod-3', name: 'Lumpia Kulit Tahu (isi 3)', description: 'Lumpia udang dibalut kulit tahu renyah.', price: 16000, category_id: 'cat-1', stock: 25, active: true, image_url: '' },
  { id: 'prod-4', name: 'Bakpao Telur Asin (isi 2)', description: 'Bakpao kukus hangat dengan isian saus telur asin meleleh.', price: 14000, category_id: 'cat-1', stock: 20, active: true, image_url: '' },
  { id: 'prod-5', name: 'Cone Es Krim Vanilla', description: 'Cone renyah dengan es krim vanilla lembut.', price: 8000, category_id: 'cat-2', stock: 100, active: true, image_url: '' },
  { id: 'prod-6', name: 'Cone Es Krim Cokelat', description: 'Cone renyah dengan es krim cokelat belgian pekat.', price: 8000, category_id: 'cat-2', stock: 100, active: true, image_url: '' },
  { id: 'prod-7', name: 'Sundae Strawberry', description: 'Es krim vanilla cup dengan selai strawberry segar dan potongan buah.', price: 12000, category_id: 'cat-2', stock: 45, active: true, image_url: '' },
  { id: 'prod-8', name: 'Sundae Matcha Oreo', description: 'Es krim matcha khas jepang dengan taburan remahan oreo.', price: 14000, category_id: 'cat-2', stock: 40, active: true, image_url: '' },
  { id: 'prod-9', name: 'Es Teh Manis', description: 'Teh melati dingin yang manis menyegarkan.', price: 5000, category_id: 'cat-3', stock: 200, active: true, image_url: '' },
  { id: 'prod-10', name: 'Teh Tarik Jelly', description: 'Teh tarik dingin dengan topping grass jelly.', price: 10000, category_id: 'cat-3', stock: 50, active: true, image_url: '' },
  { id: 'prod-11', name: 'Es Krim Matcha Latte', description: 'Minuman matcha dingin dengan topping satu scoop es krim matcha.', price: 15000, category_id: 'cat-3', stock: 35, active: true, image_url: '' },
  { id: 'prod-12', name: 'French Fries', description: 'Kentang goreng renyah disajikan dengan saus tomat.', price: 12000, category_id: 'cat-4', stock: 40, active: true, image_url: '' }
];

// Helper inisialisasi localStorage
const initLocalDb = () => {
  if (!localStorage.getItem('pos_categories')) {
    localStorage.setItem('pos_categories', JSON.stringify(DEFAULT_CATEGORIES));
  }
  if (!localStorage.getItem('pos_products')) {
    localStorage.setItem('pos_products', JSON.stringify(DEFAULT_PRODUCTS));
  }
  if (!localStorage.getItem('pos_orders')) {
    localStorage.setItem('pos_orders', JSON.stringify([]));
  }
  if (!localStorage.getItem('pos_order_items')) {
    localStorage.setItem('pos_order_items', JSON.stringify([]));
  }
};

initLocalDb();

// API Abstraksi Database
export const db = {
  // --- Kategori ---
  async getCategories() {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('categories').select('*').order('name');
      if (!error) return data;
      console.error('Supabase error fetching categories, falling back to localStorage:', error);
    }
    return JSON.parse(localStorage.getItem('pos_categories'));
  },

  async addCategory(category) {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('categories').insert([category]).select();
      if (!error) return data[0];
      throw error;
    }
    const categories = JSON.parse(localStorage.getItem('pos_categories'));
    const newCategory = {
      ...category,
      id: 'cat-' + Date.now(),
      created_at: new Date().toISOString()
    };
    categories.push(newCategory);
    localStorage.setItem('pos_categories', JSON.stringify(categories));
    return newCategory;
  },

  // --- Produk ---
  async getProducts() {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('products').select('*').order('name');
      if (!error) return data;
      console.error('Supabase error fetching products, falling back to localStorage:', error);
    }
    return JSON.parse(localStorage.getItem('pos_products'));
  },

  async addProduct(product) {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('products').insert([product]).select();
      if (!error) return data[0];
      throw error;
    }
    const products = JSON.parse(localStorage.getItem('pos_products'));
    const newProduct = {
      ...product,
      id: 'prod-' + Date.now(),
      created_at: new Date().toISOString()
    };
    products.push(newProduct);
    localStorage.setItem('pos_products', JSON.stringify(products));
    return newProduct;
  },

  async updateProduct(id, updates) {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('products').update(updates).eq('id', id).select();
      if (!error) return data[0];
      throw error;
    }
    const products = JSON.parse(localStorage.getItem('pos_products'));
    const index = products.findIndex(p => p.id === id);
    if (index !== -1) {
      products[index] = { ...products[index], ...updates };
      localStorage.setItem('pos_products', JSON.stringify(products));
      return products[index];
    }
    throw new Error('Product not found');
  },

  async deleteProduct(id) {
    if (isSupabaseConfigured) {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (!error) return true;
      throw error;
    }
    const products = JSON.parse(localStorage.getItem('pos_products'));
    const filtered = products.filter(p => p.id !== id);
    localStorage.setItem('pos_products', JSON.stringify(filtered));
    return true;
  },

  // --- Transaksi / Orders ---
  async getOrders() {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
      if (!error) return data;
      console.error('Supabase error fetching orders, falling back to localStorage:', error);
    }
    return JSON.parse(localStorage.getItem('pos_orders'));
  },

  async getOrderDetails(orderId) {
    if (isSupabaseConfigured) {
      const { data: order, error: orderErr } = await supabase.from('orders').select('*').eq('id', orderId).single();
      const { data: items, error: itemsErr } = await supabase.from('order_items').select('*').eq('order_id', orderId);
      if (!orderErr && !itemsErr) {
        return { ...order, items };
      }
      console.error('Supabase error fetching order details:', orderErr || itemsErr);
    }
    const orders = JSON.parse(localStorage.getItem('pos_orders'));
    const order = orders.find(o => o.id === orderId);
    if (!order) return null;

    const allItems = JSON.parse(localStorage.getItem('pos_order_items'));
    const items = allItems.filter(item => item.order_id === orderId);
    return { ...order, items };
  },

  async createOrder(orderData, items) {
    // Buat nomor invoice unik (format: INV-YYYYMMDD-XXXX)
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const invoiceNo = `INV-${dateStr}-${randomSuffix}`;

    if (isSupabaseConfigured) {
      // 1. Insert order
      const { data: order, error: orderErr } = await supabase
        .from('orders')
        .insert([{ ...orderData, invoice_no: invoiceNo }])
        .select();

      if (orderErr) throw orderErr;
      const createdOrder = order[0];

      // 2. Insert order items
      const itemsToInsert = items.map(item => ({
        order_id: createdOrder.id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        notes: item.notes || ''
      }));

      const { error: itemsErr } = await supabase.from('order_items').insert(itemsToInsert);
      if (itemsErr) throw itemsErr;

      // 3. Update stock
      for (const item of items) {
        const { data: prod } = await supabase.from('products').select('stock').eq('id', item.product_id).single();
        if (prod) {
          const newStock = Math.max(0, prod.stock - item.quantity);
          await supabase.from('products').update({ stock: newStock }).eq('id', item.product_id);
        }
      }

      return { ...createdOrder, items: itemsToInsert };
    }

    // LocalStorage Fallback
    const orders = JSON.parse(localStorage.getItem('pos_orders'));
    const allItems = JSON.parse(localStorage.getItem('pos_order_items'));
    const products = JSON.parse(localStorage.getItem('pos_products'));

    const orderId = 'order-' + Date.now();
    const newOrder = {
      id: orderId,
      invoice_no: invoiceNo,
      total_amount: orderData.total_amount,
      payment_method: orderData.payment_method,
      cashier_name: orderData.cashier_name || 'Kasir Utama',
      status: 'COMPLETED',
      created_at: new Date().toISOString()
    };

    const newItems = items.map(item => {
      // Update stock locally
      const prodIndex = products.findIndex(p => p.id === item.product_id);
      if (prodIndex !== -1) {
        products[prodIndex].stock = Math.max(0, products[prodIndex].stock - item.quantity);
      }

      return {
        id: 'item-' + Math.random().toString(36).substr(2, 9),
        order_id: orderId,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        notes: item.notes || '',
        created_at: new Date().toISOString()
      };
    });

    orders.unshift(newOrder); // Transaksi terbaru di atas
    allItems.push(...newItems);

    localStorage.setItem('pos_orders', JSON.stringify(orders));
    localStorage.setItem('pos_order_items', JSON.stringify(allItems));
    localStorage.setItem('pos_products', JSON.stringify(products));

    return { ...newOrder, items: newItems };
  }
};
