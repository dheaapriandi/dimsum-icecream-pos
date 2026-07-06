import React, { useMemo, useState } from 'react';
import { TrendingUp, ShoppingBag, Receipt, DollarSign, Printer, ArrowUpRight, Edit, Trash2, X, Check } from 'lucide-react';

// Helper to get date string in Asia/Jakarta (GMT+7) timezone
const getJakartaYMD = (dateInput) => {
  const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (!d || isNaN(d.getTime())) return '';
  const formatter = new Intl.DateTimeFormat('id-ID', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  const parts = formatter.formatToParts(d);
  const day = parts.find(p => p.type === 'day').value;
  const month = parts.find(p => p.type === 'month').value;
  const year = parts.find(p => p.type === 'year').value;
  return `${year}-${month}-${day}`;
};

// Helper to get year-month string in Asia/Jakarta (GMT+7) timezone
const getJakartaYM = (dateInput) => {
  const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (!d || isNaN(d.getTime())) return '';
  const formatter = new Intl.DateTimeFormat('id-ID', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit'
  });
  const parts = formatter.formatToParts(d);
  const month = parts.find(p => p.type === 'month').value;
  const year = parts.find(p => p.type === 'year').value;
  return `${year}-${month}`;
};

const DashboardView = ({ orders, products, onReprintReceipt, onUpdateOrder, onDeleteOrder }) => {
  const [editingOrder, setEditingOrder] = useState(null);
  const [editPaymentMethod, setEditPaymentMethod] = useState('CASH');
  const [editCashierName, setEditCashierName] = useState('');
  const [editStatus, setEditStatus] = useState('COMPLETED');

  const handleOpenEditModal = (order) => {
    setEditingOrder(order);
    setEditPaymentMethod(order.payment_method || 'CASH');
    setEditCashierName(order.cashier_name || 'Kasir Utama');
    setEditStatus(order.status || 'COMPLETED');
  };

  const handleSaveEdit = async () => {
    if (!editingOrder) return;
    try {
      await onUpdateOrder(editingOrder.id, {
        payment_method: editPaymentMethod,
        cashier_name: editCashierName,
        status: editStatus
      });
      setEditingOrder(null);
    } catch (e) {
      alert('Gagal memperbarui transaksi');
    }
  };

  const handleDeleteClick = async (orderId, invoiceNo) => {
    if (confirm(`Apakah Anda yakin ingin menghapus transaksi ${invoiceNo}? Tindakan ini akan menghapus histori dan mengembalikan stok produk.`)) {
      try {
        await onDeleteOrder(orderId);
      } catch (e) {
        alert('Gagal menghapus transaksi');
      }
    }
  };

  const [isEodModalOpen, setIsEodModalOpen] = useState(false);
  const [isEomModalOpen, setIsEomModalOpen] = useState(false);
  const [selectedEomMonth, setSelectedEomMonth] = useState('');

  const handlePrintEod = () => {
    setIsEodModalOpen(true);
  };

  // List 6 bulan terakhir untuk pilihan Laporan Bulanan
  const availableMonths = useMemo(() => {
    const list = [];
    for (let i = 0; i < 6; i++) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      list.push({
        value: getJakartaYM(d),
        label: d.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
      });
    }
    return list;
  }, []);

  // Hitung metrik bulanan untuk pilihan bulan yang disorot
  const monthStats = useMemo(() => {
    if (!selectedEomMonth) return null;
    
    const monthOrders = orders.filter(o => getJakartaYM(o.created_at) === selectedEomMonth && o.status !== 'CANCELLED');
    
    const totalOrders = monthOrders.length;
    const totalRevenue = monthOrders.reduce((sum, o) => sum + o.total_amount, 0);
    const totalDiscount = monthOrders.reduce((sum, o) => sum + (o.discount_amount || 0), 0);
    
    const payments = monthOrders.reduce((acc, o) => {
      acc[o.payment_method] = (acc[o.payment_method] || 0) + o.total_amount;
      return acc;
    }, { CASH: 0, QRIS: 0, CARD: 0 });
    
    const counts = {};
    monthOrders.forEach(order => {
      if (order.items) {
        order.items.forEach(item => {
          counts[item.product_id] = (counts[item.product_id] || 0) + item.quantity;
        });
      }
    });
    
    const topProducts = Object.entries(counts)
      .map(([id, qty]) => {
        const prod = products.find(p => p.id === id);
        return {
          name: prod ? prod.name : `Produk #${id}`,
          qty
        };
      })
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);
      
    return { totalOrders, totalRevenue, totalDiscount, payments, topProducts };
  }, [selectedEomMonth, orders, products]);

  // Filter transaksi hari ini
  const todayOrders = useMemo(() => {
    const todayStr = getJakartaYMD(new Date());
    return orders.filter(o => getJakartaYMD(o.created_at) === todayStr && o.status !== 'CANCELLED');
  }, [orders]);

  const todayStats = useMemo(() => {
    const totalOrders = todayOrders.length;
    const totalRevenue = todayOrders.reduce((sum, o) => sum + o.total_amount, 0);
    const totalDiscount = todayOrders.reduce((sum, o) => sum + (o.discount_amount || 0), 0);
    const payments = todayOrders.reduce((acc, o) => {
      acc[o.payment_method] = (acc[o.payment_method] || 0) + o.total_amount;
      return acc;
    }, { CASH: 0, QRIS: 0, CARD: 0 });

    const counts = {};
    todayOrders.forEach(order => {
      if (order.items) {
        order.items.forEach(item => {
          counts[item.product_id] = (counts[item.product_id] || 0) + item.quantity;
        });
      }
    });

    const topProducts = Object.entries(counts)
      .map(([id, qty]) => {
        const prod = products.find(p => p.id === id);
        return {
          name: prod ? prod.name : `Produk #${id}`,
          qty
        };
      })
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);

    return { totalOrders, totalRevenue, totalDiscount, payments, topProducts };
  }, [todayOrders, products]);

  const [chartPeriod, setChartPeriod] = useState('DAILY'); // 'DAILY', 'THIRTY_DAYS', 'MONTHLY'

  // Hitung tren harian (7 hari terakhir)
  const dailyTrend = useMemo(() => {
    const result = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = getJakartaYMD(d);
      
      const dailyRevenue = orders
        .filter(o => getJakartaYMD(o.created_at) === dateStr && o.status !== 'CANCELLED')
        .reduce((sum, o) => sum + o.total_amount, 0);
        
      result.push({
        label: d.toLocaleDateString('id-ID', { timeZone: 'Asia/Jakarta', weekday: 'short', day: '2-digit' }),
        revenue: dailyRevenue,
        rawDate: dateStr
      });
    }
    return result;
  }, [orders]);

  // Hitung tren harian (30 hari terakhir / 1 bulan)
  const thirtyDaysTrend = useMemo(() => {
    const result = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = getJakartaYMD(d);
      
      const dailyRevenue = orders
        .filter(o => getJakartaYMD(o.created_at) === dateStr && o.status !== 'CANCELLED')
        .reduce((sum, o) => sum + o.total_amount, 0);
        
      result.push({
        label: d.toLocaleDateString('id-ID', { timeZone: 'Asia/Jakarta', day: '2-digit' }), // Tampilkan tanggal saja agar muat
        revenue: dailyRevenue,
        rawDate: dateStr
      });
    }
    return result;
  }, [orders]);

  // Hitung tren bulanan (6 bulan terakhir)
  const monthlyTrend = useMemo(() => {
    const result = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const yearMonthStr = getJakartaYM(d);
      
      const monthlyRevenue = orders
        .filter(o => getJakartaYM(o.created_at) === yearMonthStr && o.status !== 'CANCELLED')
        .reduce((sum, o) => sum + o.total_amount, 0);
        
      result.push({
        label: d.toLocaleDateString('id-ID', { timeZone: 'Asia/Jakarta', month: 'short', year: '2-digit' }),
        revenue: monthlyRevenue,
        rawMonth: yearMonthStr
      });
    }
    return result;
  }, [orders]);

  // Hitung metrik penjualan
  const stats = useMemo(() => {
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, o) => sum + o.total_amount, 0);
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    
    // Distribusi metode pembayaran
    const payments = orders.reduce((acc, o) => {
      acc[o.payment_method] = (acc[o.payment_method] || 0) + o.total_amount;
      return acc;
    }, { CASH: 0, QRIS: 0, CARD: 0 });

    // Produk Terlaris (Top Selling Products)
    const productCounts = orders.reduce((acc, order) => {
      if (order.items) {
        order.items.forEach(item => {
          acc[item.product_id] = (acc[item.product_id] || 0) + item.quantity;
        });
      }
      return acc;
    }, {});

    const topProducts = Object.entries(productCounts)
      .map(([id, qty]) => {
        const prod = products.find(p => p.id === id);
        return {
          id,
          name: prod ? prod.name : `Produk #${id}`,
          qty,
          price: prod ? prod.price : 0,
          revenue: qty * (prod ? prod.price : 0)
        };
      })
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5); // Tampilkan 5 teratas

    return {
      totalOrders,
      totalRevenue,
      avgOrderValue,
      payments,
      topProducts
    };
  }, [orders, products]);

  const formatRupiah = (number) => {
    return 'Rp ' + Math.round(number).toLocaleString('id-ID');
  };

  const formatDate = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleString('id-ID', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const paymentMethodBadge = (method) => {
    const classes = {
      CASH: 'badge-cash',
      QRIS: 'badge-qris',
      CARD: 'badge-card'
    }[method] || '';

    const label = {
      CASH: 'Tunai',
      QRIS: 'QRIS',
      CARD: 'Kartu'
    }[method] || method;

    return <span className={`payment-badge ${classes}`}>{label}</span>;
  };

  // Persentase grafik metode pembayaran
  const paymentPercentages = useMemo(() => {
    const total = stats.payments.CASH + stats.payments.QRIS + stats.payments.CARD;
    if (total === 0) return { CASH: 0, QRIS: 0, CARD: 0 };
    return {
      CASH: Math.round((stats.payments.CASH / total) * 100),
      QRIS: Math.round((stats.payments.QRIS / total) * 100),
      CARD: Math.round((stats.payments.CARD / total) * 100)
    };
  }, [stats]);

  return (
    <div className="dashboard-container">
      <div className="dashboard-header glass-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <TrendingUp className="header-icon" size={24} />
          <h2>Laporan Analisis Penjualan</h2>
        </div>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button 
            onClick={handlePrintEod} 
            className="btn-action-print"
            style={{
              padding: '10px 16px',
              borderRadius: '10px',
              fontSize: '13px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              background: 'var(--primary)',
              borderColor: 'var(--primary)',
              color: '#ffffff'
            }}
          >
            <Printer size={16} />
            <span>Cetak Laporan Harian (EOD)</span>
          </button>
          <button 
            onClick={() => {
              setSelectedEomMonth(getJakartaYM(new Date()));
              setIsEomModalOpen(true);
            }} 
            className="btn-action-print"
            style={{
              padding: '10px 16px',
              borderRadius: '10px',
              fontSize: '13px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              background: 'var(--primary)',
              borderColor: 'var(--primary)',
              color: '#ffffff'
            }}
          >
            <Printer size={16} />
            <span>Cetak Laporan Bulanan (EOM)</span>
          </button>
        </div>
      </div>

      {/* METRIK KARTU RINGKASAN */}
      <div className="stats-cards-grid">
        <div className="stat-card glass-panel">
          <div className="stat-icon rev">
            <span style={{ fontWeight: 'bold', fontSize: '15px', letterSpacing: '-0.5px' }}>Rp</span>
          </div>
          <div className="stat-info">
            <span className="label">Total Pendapatan</span>
            <span className="value">{formatRupiah(stats.totalRevenue)}</span>
          </div>
        </div>

        <div className="stat-card glass-panel">
          <div className="stat-icon orders">
            <ShoppingBag size={20} />
          </div>
          <div className="stat-info">
            <span className="label">Total Transaksi</span>
            <span className="value">{stats.totalOrders} Transaksi</span>
          </div>
        </div>

        <div className="stat-card glass-panel">
          <div className="stat-icon avg">
            <span style={{ fontWeight: 'bold', fontSize: '15px', letterSpacing: '-0.5px' }}>Rp</span>
          </div>
          <div className="stat-info">
            <span className="label">Rata-rata Transaksi</span>
            <span className="value">{formatRupiah(stats.avgOrderValue)}</span>
          </div>
        </div>
      </div>

      {/* TREN PENJUALAN (HARIAN / BULANAN) */}
      <div className="dashboard-card glass-panel trend-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ margin: 0 }}>Tren Grafik Penjualan</h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>Analisis grafik pendapatan usaha Kedai AA</p>
          </div>
          <div className="chart-tabs" style={{ display: 'flex', background: 'rgba(0,0,0,0.03)', padding: '4px', borderRadius: '8px', border: '1px solid var(--border-color)', gap: '4px' }}>
            <button 
              onClick={() => setChartPeriod('DAILY')}
              className={`chart-tab-btn ${chartPeriod === 'DAILY' ? 'active' : ''}`}
              style={{
                padding: '6px 12px',
                border: 'none',
                background: chartPeriod === 'DAILY' ? 'var(--primary)' : 'transparent',
                color: chartPeriod === 'DAILY' ? '#ffffff' : 'var(--text-muted)',
                fontSize: '12px',
                fontWeight: 600,
                borderRadius: '6px',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              Harian (7 Hari)
            </button>
            <button 
              onClick={() => setChartPeriod('THIRTY_DAYS')}
              className={`chart-tab-btn ${chartPeriod === 'THIRTY_DAYS' ? 'active' : ''}`}
              style={{
                padding: '6px 12px',
                border: 'none',
                background: chartPeriod === 'THIRTY_DAYS' ? 'var(--primary)' : 'transparent',
                color: chartPeriod === 'THIRTY_DAYS' ? '#ffffff' : 'var(--text-muted)',
                fontSize: '12px',
                fontWeight: 600,
                borderRadius: '6px',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              Harian (30 Hari)
            </button>
            <button 
              onClick={() => setChartPeriod('MONTHLY')}
              className={`chart-tab-btn ${chartPeriod === 'MONTHLY' ? 'active' : ''}`}
              style={{
                padding: '6px 12px',
                border: 'none',
                background: chartPeriod === 'MONTHLY' ? 'var(--primary)' : 'transparent',
                color: chartPeriod === 'MONTHLY' ? '#ffffff' : 'var(--text-muted)',
                fontSize: '12px',
                fontWeight: 600,
                borderRadius: '6px',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              Bulanan (6 Bulan)
            </button>
          </div>
        </div>

        {/* Visual Bar Chart */}
        <div className="chart-visual-container" style={{ 
          display: 'flex', 
          height: '240px', 
          gap: chartPeriod === 'THIRTY_DAYS' ? '3px' : '20px', 
          alignItems: 'flex-end', 
          paddingTop: '20px', 
          borderBottom: '2px solid var(--border-color)', 
          position: 'relative' 
        }}>
          {/* Grid lines */}
          <div style={{ position: 'absolute', left: 0, right: 0, top: '20%', borderTop: '1px dashed var(--border-color)', opacity: 0.3 }}></div>
          <div style={{ position: 'absolute', left: 0, right: 0, top: '50%', borderTop: '1px dashed var(--border-color)', opacity: 0.3 }}></div>
          <div style={{ position: 'absolute', left: 0, right: 0, top: '80%', borderTop: '1px dashed var(--border-color)', opacity: 0.3 }}></div>

          {(chartPeriod === 'DAILY' ? dailyTrend : chartPeriod === 'THIRTY_DAYS' ? thirtyDaysTrend : monthlyTrend).map((item, index) => {
            const currentData = chartPeriod === 'DAILY' ? dailyTrend : chartPeriod === 'THIRTY_DAYS' ? thirtyDaysTrend : monthlyTrend;
            const maxVal = Math.max(...currentData.map(d => d.revenue), 1);
            const heightPercent = (item.revenue / maxVal) * 80 + 5; // Min 5% height for visual trace if > 0
            const heightStyle = item.revenue === 0 ? '0%' : `${heightPercent}%`;

            return (
              <div 
                key={index} 
                className="chart-column-group"
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  height: '100%',
                  justifyContent: 'flex-end',
                  position: 'relative'
                }}
              >
                {/* Hover value label */}
                <div 
                  className="chart-bar-tooltip"
                  style={{
                    position: 'absolute',
                    bottom: `calc(${heightStyle} + 10px)`,
                    background: 'var(--text-primary)',
                    color: 'var(--bg-surface)',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    fontSize: '10px',
                    fontWeight: 700,
                    whiteSpace: 'nowrap',
                    boxShadow: 'var(--shadow-sm)',
                    opacity: 0,
                    pointerEvents: 'none',
                    transition: 'opacity 0.2s, bottom 0.2s',
                    zIndex: 10
                  }}
                >
                  {formatRupiah(item.revenue)}
                </div>

                {/* Vertical Bar */}
                <div 
                  className="chart-bar-column"
                  style={{
                    width: chartPeriod === 'THIRTY_DAYS' ? '90%' : '70%',
                    maxWidth: '45px',
                    height: heightStyle,
                    background: 'linear-gradient(180deg, var(--primary) 0%, rgba(249, 115, 22, 0.4) 100%)',
                    borderTopLeftRadius: '6px',
                    borderTopRightRadius: '6px',
                    cursor: 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                />

                {/* X-axis Label (offset below chart) */}
                <div 
                  style={{
                    position: 'absolute',
                    bottom: '-28px',
                    fontSize: chartPeriod === 'THIRTY_DAYS' ? '9px' : '11px',
                    fontWeight: 600,
                    color: 'var(--text-muted)',
                    textAlign: 'center',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {item.label}
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Padding bottom helper to offset X-axis labels */}
        <div style={{ height: '24px' }}></div>
      </div>

      <div className="dashboard-charts-grid">
        {/* PRODUK TERLARIS */}
        <div className="dashboard-card glass-panel">
          <h3>Menu Terlaris (Top 5)</h3>
          <div className="top-products-list">
            {stats.topProducts.map((item, index) => (
              <div key={item.id} className="top-product-item">
                <div className="rank">#{index + 1}</div>
                <div className="details">
                  <span className="name">{item.name}</span>
                  <span className="qty">{item.qty} Porsi Terjual</span>
                </div>
                <div className="revenue">{formatRupiah(item.revenue)}</div>
              </div>
            ))}
            {stats.topProducts.length === 0 && (
              <div className="empty-chart">Belum ada data penjualan</div>
            )}
          </div>
        </div>

        {/* METODE PEMBAYARAN */}
        <div className="dashboard-card glass-panel">
          <h3>Metode Pembayaran Terpopuler</h3>
          <div className="payment-chart-container">
            <div className="bar-chart-visual">
              <div className="chart-bar cash" style={{ width: `${paymentPercentages.CASH}%` }} />
              <div className="chart-bar qris" style={{ width: `${paymentPercentages.QRIS}%` }} />
              <div className="chart-bar card" style={{ width: `${paymentPercentages.CARD}%` }} />
            </div>
            
            <div className="chart-legend">
              <div className="legend-item">
                <span className="dot cash" />
                <span className="label">Tunai (CASH)</span>
                <span className="percent">{paymentPercentages.CASH}%</span>
                <span className="value">({formatRupiah(stats.payments.CASH)})</span>
              </div>
              <div className="legend-item">
                <span className="dot qris" />
                <span className="label">QRIS</span>
                <span className="percent">{paymentPercentages.QRIS}%</span>
                <span className="value">({formatRupiah(stats.payments.QRIS)})</span>
              </div>
              <div className="legend-item">
                <span className="dot card" />
                <span className="label">Kartu (CARD)</span>
                <span className="percent">{paymentPercentages.CARD}%</span>
                <span className="value">({formatRupiah(stats.payments.CARD)})</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIWAYAT TRANSAKSI TABEL */}
      <div className="dashboard-card glass-panel table-card">
        <div className="table-header">
          <h3>Riwayat Transaksi Terbaru</h3>
        </div>

        <div className="table-wrapper">
          <table className="transactions-table">
            <thead>
              <tr>
                <th>Invoice</th>
                <th>Tanggal & Waktu</th>
                <th>Metode</th>
                <th>Status</th>
                <th>Total Bayar</th>
                <th className="text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className={order.status === 'CANCELLED' ? 'cancelled-row' : ''}>
                  <td className="bold">{order.invoice_no}</td>
                  <td>{formatDate(order.created_at)}</td>
                  <td>{paymentMethodBadge(order.payment_method)}</td>
                  <td>
                    <span className={`status-badge ${order.status === 'CANCELLED' ? 'cancelled' : 'completed'}`} style={{
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '11px',
                      fontWeight: 600,
                      background: order.status === 'CANCELLED' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)',
                      color: order.status === 'CANCELLED' ? '#ef4444' : '#22c55e'
                    }}>
                      {order.status === 'CANCELLED' ? 'BATAL' : 'SELESAI'}
                    </span>
                  </td>
                  <td className="bold text-primary">{formatRupiah(order.total_amount)}</td>
                  <td className="text-right">
                    <div className="action-buttons" style={{ display: 'inline-flex', gap: '8px', justifyContent: 'flex-end', width: '100%' }}>
                      <button 
                        onClick={() => onReprintReceipt(order.id)}
                        className="btn-action-print" 
                        title="Cetak Ulang Struk"
                        style={{
                          background: 'var(--primary)',
                          border: 'none',
                          padding: '6px 10px',
                          borderRadius: '6px',
                          color: '#ffffff',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '11px',
                          fontWeight: 600,
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <Printer size={13} />
                        <span>Struk</span>
                      </button>
                      <button 
                        onClick={() => handleOpenEditModal(order)}
                        className="btn-action-edit"
                        title="Edit Transaksi"
                        style={{
                          background: 'rgba(0,0,0,0.03)',
                          border: '1px solid var(--border-color)',
                          padding: '6px 8px',
                          borderRadius: '6px',
                          color: 'var(--text-muted)',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <Edit size={13} />
                      </button>
                      <button 
                        onClick={() => handleDeleteClick(order.id, order.invoice_no)}
                        className="btn-action-delete"
                        title="Hapus Transaksi"
                        style={{
                          background: 'rgba(239, 68, 68, 0.03)',
                          border: '1px solid rgba(239, 68, 68, 0.1)',
                          padding: '6px 8px',
                          borderRadius: '6px',
                          color: '#ef4444',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan="6" className="empty-table">Belum ada transaksi hari ini.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL EDIT TRANSAKSI */}
      {editingOrder && (
        <div className="edit-modal-overlay">
          <div className="edit-modal-container glass-panel">
            <div className="edit-modal-header">
              <h3>Edit Transaksi: {editingOrder.invoice_no}</h3>
              <button className="btn-close-modal" onClick={() => setEditingOrder(null)}>
                <X size={20} />
              </button>
            </div>
            
            <div className="edit-modal-body">
              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>Metode Pembayaran</label>
                <select 
                  value={editPaymentMethod} 
                  onChange={(e) => setEditPaymentMethod(e.target.value)}
                  className="modal-input"
                >
                  <option value="CASH">TUNAI (CASH)</option>
                  <option value="QRIS">QRIS / E-WALLET</option>
                  <option value="CARD">KARTU DEBIT/KREDIT</option>
                </select>
              </div>

              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>Nama Kasir</label>
                <input 
                  type="text" 
                  value={editCashierName} 
                  onChange={(e) => setEditCashierName(e.target.value)}
                  className="modal-input"
                  placeholder="Nama Kasir"
                />
              </div>

              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>Status Transaksi</label>
                <select 
                  value={editStatus} 
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="modal-input"
                >
                  <option value="COMPLETED">SELESAI (COMPLETED)</option>
                  <option value="CANCELLED">BATAL (CANCELLED)</option>
                </select>
              </div>
            </div>

            <div className="edit-modal-footer">
              <button className="btn-cancel" onClick={() => setEditingOrder(null)}>
                Batal
              </button>
              <button className="btn-save btn-primary" onClick={handleSaveEdit}>
                <Check size={16} />
                <span>Simpan Perubahan</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL EOD REPORT PRINT PREVIEW */}
      {isEodModalOpen && (
        <div className="edit-modal-overlay">
          <div className="edit-modal-container glass-panel" style={{ maxWidth: '360px' }}>
            <div className="edit-modal-header">
              <h3>Preview Laporan Harian (EOD)</h3>
              <button className="btn-close-modal" onClick={() => setIsEodModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            
            <div className="receipt-scroll-area" style={{ maxHeight: '380px', padding: '10px' }}>
              {/* PRINT AREA (id="receipt-print" untuk thermal layout) */}
              <div id="receipt-print" className="receipt-preview-container" style={{ maxWidth: '100%', border: 'none', boxShadow: 'none', padding: '10px' }}>
                <div className="receipt-header">
                  <div className="receipt-title">KEDAI AA</div>
                  <img src="/logo.png" alt="Logo Kedai AA" className="receipt-logo-bw" />
                  <div className="receipt-subtitle" style={{ fontWeight: 'bold', fontSize: '12px', marginTop: '6px' }}>LAPORAN PENJUALAN HARIAN</div>
                  <div className="receipt-subtitle" style={{ fontWeight: 'bold', fontSize: '12px' }}>END OF DAY (EOD) REPORT</div>
                  <div className="receipt-subtitle" style={{ fontSize: '11px', marginTop: '8px' }}>--------------------------------</div>
                  <div className="receipt-subtitle" style={{ textAlign: 'left', fontSize: '11px' }}>
                    Tanggal: {new Date().toLocaleDateString('id-ID', { timeZone: 'Asia/Jakarta', day: '2-digit', month: '2-digit', year: 'numeric' })}
                  </div>
                  <div className="receipt-subtitle" style={{ textAlign: 'left', fontSize: '11px' }}>
                    Waktu Cetak: {new Date().toLocaleTimeString('id-ID', { timeZone: 'Asia/Jakarta' })}
                  </div>
                  <div className="receipt-subtitle" style={{ textAlign: 'left', fontSize: '11px' }}>
                    Kasir: Kasir Utama
                  </div>
                </div>

                <div className="receipt-divider" style={{ borderTop: '1px dashed #000', margin: '8px 0' }}></div>

                <div className="receipt-info-section" style={{ fontSize: '11px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                    <span>TOTAL TRANSAKSI:</span>
                    <span>{todayStats.totalOrders} Pesanan</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Omzet Kotor:</span>
                    <span>{formatRupiah(todayStats.totalRevenue + todayStats.totalDiscount)}</span>
                  </div>
                  {todayStats.totalDiscount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#ef4444' }}>
                      <span>Total Diskon:</span>
                      <span>-{formatRupiah(todayStats.totalDiscount)}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '12px', borderTop: '1px solid #000', paddingTop: '4px', marginTop: '2px' }}>
                    <span>PENDAPATAN BERSIH:</span>
                    <span>{formatRupiah(todayStats.totalRevenue)}</span>
                  </div>
                </div>

                <div className="receipt-divider" style={{ borderTop: '1px dashed #000', margin: '8px 0' }}></div>

                <div className="receipt-info-section" style={{ fontSize: '11px' }}>
                  <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>RINCIAN PEMBAYARAN:</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                    <span>TUNAI (CASH):</span>
                    <span>{formatRupiah(todayStats.payments.CASH)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                    <span>QRIS / E-WALLET:</span>
                    <span>{formatRupiah(todayStats.payments.QRIS)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>KARTU DEBIT/KREDIT:</span>
                    <span>{formatRupiah(todayStats.payments.CARD)}</span>
                  </div>
                </div>

                <div className="receipt-divider" style={{ borderTop: '1px dashed #000', margin: '8px 0' }}></div>

                <div className="receipt-info-section" style={{ fontSize: '11px' }}>
                  <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>5 MENU TERLARIS HARI INI:</div>
                  {todayStats.topProducts.map((p, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                      <span>{i+1}. {p.name}</span>
                      <span>{p.qty} Porsi</span>
                    </div>
                  ))}
                  {todayStats.topProducts.length === 0 && (
                    <div style={{ textAlign: 'center', color: '#666', fontStyle: 'italic' }}>Belum ada data penjualan hari ini.</div>
                  )}
                </div>

                <div className="receipt-divider" style={{ borderTop: '1px dashed #000', margin: '8px 0' }}></div>

                <div className="receipt-footer" style={{ textAlign: 'center', fontSize: '10px', marginTop: '10px' }}>
                  <div>Laporan Penjualan Kedai AA</div>
                  <div>Terima Kasih & Selamat Beristirahat!</div>
                </div>
              </div>
            </div>

            <div className="edit-modal-footer">
              <button className="btn-cancel" onClick={() => setIsEodModalOpen(false)}>
                Tutup
              </button>
              <button 
                className="btn-save btn-primary" 
                onClick={() => {
                  window.print();
                  setIsEodModalOpen(false);
                }}
              >
                <Printer size={16} />
                <span>Cetak Laporan</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL EOM REPORT PRINT PREVIEW */}
      {isEomModalOpen && monthStats && (
        <div className="edit-modal-overlay">
          <div className="edit-modal-container glass-panel" style={{ maxWidth: '360px' }}>
            <div className="edit-modal-header" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0 }}>Preview Laporan Bulanan (EOM)</h3>
                <button className="btn-close-modal" onClick={() => setIsEomModalOpen(false)}>
                  <X size={20} />
                </button>
              </div>
              
              {/* Selector Month */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '6px' }}>
                <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>Pilih Bulan Laporan:</label>
                <select
                  value={selectedEomMonth}
                  onChange={(e) => setSelectedEomMonth(e.target.value)}
                  className="modal-input"
                  style={{ padding: '6px 10px', fontSize: '13px' }}
                >
                  {availableMonths.map((m) => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="receipt-scroll-area" style={{ maxHeight: '350px', padding: '10px' }}>
              {/* PRINT AREA (id="receipt-print" untuk thermal layout) */}
              <div id="receipt-print" className="receipt-preview-container" style={{ maxWidth: '100%', border: 'none', boxShadow: 'none', padding: '10px' }}>
                <div className="receipt-header">
                  <div className="receipt-title">KEDAI AA</div>
                  <img src="/logo.png" alt="Logo Kedai AA" className="receipt-logo-bw" />
                  <div className="receipt-subtitle" style={{ fontWeight: 'bold', fontSize: '12px', marginTop: '6px' }}>LAPORAN PENJUALAN BULANAN</div>
                  <div className="receipt-subtitle" style={{ fontWeight: 'bold', fontSize: '12px' }}>END OF MONTH (EOM) REPORT</div>
                  <div className="receipt-subtitle" style={{ fontSize: '11px', marginTop: '8px' }}>--------------------------------</div>
                  <div className="receipt-subtitle" style={{ textAlign: 'left', fontSize: '11px', fontWeight: 'bold' }}>
                    Bulan: {availableMonths.find(m => m.value === selectedEomMonth)?.label || selectedEomMonth}
                  </div>
                  <div className="receipt-subtitle" style={{ textAlign: 'left', fontSize: '11px' }}>
                    Waktu Cetak: {new Date().toLocaleTimeString('id-ID', { timeZone: 'Asia/Jakarta' })}
                  </div>
                  <div className="receipt-subtitle" style={{ textAlign: 'left', fontSize: '11px' }}>
                    Kasir: Kasir Utama
                  </div>
                </div>

                <div className="receipt-divider" style={{ borderTop: '1px dashed #000', margin: '8px 0' }}></div>

                <div className="receipt-info-section" style={{ fontSize: '11px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                    <span>TOTAL TRANSAKSI:</span>
                    <span>{monthStats.totalOrders} Pesanan</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Omzet Kotor:</span>
                    <span>{formatRupiah(monthStats.totalRevenue + monthStats.totalDiscount)}</span>
                  </div>
                  {monthStats.totalDiscount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#ef4444' }}>
                      <span>Total Diskon:</span>
                      <span>-{formatRupiah(monthStats.totalDiscount)}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '12px', borderTop: '1px solid #000', paddingTop: '4px', marginTop: '2px' }}>
                    <span>PENDAPATAN BERSIH:</span>
                    <span>{formatRupiah(monthStats.totalRevenue)}</span>
                  </div>
                </div>

                <div className="receipt-divider" style={{ borderTop: '1px dashed #000', margin: '8px 0' }}></div>

                <div className="receipt-info-section" style={{ fontSize: '11px' }}>
                  <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>RINCIAN PEMBAYARAN:</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                    <span>TUNAI (CASH):</span>
                    <span>{formatRupiah(monthStats.payments.CASH)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                    <span>QRIS / E-WALLET:</span>
                    <span>{formatRupiah(monthStats.payments.QRIS)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>KARTU DEBIT/KREDIT:</span>
                    <span>{formatRupiah(monthStats.payments.CARD)}</span>
                  </div>
                </div>

                <div className="receipt-divider" style={{ borderTop: '1px dashed #000', margin: '8px 0' }}></div>

                <div className="receipt-info-section" style={{ fontSize: '11px' }}>
                  <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>5 MENU TERLARIS BULAN INI:</div>
                  {monthStats.topProducts.map((p, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                      <span>{i+1}. {p.name}</span>
                      <span>{p.qty} Porsi</span>
                    </div>
                  ))}
                  {monthStats.topProducts.length === 0 && (
                    <div style={{ textAlign: 'center', color: '#666', fontStyle: 'italic' }}>Belum ada data penjualan bulan ini.</div>
                  )}
                </div>

                <div className="receipt-divider" style={{ borderTop: '1px dashed #000', margin: '8px 0' }}></div>

                <div className="receipt-footer" style={{ textAlign: 'center', fontSize: '10px', marginTop: '10px' }}>
                  <div>Laporan Bulanan Kedai AA</div>
                  <div>Terima Kasih atas Kerja Kerasnya!</div>
                </div>
              </div>
            </div>

            <div className="edit-modal-footer">
              <button className="btn-cancel" onClick={() => setIsEomModalOpen(false)}>
                Tutup
              </button>
              <button 
                className="btn-save btn-primary" 
                onClick={() => {
                  window.print();
                  setIsEomModalOpen(false);
                }}
              >
                <Printer size={16} />
                <span>Cetak Laporan</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .dashboard-container {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .dashboard-header {
          padding: 16px 24px;
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .header-icon {
          color: var(--primary);
        }

        .dashboard-header h2 {
          font-size: 18px;
          font-weight: 700;
        }

        /* METRIK KARTU */
        .stats-cards-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }

        .stat-card {
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .stat-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .stat-icon.rev {
          background: rgba(34, 197, 94, 0.1);
          border: 1px solid rgba(34, 197, 94, 0.2);
          color: rgb(34, 197, 94);
        }

        .stat-icon.orders {
          background: rgba(249, 115, 22, 0.1);
          border: 1px solid rgba(249, 115, 22, 0.2);
          color: var(--primary);
        }

        .stat-icon.avg {
          background: rgba(6, 118, 234, 0.1);
          border: 1px solid rgba(6, 118, 234, 0.2);
          color: var(--accent);
        }

        .stat-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .stat-info .label {
          font-size: 12px;
          color: var(--text-muted);
          font-weight: 600;
        }

        .stat-info .value {
          font-size: 20px;
          font-weight: 700;
          color: var(--text-primary);
        }

        /* GRAPHS AND CHART BOXES */
        .dashboard-charts-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        .dashboard-card {
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .dashboard-card h3 {
          font-size: 15px;
          font-weight: 600;
          color: var(--text-primary);
          border-left: 3px solid var(--primary);
          padding-left: 8px;
        }

        .top-products-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .top-product-item {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 10px 14px;
          background: rgba(255,255,255,0.01);
          border: 1px solid var(--border-color);
          border-radius: 10px;
        }

        .top-product-item .rank {
          font-weight: 800;
          color: var(--primary);
          font-size: 14px;
        }

        .top-product-item .details {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .top-product-item .name {
          font-size: 13px;
          font-weight: 600;
        }

        .top-product-item .qty {
          font-size: 11px;
          color: var(--text-muted);
        }

        .top-product-item .revenue {
          font-weight: 700;
          font-size: 13px;
          color: var(--text-primary);
        }

        /* GRAPH PAYMENT METHODS */
        .payment-chart-container {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .bar-chart-visual {
          height: 16px;
          background: rgba(255,255,255,0.03);
          border-radius: 8px;
          overflow: hidden;
          display: flex;
        }

        .chart-bar {
          height: 100%;
        }

        .chart-bar.cash { background-color: rgb(34, 197, 94); }
        .chart-bar.qris { background-color: var(--primary); }
        .chart-bar.card { background-color: var(--accent); }

        .chart-legend {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .legend-item {
          display: flex;
          align-items: center;
          font-size: 12px;
          gap: 8px;
        }

        .legend-item .dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .legend-item .dot.cash { background-color: rgb(34, 197, 94); }
        .legend-item .dot.qris { background-color: var(--primary); }
        .legend-item .dot.card { background-color: var(--accent); }

        .legend-item .label {
          flex: 1;
          color: var(--text-muted);
        }

        .legend-item .percent {
          font-weight: 700;
          color: var(--text-primary);
          min-width: 32px;
        }

        .legend-item .value {
          color: var(--text-muted);
          font-size: 11px;
        }

        /* TABEL RIWAYAT */
        .table-card {
          padding: 0;
          overflow: hidden;
        }

        .table-header {
          padding: 20px;
          border-bottom: 1px solid var(--border-color);
        }

        .table-wrapper {
          overflow-x: auto;
        }

        .transactions-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }

        .transactions-table th, .transactions-table td {
          padding: 14px 20px;
          font-size: 13px;
          border-bottom: 1px solid var(--border-color);
        }

        .transactions-table th {
          background: rgba(255,255,255,0.01);
          color: var(--text-muted);
          font-weight: 600;
        }

        .transactions-table tr:last-child td {
          border-bottom: none;
        }

        .transactions-table td.bold {
          font-weight: 700;
        }

        .transactions-table td.text-primary {
          color: var(--primary);
        }

        .payment-badge {
          font-size: 10px;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: 4px;
        }

        .payment-badge.badge-cash {
          background: rgba(34, 197, 94, 0.1);
          color: rgb(34, 197, 94);
        }

        .payment-badge.badge-qris {
          background: rgba(249, 115, 22, 0.1);
          color: var(--primary);
        }

        .payment-badge.badge-card {
          background: rgba(6, 182, 212, 0.1);
          color: var(--accent);
        }

        .btn-action-print {
          background: rgba(255,255,255,0.03);
          border: 1px solid var(--border-color);
          padding: 6px 12px;
          border-radius: 6px;
          color: var(--text-primary);
          cursor: pointer;
          font-size: 12px;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          transition: all 0.2s ease;
        }

        .btn-action-print:hover {
          background: var(--primary);
          border-color: var(--primary);
          color: white;
        }

        .text-right { text-align: right; }
        .empty-table {
          text-align: center;
          color: var(--text-muted);
          padding: 40px !important;
        }

        .empty-chart {
          padding: 20px;
          text-align: center;
          color: var(--text-muted);
          font-size: 12px;
        }

        /* MODAL EDIT & HAPUS TRANSAKSI */
        .edit-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          backdrop-filter: blur(4px);
        }

        .edit-modal-container {
          width: 90%;
          max-width: 450px;
          background: #ffffff !important;
          border-radius: 16px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
          overflow: hidden;
          animation: scale-up 0.2s ease-out;
        }

        .edit-modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 18px 20px;
          border-bottom: 1px solid var(--border-color);
        }

        .edit-modal-header h3 {
          margin: 0;
          font-size: 16px;
          font-weight: 700;
          color: var(--text-primary);
        }

        .btn-close-modal {
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          padding: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          transition: background-color 0.2s;
        }

        .btn-close-modal:hover {
          background-color: rgba(0,0,0,0.05);
        }

        .edit-modal-body {
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .modal-input {
          width: 100%;
          padding: 10px 12px;
          background: #ffffff;
          border: 1px solid var(--border-color);
          border-radius: 8px;
          color: var(--text-primary);
          font-size: 14px;
          outline: none;
          transition: border-color 0.2s;
        }

        .modal-input:focus {
          border-color: var(--primary);
        }

        .edit-modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          padding: 16px 20px;
          background: rgba(0, 0, 0, 0.01);
          border-top: 1px solid var(--border-color);
        }

        .edit-modal-footer .btn-cancel {
          background: transparent;
          border: 1px solid var(--border-color);
          padding: 8px 16px;
          border-radius: 8px;
          color: var(--text-primary);
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .edit-modal-footer .btn-cancel:hover {
          background: rgba(0,0,0,0.02);
        }

        .edit-modal-footer .btn-save {
          padding: 8px 16px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 6px;
          cursor: pointer;
        }

        tr.cancelled-row {
          opacity: 0.6;
          text-decoration: line-through;
          background: rgba(239, 68, 68, 0.01);
        }

        .btn-action-edit:hover {
          background: rgba(0,0,0,0.08) !important;
          color: var(--text-primary) !important;
        }

        .btn-action-delete:hover {
          background: rgba(239, 68, 68, 0.1) !important;
        }

        /* Tampilan Preview Struk / EOD Laporan */
        .receipt-preview-container {
          background-color: #ffffff !important;
          color: #000000 !important;
          font-family: 'Courier New', Courier, monospace;
          padding: 16px;
          width: 100%;
          max-width: 320px;
          margin: 0 auto;
          border: 1px dashed #ccc;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          border-radius: 4px;
          text-shadow: none !important;
        }

        .receipt-scroll-area {
          width: 100%;
          max-height: 400px;
          overflow-y: auto;
          margin-bottom: 20px;
          padding: 4px;
          border-radius: 8px;
          background: rgba(0, 0, 0, 0.05);
        }

        .receipt-header {
          text-align: center;
          margin-bottom: 12px;
        }

        .receipt-logo-bw {
          width: 55px;
          height: 55px;
          object-fit: contain;
          margin: 6px auto;
          display: block;
          filter: grayscale(100%) contrast(200%);
        }

        .receipt-title {
          font-size: 14px;
          font-weight: bold;
          letter-spacing: 1px;
          margin-bottom: 2px;
          color: #000000 !important;
        }

        .receipt-subtitle {
          font-size: 10px;
          color: #333333 !important;
          margin-bottom: 1px;
        }

        .receipt-divider {
          border-top: 1px dashed #000;
          margin: 8px 0;
        }

        .receipt-info-section {
          font-size: 11px;
          color: #000000 !important;
        }

        .receipt-info-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 2px;
          color: #000000 !important;
        }

        .receipt-footer {
          text-align: center;
          font-size: 10px;
          line-height: 1.4;
          margin-top: 12px;
          color: #000000 !important;
        }

        @media print {
          @page {
            size: 58mm auto;
            margin: 0;
          }
          body * {
            visibility: hidden;
          }
          #receipt-print, #receipt-print * {
            visibility: visible;
          }
          #receipt-print {
            position: absolute !important;
            left: 0;
            top: 0;
            width: 58mm !important;
            background: transparent !important;
            padding: 0 !important;
            margin: 0 !important;
            border: none !important;
            box-shadow: none !important;
          }
          .edit-modal-overlay {
            background: transparent !important;
            position: absolute !important;
            padding: 0 !important;
            margin: 0 !important;
            display: block !important;
          }
          .edit-modal-container {
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            margin: 0 !important;
            background: transparent !important;
            max-width: none !important;
            width: auto !important;
          }
          .receipt-scroll-area {
            overflow-y: visible !important;
            max-height: none !important;
            background: transparent !important;
            padding: 0 !important;
            margin: 0 !important;
          }
        }

        /* ===== TABLET (max-width: 992px) ===== */
        @media (max-width: 992px) {
          .stats-cards-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
          }
          .dashboard-charts-grid {
            grid-template-columns: 1fr;
          }
        }

        /* ===== MOBILE (max-width: 576px) ===== */
        @media (max-width: 576px) {
          .stats-cards-grid {
            grid-template-columns: 1fr;
            gap: 10px;
          }
          .stat-card {
            padding: 14px;
          }
          .stat-icon {
            width: 40px;
            height: 40px;
          }
          .stat-info .value {
            font-size: 16px;
          }
          .stat-info .label {
            font-size: 11px;
          }
          .dashboard-header {
            padding: 12px 16px;
          }
          .dashboard-header h2 {
            font-size: 16px;
          }
          .dashboard-card {
            padding: 14px;
          }
          .dashboard-card h3 {
            font-size: 13px;
          }
          .dashboard-charts-grid {
            grid-template-columns: 1fr;
            gap: 12px;
          }
          .transactions-table th, .transactions-table td {
            padding: 10px 12px;
            font-size: 11px;
          }
          .table-header {
            padding: 14px;
          }
          .edit-modal-container {
            width: 95%;
          }
        }
      `}</style>
    </div>
  );
};

export default DashboardView;
