import React from 'react';
import { X, Printer, Check } from 'lucide-react';

const ReceiptModal = ({ order, onClose }) => {
  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  const formatDate = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleString('id-ID', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  // Hitung detail struk
  const subtotal = order.total_amount;
  const tax = 0; // PPN dihapus
  const total = subtotal;
  const paymentMethodText = {
    'CASH': 'TUNAI',
    'QRIS': 'QRIS / E-WALLET',
    'CARD': 'KARTU DEBIT/KREDIT'
  }[order.payment_method] || order.payment_method;

  // Nilai bayar dan kembalian
  const amountPaid = order.amount_paid || total;
  const change = Math.max(0, amountPaid - total);

  const formatRupiah = (number) => {
    return 'Rp ' + Math.round(number).toLocaleString('id-ID');
  };

  return (
    <div className="receipt-modal-overlay">
      <div className="receipt-modal-container glass-panel">
        <div className="receipt-modal-header">
          <div className="success-badge">
            <Check size={20} className="check-icon" />
          </div>
          <h3>Pembayaran Berhasil!</h3>
          <p>Transaksi telah disimpan ke sistem.</p>
        </div>

        <div className="receipt-scroll-area">
          {/* BAGIAN STRUK YANG AKAN DICETAK (ID: receipt-print) */}
          <div id="receipt-print" className="receipt-preview-container">
            <div className="receipt-header">
              <div className="receipt-title">KEDAI AA</div>
              <img src="/logo.png" alt="Logo Kedai AA" className="receipt-logo-bw" />
              <div className="receipt-subtitle">Kedai Dimsum AA & Ice Cream Nyemil</div>
              <div className="receipt-subtitle">FB: Cindy Apriandi</div>
              <div className="receipt-subtitle">Telp: 0813-1567-5013</div>
            </div>

            <div className="receipt-divider"></div>

            <div className="receipt-info">
              <div className="receipt-info-row">
                <span>No. Invoice:</span>
                <span>{order.invoice_no}</span>
              </div>
              <div className="receipt-info-row">
                <span>Tanggal:</span>
                <span>{formatDate(order.created_at)}</span>
              </div>
              <div className="receipt-info-row">
                <span>Kasir:</span>
                <span>{order.cashier_name || 'Kasir Utama'}</span>
              </div>
            </div>

            <div className="receipt-divider"></div>

            <div className="receipt-items">
              {order.items && order.items.map((item, index) => (
                <div key={index} className="receipt-item-group">
                  <div className="receipt-item-row">
                    <div className="receipt-item-details">
                      <span>{item.product_name || `Produk #${item.product_id}`}</span>
                      <span className="receipt-item-qty-price">
                        {item.quantity} x {formatRupiah(item.unit_price)}
                      </span>
                    </div>
                    <span className="receipt-item-total">
                      {formatRupiah(item.quantity * item.unit_price)}
                    </span>
                  </div>
                  {item.notes && (
                    <div className="receipt-item-notes">
                      * Catatan: {item.notes}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="receipt-divider"></div>

            <div className="receipt-total-section">
              <div className="receipt-info-row grand-total">
                <span>TOTAL:</span>
                <span>{formatRupiah(total)}</span>
              </div>
              <div className="receipt-divider"></div>
              <div className="receipt-info-row">
                <span>Metode:</span>
                <span>{paymentMethodText}</span>
              </div>
              <div className="receipt-info-row">
                <span>Bayar:</span>
                <span>{formatRupiah(amountPaid)}</span>
              </div>
              <div className="receipt-info-row">
                <span>Kembali:</span>
                <span>{formatRupiah(change)}</span>
              </div>
            </div>

            <div className="receipt-divider"></div>

            <div className="receipt-footer">
              <p>Terima Kasih</p>
              <p>Atas Kunjungan Anda!</p>
              <p className="powered-by">Sistem POS oleh Kedai AA</p>
            </div>
          </div>
        </div>

        <div className="receipt-modal-footer">
          <button onClick={onClose} className="btn-close">
            <X size={18} />
            <span>Tutup</span>
          </button>
          <button onClick={handlePrint} className="btn-print btn-primary">
            <Printer size={18} />
            <span>Cetak Struk (58mm)</span>
          </button>
        </div>
      </div>

      <style>{`
        .receipt-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.75);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 16px;
        }

        .receipt-modal-container {
          width: 100%;
          max-width: 400px;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 24px;
          border: 1px solid var(--border-color);
          animation: fade-in-scale 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .receipt-modal-header {
          text-align: center;
          margin-bottom: 20px;
        }

        .success-badge {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: rgba(34, 197, 94, 0.1);
          border: 2px solid rgb(34, 197, 94);
          color: rgb(34, 197, 94);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 12px;
          animation: scale-up 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .receipt-modal-header h3 {
          font-size: 18px;
          color: var(--text-primary);
          margin-bottom: 4px;
        }

        .receipt-modal-header p {
          font-size: 13px;
          color: var(--text-muted);
        }

        .receipt-scroll-area {
          width: 100%;
          max-height: 400px;
          overflow-y: auto;
          margin-bottom: 20px;
          padding: 4px;
          border-radius: 8px;
          background: rgba(0, 0, 0, 0.2);
        }

        /* Tampilan Preview Struk di Layar */
        .receipt-preview-container {
          background-color: #ffffff;
          color: #000000;
          font-family: 'Courier New', Courier, monospace;
          padding: 16px;
          width: 100%;
          max-width: 320px;
          margin: 0 auto;
          border: 1px dashed #ccc;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          border-radius: 4px;
          text-shadow: none; /* Hilangkan bayangan teks bawaan dark mode */
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
          font-size: 15px;
          font-weight: bold;
          letter-spacing: 1px;
          margin-bottom: 2px;
        }

        .receipt-subtitle {
          font-size: 10px;
          line-height: 1.3;
        }

        .receipt-divider {
          border-top: 1px dashed #000;
          margin: 8px 0;
        }

        .receipt-info {
          font-size: 10px;
        }

        .receipt-info-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 2px;
        }

        .receipt-items {
          margin-bottom: 8px;
        }

        .receipt-item-group {
          margin-bottom: 6px;
        }

        .receipt-item-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          font-size: 10px;
        }

        .receipt-item-details {
          display: flex;
          flex-direction: column;
          flex: 1;
        }

        .receipt-item-qty-price {
          font-size: 9px;
          color: #555;
          margin-top: 1px;
        }

        .receipt-item-total {
          font-weight: bold;
          white-space: nowrap;
        }

        .receipt-item-notes {
          font-size: 8px;
          font-style: italic;
          color: #666;
          margin-top: 2px;
        }

        .receipt-total-section {
          font-size: 10px;
        }

        .grand-total {
          font-size: 12px;
          font-weight: bold;
        }

        .receipt-footer {
          text-align: center;
          font-size: 10px;
          line-height: 1.4;
          margin-top: 12px;
        }

        .powered-by {
          font-size: 8px;
          margin-top: 8px;
          color: #777;
        }

        .receipt-modal-footer {
          width: 100%;
          display: flex;
          gap: 12px;
        }

        .btn-close {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px;
          border-radius: 12px;
          border: 1px solid var(--border-color);
          background: rgba(255, 255, 255, 0.05);
          color: var(--text-primary);
          cursor: pointer;
          font-weight: 600;
          font-size: 14px;
          transition: all 0.2s ease;
        }

        .btn-close:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .btn-print {
          flex: 1.5;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px;
          border-radius: 12px;
          font-weight: 600;
          font-size: 14px;
        }

        @keyframes fade-in-scale {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }

        @keyframes scale-up {
          from { transform: scale(0.5); }
          to { transform: scale(1); }
        }

        /* Pengaturan Cetak Halaman Khusus Struk */
        @media print {
          @page {
            size: 58mm auto;
            margin: 0;
          }
          .receipt-modal-overlay {
            background: transparent !important;
            position: absolute !important;
            padding: 0 !important;
            margin: 0 !important;
            display: block !important;
          }
          .receipt-modal-container {
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            margin: 0 !important;
            background: transparent !important;
          }
          .receipt-scroll-area {
            overflow-y: visible !important;
            max-height: none !important;
            background: transparent !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .receipt-preview-container {
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            margin: 0 !important;
            width: 58mm !important;
          }
        }
      `}</style>
    </div>
  );
};

export default ReceiptModal;
