import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import CashierView from './components/CashierView';
import KitchenView from './components/KitchenView';
import DashboardView from './components/DashboardView';
import InventoryView from './components/InventoryView';
import ReceiptModal from './components/ReceiptModal';
import { db, isSupabaseConfigured, supabase } from './supabase';
import { Sparkles, Database } from 'lucide-react';

function App() {
  const [activeView, setActiveView] = useState('cashier');

  // Auth States
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('active_cashier');
    return saved ? JSON.parse(saved) : null;
  });

  const handleLogin = async (username, password) => {
    try {
      const user = await db.login(username, password);
      localStorage.setItem('active_cashier', JSON.stringify(user));
      setCurrentUser(user);
    } catch (err) {
      alert(err.message || 'Login gagal.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('active_cashier');
    setCurrentUser(null);
    setActiveView('cashier');
  };
  
  // Database States
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  
  // App States
  const [isLoading, setIsLoading] = useState(true);
  const [currentReceiptOrder, setCurrentReceiptOrder] = useState(null);

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

  // Callback Transaksi baru
  const handleCreateOrder = async (orderData, items) => {
    try {
      const completedOrder = await db.createOrder(orderData, items);
      
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

  // Callback Tambah Produk
  const handleAddProduct = async (product) => {
    try {
      await db.addProduct(product);
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
            onReprintReceipt={handleReprintReceipt}
            onUpdateOrder={handleUpdateOrder}
            onDeleteOrder={handleDeleteOrder}
          />
        );
      case 'inventory':
        return (
          <InventoryView 
            products={products}
            categories={categories}
            onAddProduct={handleAddProduct}
            onUpdateProduct={handleUpdateProduct}
            onDeleteProduct={handleDeleteProduct}
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
            const username = e.target.username.value;
            const password = e.target.password.value;
            handleLogin(username, password);
          }} className="login-form">
            <div className="form-group-login">
              <label>Nama Kasir / Username</label>
              <input 
                type="text" 
                name="username" 
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
      />

      {/* PANEL UTAMA */}
      <main className="main-content">
        {/* BANNER STATUS KONEKSI DATABASE */}
        <div className="connection-status-banner">
          <div className="status-info">
            <Database size={14} className={isSupabaseConfigured ? 'icon-connected' : 'icon-mock'} />
            <span className="status-text">
              Status Database: {isSupabaseConfigured ? (
                <strong className="text-connected">Tersambung Supabase (Cloud)</strong>
              ) : (
                <strong className="text-mock">Local Storage (Mode Offline/Demo)</strong>
              )}
            </span>
          </div>
          {!isSupabaseConfigured && (
            <div className="setup-tip">
              Hubungkan Supabase Cloud dengan mengatur file <code>.env</code> di root proyek.
            </div>
          )}
        </div>

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

        @media (max-width: 576px) {
          .connection-status-banner {
            flex-direction: column;
            align-items: flex-start;
            gap: 6px;
          }
        }
      `}</style>
    </div>
  );
}

export default App;
