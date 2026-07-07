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

const DEFAULT_USERS = [
  { id: 'user-1', name: 'Cindy Apriandi', username: 'cindy', password: '123', role: 'admin' },
  { id: 'user-2', name: 'Staff Kasir', username: 'kasir', password: '123', role: 'cashier' }
];

const DEFAULT_CATEGORIES = [
  { id: 'cat-1', name: 'Dimsum AA', slug: 'dimsum-aa', icon: 'Utensils', color: '#f97316' },
  { id: 'cat-2', name: 'Ice Cream Nyemil', slug: 'ice-cream-nyemil', icon: 'IceCream', color: '#ec4899' }
];

const DEFAULT_PRODUCTS = [
  // Dimsum Original
  { id: 'prod-ds-orig-1', name: 'Dimsum Original Satuan', description: '1 Pcs dimsum kukus original khas Kedai Dimsum AA.', price: 2000, category_id: 'cat-1', stock: 150, active: true, image_url: '/menu-images/dimsum-original.jpg' },
  { id: 'prod-ds-orig-5', name: 'Dimsum Original 1 Porsi (Isi 5)', description: '5 Pcs dimsum kukus original khas Kedai Dimsum AA.', price: 10000, category_id: 'cat-1', stock: 60, active: true, image_url: '/menu-images/dimsum-original.jpg' },
  
  // Dimsum Mentai
  { id: 'prod-ds-mentai-4', name: 'Dimsum Mentai Isi 4', description: '4 Pcs dimsum kukus dengan topping saus mentai bakar lezat khas AA.', price: 16000, category_id: 'cat-1', stock: 40, active: true, image_url: '/menu-images/dimsum-mentai.jpg' },
  { id: 'prod-ds-mentai-6', name: 'Dimsum Mentai Isi 6', description: '6 Pcs dimsum kukus dengan topping saus mentai bakar lezat khas AA.', price: 23000, category_id: 'cat-1', stock: 30, active: true, image_url: '/menu-images/dimsum-mentai.jpg' },
  
  // Dimsum Goreng
  { id: 'prod-ds-goreng-keju-3', name: 'Dimsum Goreng Keju Lumer (Isi 3)', description: '3 Pcs dimsum goreng renyah dengan isian keju lumer di dalamnya.', price: 10000, category_id: 'cat-1', stock: 45, active: true, image_url: '/menu-images/dimsum-goreng.jpg' },
  { id: 'prod-ds-goreng-mentai-keju-4', name: 'Dimsum Goreng Mentai Keju Lumer (Isi 4)', description: '4 Pcs dimsum goreng isi keju lumer disiram saus mentai bakar.', price: 18000, category_id: 'cat-1', stock: 30, active: true, image_url: '/menu-images/dimsum-goreng-mentai.jpg' },
  
  // Minuman / Tambahan (Kategori Dimsum AA)
  { id: 'prod-ds-esteh', name: 'Es Teh', description: 'Es teh manis segar pelepas dahaga.', price: 2500, category_id: 'cat-1', stock: 200, active: true, image_url: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&auto=format&fit=crop&q=60' },
  
  // Ice Cream Nyemil
  { id: 'prod-ic-small', name: 'Small Cup (1 Scoop)', description: '1 Scoop Es Krim + Roti + Susu + 2 Topping bebas pilih.', price: 3000, category_id: 'cat-2', stock: 100, active: true, image_url: '/menu-images/ice-cream.jpg' },
  { id: 'prod-ic-medium', name: 'Medium Cup (2 Scoop)', description: '2 Scoop Es Krim + Roti + Susu + 4 Topping bebas pilih.', price: 5000, category_id: 'cat-2', stock: 100, active: true, image_url: '/menu-images/ice-cream.jpg' },
  { id: 'prod-ic-large', name: 'Large Cup (3 Scoop)', description: '3 Scoop Es Krim + Roti + Susu + (Full Topping).', price: 10000, category_id: 'cat-2', stock: 80, active: true, image_url: '/menu-images/ice-cream.jpg' }
];

// Helper inisialisasi localStorage
const initLocalDb = () => {
  const currentProducts = localStorage.getItem('pos_products');
  // Reset database jika kosong, mengandung data demo lama "Siomay Ayam", atau belum memiliki menu baru / harga baru / gambar
  if (!currentProducts || currentProducts.includes('Siomay Ayam') || !currentProducts.includes('Es Teh') || !currentProducts.includes('"price":16000') || !currentProducts.includes('unsplash.com')) {
    localStorage.setItem('pos_categories', JSON.stringify(DEFAULT_CATEGORIES));
    localStorage.setItem('pos_products', JSON.stringify(DEFAULT_PRODUCTS));
    localStorage.setItem('pos_orders', JSON.stringify([]));
    localStorage.setItem('pos_order_items', JSON.stringify([]));
    localStorage.setItem('pos_users', JSON.stringify(DEFAULT_USERS));
  } else {
    // Jika sudah ada tapi ingin memastikan kategori baru terupdate
    if (!localStorage.getItem('pos_categories')) {
      localStorage.setItem('pos_categories', JSON.stringify(DEFAULT_CATEGORIES));
    }
    if (!localStorage.getItem('pos_users')) {
      localStorage.setItem('pos_users', JSON.stringify(DEFAULT_USERS));
    }
  }
};

initLocalDb();

// API Abstraksi Database
export const db = {
  // --- Pengguna / Kasir ---
  async getUsers() {
    return JSON.parse(localStorage.getItem('pos_users') || '[]');
  },

  async login(username, password) {
    const users = JSON.parse(localStorage.getItem('pos_users') || '[]');
    const user = users.find(u => u.username === username.toLowerCase() && u.password === password);
    if (user) {
      return user;
    }
    throw new Error('Username atau password salah.');
  },

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
    let products = [];
    if (isSupabaseConfigured) {
      try {
        const { data: prods } = await supabase.from('products').select('*');
        products = prods || [];
      } catch (e) {
        console.error(e);
      }
    } else {
      products = JSON.parse(localStorage.getItem('pos_products')) || [];
    }

    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .order('created_at', { ascending: false });

      if (!error) {
        return data.map(order => ({
          ...order,
          items: (order.order_items || []).map(item => {
            const prod = products.find(p => p.id === item.product_id);
            return {
              ...item,
              product_name: prod ? prod.name : `Produk #${item.product_id}`
            };
          })
        }));
      }
      console.error('Supabase error fetching orders, falling back to localStorage:', error);
    }
    
    const orders = JSON.parse(localStorage.getItem('pos_orders')) || [];
    const allItems = JSON.parse(localStorage.getItem('pos_order_items')) || [];
    
    return orders.map(order => {
      const items = allItems.filter(item => item.order_id === order.id);
      return {
        ...order,
        items: items.map(item => {
          const prod = products.find(p => p.id === item.product_id);
          return {
            ...item,
            product_name: prod ? prod.name : `Produk #${item.product_id}`
          };
        })
      };
    });
  },

  async getOrderDetails(orderId) {
    let products = [];
    if (isSupabaseConfigured) {
      try {
        const { data: prods } = await supabase.from('products').select('*');
        products = prods || [];
      } catch (e) {
        console.error(e);
      }
    } else {
      products = JSON.parse(localStorage.getItem('pos_products')) || [];
    }

    if (isSupabaseConfigured) {
      const { data: order, error: orderErr } = await supabase.from('orders').select('*').eq('id', orderId).single();
      const { data: items, error: itemsErr } = await supabase.from('order_items').select('*').eq('order_id', orderId);
      if (!orderErr && !itemsErr) {
        const itemsWithNames = (items || []).map(item => {
          const prod = products.find(p => p.id === item.product_id);
          return {
            ...item,
            product_name: prod ? prod.name : `Produk #${item.product_id}`
          };
        });
        return { ...order, items: itemsWithNames };
      }
      console.error('Supabase error fetching order details:', orderErr || itemsErr);
    }
    
    const orders = JSON.parse(localStorage.getItem('pos_orders')) || [];
    const order = orders.find(o => o.id === orderId);
    if (!order) return null;

    const allItems = JSON.parse(localStorage.getItem('pos_order_items')) || [];
    const items = allItems.filter(item => item.order_id === orderId);
    
    const itemsWithNames = items.map(item => {
      const prod = products.find(p => p.id === item.product_id);
      return {
        ...item,
        product_name: prod ? prod.name : `Produk #${item.product_id}`
      };
    });
    
    return { ...order, items: itemsWithNames };
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
      status: orderData.status || 'COMPLETED',
      discount_amount: orderData.discount_amount || 0,
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
  },

  async updateOrder(orderId, updates) {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('orders').update(updates).eq('id', orderId).select();
      if (error) throw error;
      return data[0];
    }

    const orders = JSON.parse(localStorage.getItem('pos_orders')) || [];
    const index = orders.findIndex(o => o.id === orderId);
    if (index !== -1) {
      orders[index] = { ...orders[index], ...updates };
      localStorage.setItem('pos_orders', JSON.stringify(orders));
      return orders[index];
    }
    throw new Error('Order not found');
  },

  async deleteOrder(orderId) {
    if (isSupabaseConfigured) {
      // Dapatkan items untuk restorasi stok
      const { data: items } = await supabase.from('order_items').select('*').eq('order_id', orderId);
      if (items) {
        for (const item of items) {
          const { data: prod } = await supabase.from('products').select('stock').eq('id', item.product_id).single();
          if (prod) {
            const newStock = prod.stock + item.quantity;
            await supabase.from('products').update({ stock: newStock }).eq('id', item.product_id);
          }
        }
      }
      
      const { error } = await supabase.from('orders').delete().eq('id', orderId);
      if (error) throw error;
      return true;
    }

    // LocalStorage Fallback
    const orders = JSON.parse(localStorage.getItem('pos_orders')) || [];
    const allItems = JSON.parse(localStorage.getItem('pos_order_items')) || [];
    const products = JSON.parse(localStorage.getItem('pos_products')) || [];

    const orderItems = allItems.filter(item => item.order_id === orderId);
    
    // Kembalikan stok
    orderItems.forEach(item => {
      const prodIndex = products.findIndex(p => p.id === item.product_id);
      if (prodIndex !== -1) {
        products[prodIndex].stock += item.quantity;
      }
    });

    const filteredOrders = orders.filter(o => o.id !== orderId);
    const filteredItems = allItems.filter(item => item.order_id !== orderId);

    localStorage.setItem('pos_orders', JSON.stringify(filteredOrders));
    localStorage.setItem('pos_order_items', JSON.stringify(filteredItems));
    localStorage.setItem('pos_products', JSON.stringify(products));
    return true;
  }
};
