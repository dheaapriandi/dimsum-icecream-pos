import { createClient } from '@supabase/supabase-js';

// Ambil URL dan KEY dari environment variable Vite atau fallback langsung ke project Supabase Kedai AA
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://lnpenifjorpysjdfzgfk.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_YwVB5qKu_iW-TiAHRIxlMA_UtEoyWr5';

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
  { id: 'cat-3', name: 'Sate Taichan', slug: 'sate-taichan', icon: 'Flame', color: '#ef4444' },
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
  
  // Sate Taichan Kedai AA (Gambar tunggal)
  { id: 'prod-st-10', name: 'Sate Taichan (10 tusuk)', description: '10 tusuk sate ayam taichan gurih dengan sambal khas dan jeruk limau.', price: 23000, category_id: 'cat-3', stock: 100, active: true, image_url: '/menu-images/sate-taichan.png' },
  { id: 'prod-st-10-nasi', name: 'Sate Taichan (10 tusuk) + Nasi Daun Jeruk', description: '10 tusuk sate taichan gurih disajikan lengkap dengan nasi daun jeruk harum dan sambal pedas segar.', price: 27000, category_id: 'cat-3', stock: 100, active: true, image_url: '/menu-images/sate-taichan.png' },
  { id: 'prod-st-10-lontong', name: 'Sate Taichan (10 tusuk) + Lontong', description: '10 tusuk sate taichan gurih disajikan dengan lontong pulen dan sambal pedas segar.', price: 25000, category_id: 'cat-3', stock: 100, active: true, image_url: '/menu-images/sate-taichan.png' },
  { id: 'prod-st-5', name: 'Sate Taichan (5 tusuk)', description: '5 tusuk sate ayam taichan gurih dengan sambal khas dan jeruk limau.', price: 12000, category_id: 'cat-3', stock: 100, active: true, image_url: '/menu-images/sate-taichan.png' },
  { id: 'prod-st-5-nasi', name: 'Sate Taichan (5 tusuk) + Nasi Daun Jeruk', description: '5 tusuk sate taichan gurih disajikan lengkap dengan nasi daun jeruk harum dan sambal pedas segar.', price: 16000, category_id: 'cat-3', stock: 100, active: true, image_url: '/menu-images/sate-taichan.png' },
  { id: 'prod-st-5-lontong', name: 'Sate Taichan (5 tusuk) + Lontong', description: '5 tusuk sate taichan gurih disajikan dengan lontong pulen dan sambal pedas segar.', price: 14000, category_id: 'cat-3', stock: 100, active: true, image_url: '/menu-images/sate-taichan.png' },
  { id: 'prod-st-nasi', name: 'Nasi Daun Jeruk', description: 'Nasi hangat harum gurih dengan irisan daun jeruk segar.', price: 4000, category_id: 'cat-3', stock: 150, active: true, image_url: '/menu-images/sate-taichan.png' },
  { id: 'prod-st-lontong', name: 'Lontong', description: 'Lontong potong pulen dan kenyal.', price: 2000, category_id: 'cat-3', stock: 100, active: true, image_url: '/menu-images/sate-taichan.png' },
  { id: 'prod-st-sambal', name: 'Ekstra Sambal', description: 'Tambahan sambal taichan pedas gurih segar per cup.', price: 3000, category_id: 'cat-3', stock: 200, active: true, image_url: '/menu-images/sate-taichan.png' },

  // Ice Cream Nyemil
  { id: 'prod-ic-small', name: 'Small Cup (1 Scoop)', description: '1 Scoop Es Krim + Roti + Susu + 2 Topping bebas pilih.', price: 3000, category_id: 'cat-2', stock: 100, active: true, image_url: '/menu-images/ice-cream.jpg' },
  { id: 'prod-ic-medium', name: 'Medium Cup (2 Scoop)', description: '2 Scoop Es Krim + Roti + Susu + 4 Topping bebas pilih.', price: 5000, category_id: 'cat-2', stock: 100, active: true, image_url: '/menu-images/ice-cream.jpg' },
  { id: 'prod-ic-large', name: 'Large Cup (3 Scoop)', description: '3 Scoop Es Krim + Roti + Susu + (Full Topping).', price: 10000, category_id: 'cat-2', stock: 80, active: true, image_url: '/menu-images/ice-cream.jpg' }
];

