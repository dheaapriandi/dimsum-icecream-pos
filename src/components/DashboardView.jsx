import React, { useMemo } from 'react';
import { TrendingUp, ShoppingBag, Receipt, DollarSign, Printer, ArrowUpRight } from 'lucide-react';

const DashboardView = ({ orders, products, onReprintReceipt }) => {
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
      <div className="dashboard-header glass-panel">
        <TrendingUp className="header-icon" size={24} />
        <h2>Laporan Analisis Penjualan</h2>
      </div>

      {/* METRIK KARTU RINGKASAN */}
      <div className="stats-cards-grid">
        <div className="stat-card glass-panel">
          <div className="stat-icon rev">
            <DollarSign size={20} />
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
            <Receipt size={20} />
          </div>
          <div className="stat-info">
            <span className="label">Rata-rata Transaksi</span>
            <span className="value">{formatRupiah(stats.avgOrderValue)}</span>
          </div>
        </div>
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
                <th>Total Bayar</th>
                <th className="text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td className="bold">{order.invoice_no}</td>
                  <td>{formatDate(order.created_at)}</td>
                  <td>{paymentMethodBadge(order.payment_method)}</td>
                  <td className="bold text-primary">{formatRupiah(order.total_amount)}</td>
                  <td className="text-right">
                    <button 
                      onClick={() => onReprintReceipt(order.id)}
                      className="btn-action-print" 
                      title="Cetak Ulang Struk"
                    >
                      <Printer size={15} />
                      <span>Cetak Ulang</span>
                    </button>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan="5" className="empty-table">Belum ada transaksi hari ini.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

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

        @media (max-width: 768px) {
          .stats-cards-grid {
            grid-template-columns: 1fr;
          }
          .dashboard-charts-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default DashboardView;
