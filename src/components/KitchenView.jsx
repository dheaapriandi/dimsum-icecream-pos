import React, { useState, useEffect, useMemo } from 'react';
import { ChefHat, CheckCircle2, Clock, Inbox, AlertTriangle } from 'lucide-react';

const KitchenView = ({ orders, onUpdateOrderStatus }) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 10000); // Update setiap 10 detik
    return () => clearInterval(timer);
  }, []);

  // Filter pesanan pending & completed
  const activeOrders = useMemo(() => {
    // Karena di mock backend semua orders diset COMPLETED saat dibayar, kita buat state lokal atau simulasi kitchen queue.
    // Di dunia nyata, order_status bisa 'PENDING' (sedang disiapkan) atau 'READY' (selesai).
    // Mari kita tampilkan semua orders di sini dan biarkan staff menandainya.
    // Untuk demo, kita asumsikan status = 'PENDING' sebagai antrean dapur.
    return orders;
  }, [orders]);

  const [kitchenStatusMap, setKitchenStatusMap] = useState({});

  const handleMarkReady = (orderId) => {
    setKitchenStatusMap(prev => ({
      ...prev,
      [orderId]: 'READY'
    }));
  };

  const getElapsedTime = (createdTimeIso) => {
    const created = new Date(createdTimeIso);
    const diffMs = currentTime - created;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Baru saja';
    return `${diffMins} menit lalu`;
  };

  const isOrderLate = (createdTimeIso) => {
    const created = new Date(createdTimeIso);
    const diffMs = currentTime - created;
    const diffMins = Math.floor(diffMs / 60000);
    return diffMins >= 10; // Tandai merah jika sudah lebih dari 10 menit
  };

  const pendingCount = activeOrders.filter(o => kitchenStatusMap[o.id] !== 'READY').length;
  const readyCount = activeOrders.filter(o => kitchenStatusMap[o.id] === 'READY').length;

  return (
    <div className="kitchen-container">
      <div className="kitchen-header glass-panel">
        <ChefHat className="header-icon" size={24} />
        <h2>Antrean Monitor Dapur</h2>
        <div className="stats-badges">
          <span className="badge pending">Menunggu: {pendingCount}</span>
          <span className="badge ready">Selesai: {readyCount}</span>
        </div>
      </div>

      <div className="kitchen-grid">
        {/* KOLOM 1: ANTREAN MAKANAN */}
        <div className="kitchen-column">
          <h3 className="column-title">Sedang Disiapkan ({pendingCount})</h3>
          <div className="order-cards-container">
            {activeOrders
              .filter(o => kitchenStatusMap[o.id] !== 'READY')
              .map(order => {
                const isLate = isOrderLate(order.created_at);
                return (
                  <div key={order.id} className={`kitchen-card glass-panel ${isLate ? 'late-warning' : ''}`}>
                    <div className="card-header">
                      <span className="invoice-no">{order.invoice_no}</span>
                      <div className="time-elapsed">
                        <Clock size={12} />
                        <span>{getElapsedTime(order.created_at)}</span>
                      </div>
                    </div>

                    {isLate && (
                      <div className="late-banner">
                        <AlertTriangle size={14} />
                        <span>Pesanan Terlambat ( &gt;10 Menit)</span>
                      </div>
                    )}

                    <div className="order-items-list">
                      {order.items && order.items.map((item, idx) => (
                        <div key={idx} className="kitchen-item-row">
                          <span className="item-qty">{item.quantity}x</span>
                          <div className="item-detail">
                            <span className="item-name">{item.product_name || `Produk #${item.product_id}`}</span>
                            {item.notes && <span className="item-note">Catatan: {item.notes}</span>}
                          </div>
                        </div>
                      ))}
                    </div>

                    <button 
                      onClick={() => handleMarkReady(order.id)}
                      className="btn-mark-ready btn-primary"
                    >
                      <CheckCircle2 size={16} />
                      <span>Selesai Siapkan</span>
                    </button>
                  </div>
                );
              })}
            {pendingCount === 0 && (
              <div className="empty-state glass-panel">
                <Inbox size={40} className="empty-icon" />
                <p>Belum ada pesanan masuk</p>
                <span>Pesanan baru dari kasir akan muncul di sini.</span>
              </div>
            )}
          </div>
        </div>

        {/* KOLOM 2: SELESAI */}
        <div className="kitchen-column ready-column">
          <h3 className="column-title">Siap Disajikan ({readyCount})</h3>
          <div className="order-cards-container">
            {activeOrders
              .filter(o => kitchenStatusMap[o.id] === 'READY')
              .map(order => (
                <div key={order.id} className="kitchen-card glass-panel completed">
                  <div className="card-header">
                    <span className="invoice-no">{order.invoice_no}</span>
                    <span className="status-label">Siap Saji</span>
                  </div>
                  <div className="order-items-list">
                    {order.items && order.items.map((item, idx) => (
                      <div key={idx} className="kitchen-item-row strike">
                        <span className="item-qty">{item.quantity}x</span>
                        <span className="item-name">{item.product_name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            {readyCount === 0 && (
              <div className="empty-state glass-panel">
                <p>Belum ada pesanan selesai</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .kitchen-container {
          display: flex;
          flex-direction: column;
          gap: 20px;
          height: calc(100vh - 48px);
        }

        .kitchen-header {
          padding: 16px 24px;
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .header-icon {
          color: var(--primary);
        }

        .kitchen-header h2 {
          font-size: 18px;
          font-weight: 700;
          flex: 1;
        }

        .stats-badges {
          display: flex;
          gap: 10px;
        }

        .badge {
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 700;
        }

        .badge.pending {
          background: rgba(249, 115, 22, 0.1);
          color: var(--primary);
          border: 1px solid rgba(249, 115, 22, 0.2);
        }

        .badge.ready {
          background: rgba(34, 197, 94, 0.1);
          color: rgb(34, 197, 94);
          border: 1px solid rgba(34, 197, 94, 0.2);
        }

        .kitchen-grid {
          display: grid;
          grid-template-columns: 1.5fr 1fr;
          gap: 20px;
          flex: 1;
          overflow: hidden;
        }

        .kitchen-column {
          display: flex;
          flex-direction: column;
          gap: 14px;
          height: 100%;
          overflow: hidden;
        }

        .column-title {
          font-size: 15px;
          font-weight: 600;
          color: var(--text-muted);
          padding-left: 4px;
        }

        .order-cards-container {
          flex: 1;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 14px;
          padding-bottom: 24px;
        }

        .kitchen-card {
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          border-left: 4px solid var(--primary);
          transition: all 0.2s ease;
        }

        .kitchen-card.late-warning {
          border-left-color: #ef4444;
          box-shadow: 0 0 12px rgba(239, 68, 68, 0.15);
          background: rgba(239, 68, 68, 0.02);
        }

        .late-banner {
          background: rgba(239, 68, 68, 0.1);
          color: #f87171;
          border: 1px solid rgba(239, 68, 68, 0.2);
          border-radius: 8px;
          padding: 8px 12px;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 11px;
          font-weight: 600;
        }

        .kitchen-card.completed {
          border-left-color: rgb(34, 197, 94);
          opacity: 0.8;
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .invoice-no {
          font-size: 14px;
          font-weight: 700;
          color: var(--text-primary);
        }

        .time-elapsed {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 11px;
          color: var(--text-muted);
        }

        .status-label {
          font-size: 11px;
          font-weight: 700;
          color: rgb(34, 197, 94);
          background: rgba(34, 197, 94, 0.1);
          padding: 2px 8px;
          border-radius: 4px;
        }

        .order-items-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
          padding: 8px 0;
          border-top: 1px dashed var(--border-color);
          border-bottom: 1px dashed var(--border-color);
        }

        .kitchen-item-row {
          display: flex;
          align-items: flex-start;
          gap: 10px;
        }

        .kitchen-item-row.strike {
          text-decoration: line-through;
          color: var(--text-muted);
        }

        .item-qty {
          font-size: 14px;
          font-weight: 700;
          color: var(--primary);
          background: rgba(249, 115, 22, 0.1);
          padding: 2px 6px;
          border-radius: 4px;
          min-width: 28px;
          text-align: center;
        }

        .item-detail {
          display: flex;
          flex-direction: column;
        }

        .item-name {
          font-size: 13px;
          font-weight: 600;
          color: var(--text-primary);
        }

        .item-note {
          font-size: 11px;
          font-style: italic;
          color: var(--yellow);
          margin-top: 2px;
        }

        .btn-mark-ready {
          width: 100%;
          padding: 10px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }

        .empty-state {
          padding: 40px;
          text-align: center;
          color: var(--text-muted);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        .empty-icon {
          color: rgba(255,255,255,0.03);
          margin-bottom: 12px;
        }

        .empty-state p {
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 4px;
        }

        .empty-state span {
          font-size: 11px;
        }

        @media (max-width: 768px) {
          .kitchen-grid {
            grid-template-columns: 1fr;
          }
          .ready-column {
            display: none; /* Sembunyikan kolom selesai pada mobile */
          }
        }
      `}</style>
    </div>
  );
};

export default KitchenView;