// Helper inisialisasi localStorage
const initLocalDb = () => {
  const currentProducts = localStorage.getItem('pos_products');
  // Reset database jika kosong, mengandung data demo lama "Siomay Ayam", atau belum memiliki menu baru / Sate Taichan
  if (!currentProducts || currentProducts.includes('Siomay Ayam') || !currentProducts.includes('Es Teh') || !currentProducts.includes('Sate Taichan')) {
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
  // Set default QRIS DANA Azka Media
  const currentQris = localStorage.getItem('pos_static_qris');
  if (!currentQris || currentQris === '') {
    localStorage.setItem('pos_static_qris', '00020101021126570011ID.DANA.WWW011893600915386356433802098635643380303UMI51440014ID.CO.QRIS.WWW0215ID10253868088570303UMI5204899953033605802ID5910Azka Media6012Kab. Cirebon610545166630456D1');
  }
};

initLocalDb();

// ==========================================
// OFFLINE SUPPORT
// - Data terakhir dari Supabase di-cache ke localStorage.
// - Transaksi saat offline masuk antrean dan dikirim otomatis saat online.
// ==========================================

const PENDING_ORDERS_KEY = 'pos_pending_orders';

const readCache = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const writeCache = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn('Gagal menulis cache lokal:', err);
  }
};

// Deteksi error jaringan (bukan error validasi dari Supabase).
const isNetworkError = (err) => {
  if (typeof navigator !== 'undefined' && navigator.onLine === false) return true;
  const message = String(err?.message || '').toLowerCase();
  const code = String(err?.code || '').toUpperCase();
  if (code === 'PGRST116' || code === '23505') return false;
  return (
    err instanceof TypeError ||
    message.includes('failed to fetch') ||
    message.includes('networkerror') ||
    message.includes('network error') ||
    message.includes('load failed') ||
    message.includes('timeout') ||
    message.includes('fetch')
  );
};

const makeLocalOrder = (orderData, items, invoiceNo) => {
  const orders = readCache('pos_orders', []);
  const allItems = readCache('pos_order_items', []);
  const products = readCache('pos_products', []);

  const orderId = 'order-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6);
  const newOrder = {
    id: orderId,
    invoice_no: invoiceNo,
    total_amount: orderData.total_amount,
    amount_paid: orderData.amount_paid || 0,
    change_amount: orderData.change_amount || 0,
    payment_method: orderData.payment_method,
    cashier_name: orderData.cashier_name || 'Kasir Utama',
    status: orderData.status || 'COMPLETED',
    discount_amount: orderData.discount_amount || 0,
    customer_name: orderData.customer_name || '',
    created_at: new Date().toISOString()
  };

  const newItems = items.map((item) => {
    // Kurangi stok di cache agar tampilan tetap akurat saat offline.
    const prodIndex = products.findIndex((p) => p.id === item.product_id);
    if (prodIndex !== -1) {
      products[prodIndex].stock = Math.max(0, products[prodIndex].stock - item.quantity);
    }

    return {
      id: 'item-' + Math.random().toString(36).slice(2, 11),
      order_id: orderId,
      product_id: item.product_id,
      quantity: item.quantity,
      unit_price: item.unit_price,
      notes: item.notes || '',
      created_at: new Date().toISOString()
    };
  });

  orders.unshift(newOrder);
  allItems.push(...newItems);

  writeCache('pos_orders', orders);
  writeCache('pos_order_items', allItems);
  writeCache('pos_products', products);

  return { ...newOrder, items: newItems };
};

const queuePendingOrder = (orderData, items, invoiceNo) => {
  const pending = readCache(PENDING_ORDERS_KEY, []);
  if (!pending.some((p) => p.invoice_no === invoiceNo)) {
    pending.push({
      invoice_no: invoiceNo,
      order: { ...orderData, invoice_no: invoiceNo },
      items,
      attempts: 0,
      created_at: new Date().toISOString()
    });
    writeCache(PENDING_ORDERS_KEY, pending);
  }
  return pending.length;
};

// Kirim satu transaksi ke Supabase. Dipakai saat online maupun saat sync antrean.
const createOrderRemote = async (orderData, items, invoiceNo) => {
  const { data: order, error: orderErr } = await supabase
    .from('orders')
    .insert([{ ...orderData, invoice_no: invoiceNo }])
    .select();

  if (orderErr) throw orderErr;
  const createdOrder = order[0];

  const itemsToInsert = items.map((item) => ({
    order_id: createdOrder.id,
    product_id: item.product_id,
    quantity: item.quantity,
    unit_price: item.unit_price,
    notes: item.notes || ''
  }));

  const { error: itemsErr } = await supabase.from('order_items').insert(itemsToInsert);
  if (itemsErr) throw itemsErr;

  for (const item of items) {
    const { data: prod } = await supabase
      .from('products')
      .select('stock')
      .eq('id', item.product_id)
      .single();
    if (prod) {
      const newStock = Math.max(0, prod.stock - item.quantity);
      await supabase.from('products').update({ stock: newStock }).eq('id', item.product_id);
    }
  }

  // Simpan ke cache agar tetap terlihat jika koneksi putus setelah transaksi.
  const cachedOrders = readCache('pos_orders', []);
  const cachedItems = readCache('pos_order_items', []);
  if (!cachedOrders.some((o) => o.id === createdOrder.id)) {
    cachedOrders.unshift(createdOrder);
    cachedItems.push(...itemsToInsert.map((item, index) => ({
      ...item,
      id: item.id || `local-item-${createdOrder.id}-${index}`
    })));
    writeCache('pos_orders', cachedOrders);
    writeCache('pos_order_items', cachedItems);
  }

  return { ...createdOrder, items: itemsToInsert };
};

