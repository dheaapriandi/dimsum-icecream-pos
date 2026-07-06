import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import CashierView from './components/CashierView';
import KitchenView from './components/KitchenView';
import DashboardView from './components/DashboardView';
import InventoryView from './components/InventoryView';
import ReceiptModal from './components/ReceiptModal';
import { db, isSupabaseConfigured } from './supabase';
import { Sparkles, Database } from 'lucide-react';

function App() {
  const [activeView, setActiveView] = useState('cashier');
  
  // Database States
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  
  // App States
  const [isLoading, setIsLoading] = useState(true);
  const [currentReceiptOrder, setCurrentReceiptOrder] = useState(null);

  // Load Data awal
  const loadData = async () => {
    try {
      setIsLoading(true);
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
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Callback Transaksi baru
  const handleCreateOrder = async (orderData, items) => {
    try {
      const completedOrder = await db.createOrder(orderData, items);
      
      // Muat ulang data terbaru (agar stok & riwayat sinkron)
      await loadData();
      
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
      await loadData();
    } catch (err) {
      console.error('Gagal menambah produk:', err);
      throw err;
    }
  };

  // Callback Edit Produk
  const handleUpdateProduct = async (id, updates) => {
    try {
      await db.updateProduct(id, updates);
      await loadData();
    } catch (err) {
      console.error('Gagal mengubah produk:', err);
      throw err;
    }
  };

  // Callback Hapus Produk
  const handleDeleteProduct = async (id) => {
    try {
      await db.deleteProduct(id);
      await loadData();
    } catch (err) {
      console.error('Gagal menghapus produk:', err);
      throw err;
    }
  };

  // Callback Edit Transaksi
  const handleUpdateOrder = async (id, updates) => {
    try {
      await db.updateOrder(id, updates);
      await loadData();
    } catch (err) {
      console.error('Gagal memperbarui transaksi:', err);
      throw err;
    }
  };

  // Callback Hapus Transaksi
  const handleDeleteOrder = async (id) => {
    try {
      await db.deleteOrder(id);
      await loadData();
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
            onCreateOrder={handleCreateOrder} 
          />
        );
      case 'kitchen':
        return (
          <KitchenView 
            orders={orders} 
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

  return (
    <div className="app-container">
      {/* SIDEBAR NAVIGATION */}
      <Sidebar activeView={activeView} setActiveView={setActiveView} />

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
