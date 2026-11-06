import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import CashierView from './components/CashierView';
import KitchenView from './components/KitchenView';
import DashboardView from './components/DashboardView';
import InventoryView from './components/InventoryView';
import SettingsView from './components/SettingsView';
import ReceiptModal from './components/ReceiptModal';
import { db, isSupabaseConfigured, supabase } from './supabase';
import { Database, ShoppingBag, Settings, WifiOff } from 'lucide-react';
import { Capacitor } from '@capacitor/core';

function App() {
  const [activeView, setActiveView] = useState('cashier');
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);

  // Akses web dibuka: aplikasi dapat dijalankan langsung di browser.
  const isWebAccessAllowed = true;

  // Auth States
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('active_cashier');
    return saved ? JSON.parse(saved) : null;
  });
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const handleUpdateUserSession = (updatedUser) => {
    setCurrentUser(updatedUser);
    localStorage.setItem('active_cashier', JSON.stringify(updatedUser));
  };

  const handleLogin = async (username, password) => {
    try {
      const user = await db.login(username, password);
      localStorage.setItem('active_cashier', JSON.stringify(user));
      setCurrentUser(user);
      if (db.addAuditLog) {
        db.addAuditLog({ action: 'LOGIN', detail: `Login sebagai ${user.username}`, user_id: user.id, user_name: user.name, user_role: user.role });
      }
    } catch (err) {
      if (db.addAuditLog) {
        db.addAuditLog({ action: 'LOGIN_FAILED', detail: `Gagal login username: ${username}`, user_name: username, user_role: '' });
      }
      alert(err.message || 'Login gagal.');
    }
  };

  const handleLogout = () => {
    if (currentUser && db.addAuditLog) {
      db.addAuditLog({ action: 'LOGOUT', detail: 'Logout dari sistem', user_id: currentUser.id, user_name: currentUser.name, user_role: currentUser.role });
    }
    localStorage.removeItem('active_cashier');
    setCurrentUser(null);
    setActiveView('cashier');
    setLoginUsername('');
    setLoginPassword('');
  };
  
  // Database States
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  
  // App States
  const [isLoading, setIsLoading] = useState(true);
  const [currentReceiptOrder, setCurrentReceiptOrder] = useState(null);
  const [pendingSyncCount, setPendingSyncCount] = useState(() =>
    typeof db.getPendingCount === 'function' ? db.getPendingCount() : 0
  );

  const syncProductImages = async () => {
    try {
      if (isSupabaseConfigured && supabase) {
        // Sync Supabase online
        const { data: prods } = await supabase.from('products').select('id, image_url');
        if (prods) {
          const updates = [];
          prods.forEach(p => {
            let newUrl = '';
            if (p.id === 'prod-ds-goreng-mentai-keju-4') {
              if (p.image_url !== '/menu-images/dimsum-goreng-mentai.jpg') {
                newUrl = '/menu-images/dimsum-goreng-mentai.jpg';
              }
            } else if (p.image_url && p.image_url.includes('unsplash.com')) {
              if (p.id.includes('orig')) newUrl = '/menu-images/dimsum-original.jpg';
              else if (p.id.includes('mentai')) newUrl = '/menu-images/dimsum-mentai.jpg';
              else if (p.id.includes('goreng')) newUrl = '/menu-images/dimsum-goreng.jpg';
              else if (p.id.includes('prod-ic-')) newUrl = '/menu-images/ice-cream.jpg';
            }
            if (newUrl) {
              updates.push(supabase.from('products').update({ image_url: newUrl }).eq('id', p.id));
            }
          });
          if (updates.length > 0) {
            await Promise.all(updates);
          }
        }
      }
      
      // Sync LocalStorage
      const localProds = localStorage.getItem('pos_products');
      if (localProds) {
        const products = JSON.parse(localProds);
        let updated = false;
        products.forEach(p => {
          if (p.id === 'prod-ds-goreng-mentai-keju-4') {
            if (p.image_url !== '/menu-images/dimsum-goreng-mentai.jpg') {
              p.image_url = '/menu-images/dimsum-goreng-mentai.jpg';
              updated = true;
            }
          } else if (p.image_url && p.image_url.includes('unsplash.com')) {
            if (p.id.includes('orig')) p.image_url = '/menu-images/dimsum-original.jpg';
            else if (p.id.includes('mentai')) p.image_url = '/menu-images/dimsum-mentai.jpg';
            else if (p.id.includes('goreng')) p.image_url = '/menu-images/dimsum-goreng.jpg';
            else if (p.id.includes('prod-ic-')) p.image_url = '/menu-images/ice-cream.jpg';
            updated = true;
          }
        });
        if (updated) {
          localStorage.setItem('pos_products', JSON.stringify(products));
        }
      }
    } catch (e) {
      console.error('Gagal mensinkronkan gambar produk:', e);
    }
  };

  // Load Data awal
  const loadData = async (isBackground = false) => {
    try {
      if (!isBackground) setIsLoading(true);
      const [cats, prods, ords] = await Promise.all([
        db.getCategories(),
        db.getProducts(),
        db.getOrders()
      ]);
      setCategories(cats || []);
      setProducts(prods || []);
      setOrders(ords || []);
    } catch (err) {
      console.error('Gagal memuat data:', err);
    } finally {
      if (!isBackground) setIsLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      await syncProductImages();
      await loadData();
    };
    init();
  }, []);

  // Polling data otomatis setiap 5 detik untuk sinkronisasi dapur & laporan
  useEffect(() => {
    let interval = null;
    if (activeView === 'kitchen' || activeView === 'dashboard') {
      interval = setInterval(() => {
        loadData(true);
      }, 5000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeView]);

  // Kirim antrean transaksi offline ke Supabase (otomatis tiap 30 detik & saat online)
  useEffect(() => {
    let disposed = false;

    const syncOfflineOrders = async () => {
      try {
        const synced = await db.syncPendingOrders();
        if (disposed) return;
        setPendingSyncCount(db.getPendingCount());
        if (synced > 0) await loadData(true);
      } catch (err) {
        if (!disposed) {
          setPendingSyncCount(db.getPendingCount());
          console.warn('Sinkronisasi transaksi offline gagal:', err);
        }
      }
    };

    syncOfflineOrders();
    const interval = setInterval(syncOfflineOrders, 30000);
    window.addEventListener('online', syncOfflineOrders);

    return () => {
      disposed = true;
      clearInterval(interval);
      window.removeEventListener('online', syncOfflineOrders);
    };
  }, []);

  // Jaga layar tetap menyala (web selalu aktif)
  useEffect(() => {
    let wakeLock = null;
    const requestWakeLock = async () => {
      try {
        if ('wakeLock' in navigator) {
          wakeLock = await navigator.wakeLock.request('screen');
        }
      } catch (err) {
        console.warn('Wake Lock tidak tersedia/gagal:', err);
      }
    };
    requestWakeLock();
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') requestWakeLock();
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (wakeLock) {
        wakeLock.release().catch(() => {});
      }
    };
  }, []);

  // Callback Transaksi baru
  const handleCreateOrder = async (orderData, items) => {
    try {
      const completedOrder = await db.createOrder(orderData, items);
      setPendingSyncCount(db.getPendingCount());
      
      // Muat ulang data terbaru (agar stok & riwayat sinkron)
      await loadData(true);
      
      // Dapatkan detail struk lengkap untuk ditampilkan di modal struk
      const orderDetails = await db.getOrderDetails(completedOrder.id);
      
      // Set modal struk agar terbuka otomatis
      setCurrentReceiptOrder(orderDetails);
      return completedOrder;
    } catch (err) {
      console.error('Gagal membuat transaksi:', err);
      throw err;
    }
  };

  const handleAddProduct = async (product) => {
    try {
      await db.addProduct(product);
      if (currentUser && db.addAuditLog) {
        db.addAuditLog({ action: 'ADD_PRODUCT', detail: `Tambah produk: ${product.name}`, user_id: currentUser.id, user_name: currentUser.name, user_role: currentUser.role });
      }
      await loadData(true);
    } catch (err) {
      console.error('Gagal menambah produk:', err);
      throw err;
    }
  };

  // Callback Edit Produk
  const handleUpdateProduct = async (id, updates) => {
    try {
      await db.updateProduct(id, updates);
      if (currentUser && db.addAuditLog) {
        db.addAuditLog({ action: 'UPDATE_PRODUCT', detail: `Edit produk ${id}: ${JSON.stringify(updates)}`, user_id: currentUser.id, user_name: currentUser.name, user_role: currentUser.role });
      }
      await loadData(true);
    } catch (err) {
      console.error('Gagal mengubah produk:', err);
      throw err;
    }
  };

  // Callback Hapus Produk
  const handleDeleteProduct = async (id) => {
    try {
      await db.deleteProduct(id);
      if (currentUser && db.addAuditLog) {
        db.addAuditLog({ action: 'DELETE_PRODUCT', detail: `Hapus produk: ${id}`, user_id: currentUser.id, user_name: currentUser.name, user_role: currentUser.role });
      }
      await loadData(true);
    } catch (err) {
      console.error('Gagal menghapus produk:', err);
      throw err;
    }
  };

  // Callback Edit Transaksi
  const handleUpdateOrder = async (id, updates) => {
    try {
      await db.updateOrder(id, updates);
      if (currentUser && db.addAuditLog) {
        db.addAuditLog({ action: 'UPDATE_ORDER', detail: `Edit transaksi ${id}: ${JSON.stringify(updates)}`, user_id: currentUser.id, user_name: currentUser.name, user_role: currentUser.role });
      }
      await loadData(true);
    } catch (err) {
      console.error('Gagal memperbarui transaksi:', err);
      throw err;
    }
  };

  // Callback Hapus Transaksi
  const handleDeleteOrder = async (id) => {
    try {
      await db.deleteOrder(id);
      if (currentUser && db.addAuditLog) {
        db.addAuditLog({ action: 'DELETE_ORDER', detail: `Hapus transaksi: ${id}`, user_id: currentUser.id, user_name: currentUser.name, user_role: currentUser.role });
      }
      await loadData(true);
    } catch (err) {
      console.error('Gagal menghapus transaksi:', err);
      throw err;
    }
  };

  // Callback Cetak Ulang Struk
  const handleReprintReceipt = async (orderId) => {
    try {
      const orderDetails = await db.getOrderDetails(orderId);
      setCurrentReceiptOrder(orderDetails);
    } catch (err) {
      console.error('Gagal mencetak ulang struk:', err);
      alert('Gagal mengambil data struk.');
    }
  };

  // Switch View Render
  const renderView = () => {
    switch (activeView) {
      case 'cashier':
        return (
          <CashierView 
            products={products} 
            categories={categories} 
            orders={orders}
            onCreateOrder={handleCreateOrder} 
            currentUser={currentUser}
          />
        );
      case 'kitchen':
        return (
          <KitchenView 
            orders={orders} 
            onUpdateOrderStatus={handleUpdateOrder}
          />
        );
      case 'dashboard':
        return (
          <DashboardView 
            orders={orders} 
            products={products}
            isAdmin={currentUser && currentUser.role === 'admin'}
            onReprintReceipt={handleReprintReceipt}
            onUpdateOrder={handleUpdateOrder}
            onDeleteOrder={handleDeleteOrder}
          />
        );
      case 'inventory':
        if (currentUser && currentUser.role !== 'admin') {
          return <CashierView products={products} categories={categories} orders={orders} onCreateOrder={handleCreateOrder} currentUser={currentUser} />;
        }
        return (
          <InventoryView 
            products={products}
            categories={categories}
            onAddProduct={handleAddProduct}
            onUpdateProduct={handleUpdateProduct}
            onDeleteProduct={handleDeleteProduct}
          />
        );
      case 'settings':
        return (
          <SettingsView 
            currentUser={currentUser}
            onUpdateUser={handleUpdateUserSession}
          />
        );
      default:
        return <div>View tidak ditemukan</div>;
    }
  };

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="loading-logo-container">
          <img src="/logo.png" alt="Logo Kedai AA" className="loading-logo-img" />
          <h2>Kedai AA</h2>
          <p>Memuat sistem kasir...</p>
        </div>
        <style>{`
          .loading-screen {
            height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #f8fafc;
          }
          .loading-logo-container {
            text-align: center;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 12px;
          }
          .loading-logo-img {
            width: 80px;
            height: 80px;
            object-fit: contain;
            animation: pulse-logo 2s infinite ease-in-out;
          }
          .loading-logo-container h2 {
            font-size: 24px;
            font-weight: 700;
            background: linear-gradient(to right, #0f172a, #64748b);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
          }
          .loading-logo-container p {
            font-size: 13px;
            color: #64748b;
          }
          @keyframes pulse-logo {
            0% { transform: scale(1); opacity: 0.9; }
            50% { transform: scale(1.05); opacity: 1; }
            100% { transform: scale(1); opacity: 0.9; }
          }
        `}</style>
      </div>
    );
  }

  // TAMPILAN PROTEKSI WEB AKSES (OPSI 2: KUNCI TOTAL - KHUSUS APLIKASI ANDROID APK)
  if (!isWebAccessAllowed) {
    return (
      <div className="private-screen-overlay">
        <div className="private-card glass-panel">
          <div className="private-icon-wrapper">
            <img src="/logo.png" alt="Logo Kedai AA" className="private-logo" />
          </div>
          <h2>403 • AKSES DITOLAK</h2>
          <div className="private-badge" style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)', color: '#f87171', borderColor: 'rgba(239, 68, 68, 0.3)' }}>
            Akses Web Browser Dinonaktifkan
          </div>
          <p className="private-desc" style={{ marginTop: '16px', lineHeight: '1.6' }}>
            Situs web ini bersifat <strong>tertutup & private</strong>. Sistem POS hanya dapat diakses melalui <strong>Aplikasi Android Resmi</strong> pada tablet / HP kasir Kedai AA.
          </p>
          <div className="private-notice-box" style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px dashed rgba(255, 255, 255, 0.15)', padding: '14px', borderRadius: '12px', margin: '18px 0', fontSize: '13px' }}>
            <span>🔒 Akses browser publik ditutup untuk menjamin keamanan & integritas data kasir.</span>
          </div>

          <div className="private-footer" style={{ marginTop: '24px', fontSize: '11px', color: '#64748b' }}>
            &copy; {new Date().getFullYear()} Kedai Dimsum AA & Ice Cream Nyemil
          </div>
        </div>

        <style>{`
          .private-screen-overlay {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: radial-gradient(circle at center, #1e293b 0%, #090d16 100%);
            padding: 20px;
            color: #ffffff;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          }
          .private-card {
            width: 100%;
            max-width: 420px;
            background: rgba(15, 23, 42, 0.92) !important;
            border: 1px solid rgba(255, 255, 255, 0.08) !important;
            box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.7) !important;
            border-radius: 24px;
            padding: 40px 28px;
            text-align: center;
            display: flex;
            flex-direction: column;
            align-items: center;
          }
          .private-icon-wrapper {
            margin-bottom: 20px;
          }
          .private-logo {
            width: 88px;
            height: 88px;
            object-fit: contain;
            filter: drop-shadow(0 4px 14px rgba(249, 115, 22, 0.35));
          }
          .private-card h2 {
            font-size: 22px;
            font-weight: 800;
            letter-spacing: 1px;
            color: #f1f5f9;
            margin: 0 0 10px 0;
          }
          .private-badge {
            display: inline-block;
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            padding: 5px 12px;
            border-radius: 9999px;
            border: 1px solid transparent;
          }
          .private-desc {
            font-size: 13.5px;
            color: #94a3b8;
            margin: 0;
          }
        `}</style>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="login-screen-overlay">
        <div className="login-card glass-panel">
          <div className="login-header">
            <img src="/logo.png" alt="Logo Kedai AA" className="login-logo" />
            <h2>SISTEM KASIR KEDAI AA</h2>
            <p>Silakan masuk menggunakan akun kasir Anda</p>
          </div>

          <form onSubmit={(e) => {
            e.preventDefault();
            handleLogin(loginUsername, loginPassword);
          }} className="login-form">
            <div className="form-group-login">
              <label>Nama Kasir / Username</label>
              <input 
                type="text" 
                name="username" 
                value={loginUsername}
                onChange={(e) => setLoginUsername(e.target.value)}
                placeholder="Masukkan username..." 
                required 
                className="login-input" 
              />
            </div>
            
            <div className="form-group-login">
              <label>Password</label>
              <input 
                type="password" 
                name="password" 
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="Masukkan password..." 
                required 
                className="login-input" 
              />
            </div>

            <button type="submit" className="login-btn-submit">
              <span>Masuk Kasir</span>
            </button>
          </form>

          <div className="login-footer">
            <span>Kedai Dimsum AA & Ice Cream Nyemil</span>
          </div>
        </div>

        <style>{`
          .login-screen-overlay {
            height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #fffcf6 0%, #fef3c7 50%, #ffedd5 100%);
            padding: 20px;
          }
          .login-card {
            width: 100%;
            max-width: 400px;
            background: rgba(255, 255, 255, 0.85) !important;
            border: 1px solid var(--border-color) !important;
            box-shadow: var(--shadow-lg) !important;
            padding: 32px;
            display: flex;
            flex-direction: column;
            gap: 24px;
            border-radius: 24px !important;
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
          }
          .login-header {
            text-align: center;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 8px;
          }
          .login-logo {
            width: 70px;
            height: 70px;
            object-fit: contain;
            margin-bottom: 8px;
            filter: drop-shadow(0 4px 6px rgba(249, 115, 22, 0.15));
          }
          .login-header h2 {
            font-size: 18px;
            font-weight: 800;
            color: #0f172a;
            letter-spacing: 0.5px;
          }
          .login-header p {
            font-size: 12px;
            color: #64748b;
          }
          .login-form {
            display: flex;
            flex-direction: column;
            gap: 16px;
          }
          .form-group-login {
            display: flex;
            flex-direction: column;
            gap: 6px;
          }
          .form-group-login label {
            font-size: 12px;
            font-weight: 600;
            color: #475569;
          }
          .login-input {
            width: 100%;
            padding: 12px 14px;
            background: #ffffff;
            border: 1px solid var(--border-color);
            border-radius: 12px;
            font-size: 14px;
            outline: none;
            color: #0f172a;
            transition: all 0.2s;
          }
          .login-input:focus {
            border-color: var(--primary);
            box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.15);
          }
          .login-btn-submit {
            margin-top: 10px;
            padding: 14px;
            background: var(--primary);
            border: none;
            color: #ffffff;
            font-weight: 700;
            font-size: 14px;
            border-radius: 12px;
            cursor: pointer;
            transition: all 0.2s;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 12px rgba(249, 115, 22, 0.2);
          }
          .login-btn-submit:hover {
            transform: translateY(-1px);
            box-shadow: 0 6px 16px rgba(249, 115, 22, 0.3);
          }
          .login-footer {
            text-align: center;
            font-size: 11px;
            color: #94a3b8;
            font-weight: 500;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* SIDEBAR NAVIGATION */}
      <Sidebar 
        activeView={activeView} 
        setActiveView={setActiveView} 
        currentUser={currentUser}
        onLogout={handleLogout}
        onAvatarClick={() => setIsAccountMenuOpen(true)}
      />

      {/* PANEL UTAMA */}
      <main className="main-content">
        {/* AREA TAMPILAN AKTIF */}
        {renderView()}
      </main>

      {/* MODAL STRUK CETAKAN */}
      {currentReceiptOrder && (
        <ReceiptModal 
          order={currentReceiptOrder} 
          onClose={() => setCurrentReceiptOrder(null)} 
        />
      )}

      <style>{`
        .connection-status-banner {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: rgba(0, 0, 0, 0.02);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 10px 16px;
          margin-bottom: 20px;
          font-size: 12px;
        }

        .status-info {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .icon-connected {
          color: rgb(34, 197, 94);
        }

        .icon-mock {
          color: var(--yellow);
        }

        .text-connected {
          color: rgb(34, 197, 94);
        }

        .text-mock {
          color: var(--yellow);
        }

        .setup-tip {
          color: var(--text-muted);
          font-style: italic;
        }

        .setup-tip code {
          background: rgba(0, 0, 0, 0.04);
          padding: 2px 6px;
          border-radius: 4px;
          color: var(--text-primary);
        }

        .pending-sync-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 4px 10px;
          border-radius: 999px;
          background: rgba(234, 179, 8, 0.12);
          border: 1px solid rgba(234, 179, 8, 0.35);
          color: #a16207;
          font-weight: 600;
          white-space: nowrap;
        }

        @media (max-width: 576px) {
          .connection-status-banner {
            flex-direction: column;
            align-items: flex-start;
            gap: 6px;
          }
        }

        /* ACCOUNT MENU POPUP/MODAL */
        .account-menu-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2000;
          padding: 16px;
          backdrop-filter: blur(4px);
        }

        .account-menu-card {
          width: 100%;
          max-width: 300px;
          background: #ffffff !important;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          box-shadow: 0 10px 25px -5px rgba(0,0,0,0.15), 0 8px 10px -6px rgba(0,0,0,0.1);
          color: #0f172a !important;
          display: flex;
          flex-direction: column;
          padding: 20px;
          animation: fade-in-scale 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes fade-in-scale {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }

        .account-menu-header {
          display: flex;
          align-items: center;
          gap: 12px;
          border-bottom: 1px solid #f1f5f9;
          padding-bottom: 16px;
          position: relative;
        }

        .account-menu-avatar {
          width: 42px;
          height: 42px;
          background: #ffedd5;
          color: #ea580c;
          font-weight: 800;
          font-size: 16px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid #fed7aa;
        }

        .account-menu-info {
          display: flex;
          flex-direction: column;
          text-align: left;
        }

        .account-menu-info h4 {
          font-size: 14px;
          font-weight: 700;
          color: #0f172a;
          margin: 0;
        }

        .account-menu-info span {
          font-size: 11px;
          color: #64748b;
          font-weight: 600;
        }

        .account-menu-close {
          position: absolute;
          right: 0;
          top: 0;
          background: transparent;
          border: none;
          color: #94a3b8;
          font-size: 18px;
          cursor: pointer;
        }

        .account-menu-close:hover {
          color: #0f172a;
        }

        .account-menu-body {
          display: flex;
          flex-direction: column;
          gap: 8px;
          padding: 16px 0;
        }

        .account-menu-item-btn {
          width: 100%;
          padding: 10px 12px;
          border-radius: 10px;
          border: 1px solid transparent;
          background: #f8fafc;
          color: #475569;
          font-weight: 600;
          font-size: 13px;
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          transition: all 0.2s ease;
          box-sizing: border-box;
          justify-content: flex-start;
          text-align: left;
        }

        .account-menu-item-btn:hover {
          background: #f1f5f9;
          color: #0f172a;
        }

        .account-menu-item-btn.active {
          background: #ffedd5;
          border-color: #ffd8a8;
          color: #ea580c;
        }

        .account-menu-footer {
          border-top: 1px solid #f1f5f9;
          padding-top: 14px;
        }

        .account-menu-logout-btn {
          width: 100%;
          padding: 10px;
          border-radius: 10px;
          border: 1px solid #fca5a5;
          background: #fef2f2;
          color: #ef4444;
          font-weight: 700;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
          box-sizing: border-box;
        }

        .account-menu-logout-btn:hover {
          background: #fee2e2;
        }
      `}</style>

      {/* MODAL MENU AKUN (MOBILE & DESKTOP COMPATIBLE) */}
      {isAccountMenuOpen && (
        <div className="account-menu-overlay" onClick={() => setIsAccountMenuOpen(false)}>
          <div className="account-menu-card glass-panel" onClick={(e) => e.stopPropagation()}>
            <div className="account-menu-header">
              <div className="account-menu-avatar">
                {currentUser ? currentUser.name.charAt(0) : 'K'}
              </div>
              <div className="account-menu-info">
                <h4>{currentUser ? currentUser.name : 'Kasir Utama'}</h4>
                <span>{currentUser && currentUser.role === 'admin' ? 'Administrator' : 'Kasir Staf'}</span>
              </div>
              <button className="account-menu-close" onClick={() => setIsAccountMenuOpen(false)}>✕</button>
            </div>
            
            <div className="account-menu-body">
              {/* Core shortcuts */}
              <button 
                className={`account-menu-item-btn ${activeView === 'cashier' ? 'active' : ''}`}
                onClick={() => {
                  setActiveView('cashier');
                  setIsAccountMenuOpen(false);
                }}
              >
                <ShoppingBag size={16} />
                <span>Buka Kasir POS</span>
              </button>

              
              <button 
                className={`account-menu-item-btn ${activeView === 'settings' ? 'active' : ''}`}
                onClick={() => {
                  setActiveView('settings');
                  setIsAccountMenuOpen(false);
                }}
              >
                <Settings size={16} />
                <span>Pengaturan Kata Sandi</span>
              </button>
            </div>
            
            <div className="account-menu-footer">
              <button className="account-menu-logout-btn" onClick={() => {
                setIsAccountMenuOpen(false);
                if (window.confirm('Apakah Anda yakin ingin keluar dari sistem kasir?')) {
                  handleLogout();
                }
              }}>
                Keluar dari POS (Logout)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