const generateInvoiceNo = () => {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `INV-${dateStr}-${randomSuffix}`;
};

// API Abstraksi Database
export const db = {
  // --- Pengguna / Kasir ---
  async getUsers() {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('users').select('*').order('name');
      if (!error) {
        writeCache('pos_users', data);
        return data;
      }
      console.error('Supabase error fetching users, falling back to localStorage:', error);
    }
    return readCache('pos_users', []);
  },

  async login(username, password) {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('username', username.toLowerCase())
          .eq('password', password)
          .single();
        
        if (!error && data) {
          // Simpan user ke cache agar login tetap bisa saat offline.
          const cachedUsers = readCache('pos_users', []);
          writeCache('pos_users', [...cachedUsers.filter((u) => u.id !== data.id), data]);
          return data;
        }

        // Jika error jaringan atau Supabase offline / tabel tidak ada, fallback ke localStorage
        if (error && error.code !== 'PGRST116') {
          console.warn('Supabase offline/error saat login, mencoba data lokal:', error);
        } else if (error && error.code === 'PGRST116') {
          // Cek juga data lokal barangkali akun lokal
          const localUsers = JSON.parse(localStorage.getItem('pos_users') || '[]');
          const localUser = localUsers.find(u => u.username === username.toLowerCase() && u.password === password);
          if (localUser) {
            return localUser;
          }
          throw new Error('Username atau password salah.');
        }
      } catch (err) {
        if (err.message === 'Username atau password salah.') throw err;
        console.warn('Koneksi Supabase gagal, beralih ke data lokal:', err);
      }
    }

    const users = JSON.parse(localStorage.getItem('pos_users') || '[]');
    const user = users.find(u => u.username === username.toLowerCase() && u.password === password);
    if (user) {
      return user;
    }
    throw new Error('Username atau password salah.');
  },

  resetDefaultUsers() {
    localStorage.setItem('pos_users', JSON.stringify(DEFAULT_USERS));
    return DEFAULT_USERS;
  },

  async changePassword(userId, oldPassword, newPassword) {
    if (isSupabaseConfigured) {
      // 1. Verifikasi password lama
      const { data: user, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
        
      if (fetchError || !user) {
        throw new Error('Pengguna tidak ditemukan.');
      }
      
      if (user.password !== oldPassword) {
        throw new Error('Password lama salah.');
      }
      
      // 2. Perbarui password baru
      const { data: updatedUser, error: updateError } = await supabase
        .from('users')
        .update({ password: newPassword })
        .eq('id', userId)
        .select()
        .single();
        
      if (updateError) {
        throw new Error('Gagal memperbarui password di cloud database.');
      }
      
      return updatedUser;
    }

    const users = JSON.parse(localStorage.getItem('pos_users') || '[]');
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) {
      throw new Error('Pengguna tidak ditemukan.');
    }
    if (users[userIndex].password !== oldPassword) {
      throw new Error('Password lama salah.');
    }
    users[userIndex].password = newPassword;
    localStorage.setItem('pos_users', JSON.stringify(users));
    return users[userIndex];
  },

  // --- Kategori ---
  async getCategories() {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.from('categories').select('*').order('name');
      if (!error) {
        writeCache('pos_categories', data);
        return data;
      }
      console.error('Supabase error fetching categories, falling back to localStorage:', error);
    }
    return readCache('pos_categories', []);
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
      if (!error) {
        writeCache('pos_products', data);
        return data;
      }
      console.error('Supabase error fetching products, falling back to localStorage:', error);
    }
    return readCache('pos_products', []);
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
        const mapped = data.map(order => ({
          ...order,
          items: (order.order_items || []).map(item => {
            const prod = products.find(p => p.id === item.product_id);
            return {
              ...item,
              product_name: prod ? prod.name : `Produk #${item.product_id}`
            };
          })
        }));

        // Cache untuk mode offline (tanpa field items terpisah).
        writeCache('pos_orders', mapped.map(({ items: _items, ...order }) => order));
        writeCache(
          'pos_order_items',
          mapped.flatMap(order =>
            (order.items || []).map(({ product_name: _productName, ...item }) => item)
          )
        );

        return mapped;
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
    const invoiceNo = generateInvoiceNo();

    if (isSupabaseConfigured) {
      try {
        return await createOrderRemote(orderData, items, invoiceNo);
      } catch (err) {
        if (!isNetworkError(err)) throw err;
        // Koneksi putus: simpan transaksi lokal + masukkan antrean sinkronisasi.
        console.warn('Supabase tidak terjangkau, transaksi disimpan offline:', err);
        queuePendingOrder(orderData, items, invoiceNo);
      }
    }

    return makeLocalOrder(orderData, items, invoiceNo);
  },

  // Jumlah transaksi offline yang belum terkirim ke Supabase.
  getPendingCount() {
    return readCache(PENDING_ORDERS_KEY, []).length;
  },

  // Kirim transaksi offline ke Supabase. Dipanggil otomatis oleh App.
  async syncPendingOrders() {
    if (!isSupabaseConfigured) return 0;

    const pending = readCache(PENDING_ORDERS_KEY, []);
    if (pending.length === 0) return 0;

    let synced = 0;
    let networkDown = false;
    const remaining = [];

    for (const entry of pending) {
      if (networkDown) {
        remaining.push(entry);
        continue;
      }

      try {
        // Cegah duplikasi jika percobaan sebelumnya sudah masuk sebagian.
        const { data: existing, error: checkErr } = await supabase
          .from('orders')
          .select('id')
          .eq('invoice_no', entry.invoice_no)
          .maybeSingle();
        if (checkErr) throw checkErr;

        if (!existing) {
          await createOrderRemote(entry.order, entry.items, entry.invoice_no);
        }
        synced++;
      } catch (err) {
        if (isNetworkError(err)) {
          networkDown = true;
          remaining.push(entry);
          continue;
        }

        const attempts = (entry.attempts || 0) + 1;
        console.warn(
          `Transaksi offline ${entry.invoice_no} ditolak server (percobaan ${attempts}):`,
          err
        );
        // Simpan maksimal 3 percobaan agar antrean tidak macet selamanya.
        if (attempts < 3) remaining.push({ ...entry, attempts });
      }
    }

    writeCache(PENDING_ORDERS_KEY, remaining);
    return synced;
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

export function getCRC16(data) {
  let crc = 0xFFFF; // Initial value
  const polynomial = 0x1021;

  for (let i = 0; i < data.length; i++) {
    crc ^= (data.charCodeAt(i) << 8);
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = ((crc << 1) ^ polynomial) & 0xFFFF;
      } else {
        crc = (crc << 1) & 0xFFFF;
      }
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

export function generateDynamicQRIS(staticQris, amount) {
  if (!staticQris) return null;
  let qris = staticQris.trim();
  
  const crcIndex = qris.lastIndexOf('6304');
  if (crcIndex !== -1 && crcIndex >= qris.length - 12) {
    qris = qris.substring(0, crcIndex);
  }
  
  let fields = [];
  let pos = 0;
  let hasTag54 = false;
  const amountStr = Math.round(amount).toString();
  const amountVal = amountStr;
  
  while (pos < qris.length) {
    if (pos + 4 > qris.length) break;
    const tag = qris.substring(pos, pos + 2);
    const lenStr = qris.substring(pos + 2, pos + 4);
    const len = parseInt(lenStr, 10);
    if (isNaN(len) || pos + 4 + len > qris.length) break;
    
    const val = qris.substring(pos + 4, pos + 4 + len);
    
    if (tag === '54') {
      fields.push({ tag, lenStr: amountVal.length.toString().padStart(2, '0'), val: amountVal });
      hasTag54 = true;
    } else {
      fields.push({ tag, lenStr, val });
    }
    pos += 4 + len;
  }
  
  if (!hasTag54) {
    const newField = { tag: '54', lenStr: amountVal.length.toString().padStart(2, '0'), val: amountVal };
    const tag53Index = fields.findIndex(f => f.tag === '53');
    if (tag53Index !== -1) {
      fields.splice(tag53Index + 1, 0, newField);
    } else {
      const tag58Index = fields.findIndex(f => f.tag === '58');
      if (tag58Index !== -1) {
        fields.splice(tag58Index, 0, newField);
      } else {
        fields.push(newField);
      }
    }
  }
  
  let reconstructed = '';
  for (const f of fields) {
    reconstructed += f.tag + f.lenStr + f.val;
  }
  
  reconstructed += '6304';
  const crc = getCRC16(reconstructed);
  return reconstructed + crc;
}
