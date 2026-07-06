import React, { useState, useMemo } from 'react';
import { Search, ShoppingCart, Trash2, Plus, Minus, CreditCard, QrCode, Coins, Check, FileText } from 'lucide-react';
import confetti from 'canvas-confetti';

const CashierView = ({ products, categories, onCreateOrder }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [cart, setCart] = useState([]);
  
  // State Pembayaran
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('CASH'); // 'CASH', 'QRIS', 'CARD'
  const [cashAmount, setCashAmount] = useState('');
  
  // State Diskon
  const [discountType, setDiscountType] = useState('PERCENT'); // 'PERCENT', 'NOMINAL'
  const [discountValue, setDiscountValue] = useState('');
  const [isDiscountApplied, setIsDiscountApplied] = useState(false);

  // Hitung Nilai Keranjang
  const cartSubtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }, [cart]);
  
  const cartTax = 0; // PPN dihapus
  
  const cartDiscount = useMemo(() => {
    if (!isDiscountApplied || !discountValue) return 0;
    const val = parseFloat(discountValue) || 0;
    if (discountType === 'PERCENT') {
      return Math.round(cartSubtotal * (val / 100));
    }
    return val;
  }, [isDiscountApplied, discountType, discountValue, cartSubtotal]);

  const cartTotal = Math.max(0, cartSubtotal - cartDiscount);

  // Filter Produk berdasarkan kategori dan pencarian
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      if (!product.active) return false;
      
      const matchesCategory = selectedCategory === 'ALL' || product.category_id === selectedCategory;
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase()));
      
      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  // Aksi Keranjang
  const addToCart = (product) => {
    if (product.stock <= 0) return;
    
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        if (existingItem.quantity >= product.stock) return prevCart; // Batasi sesuai stok
        return prevCart.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { ...product, quantity: 1, notes: '' }];
    });
  };

  const updateQuantity = (productId, delta) => {
    setCart(prevCart => {
      return prevCart.map(item => {
        if (item.id === productId) {
          const newQty = item.quantity + delta;
          const product = products.find(p => p.id === productId);
          
          if (newQty <= 0) return null;
          if (product && newQty > product.stock) return item; // Batasi sesuai stok
          
          return { ...item, quantity: newQty };
        }
        return item;
      }).filter(Boolean);
    });
  };

  const updateItemNotes = (productId, notes) => {
    setCart(prevCart => 
      prevCart.map(item => item.id === productId ? { ...item, notes } : item)
    );
  };

  const removeFromCart = (productId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
    setIsDiscountApplied(false);
    setDiscountValue('');
  };

  // Logika Pembayaran
  const handleOpenCheckout = () => {
    if (cart.length === 0) return;
    setIsCheckoutModalOpen(true);
    setCashAmount('');
  };

  const handleSelectQuickCash = (amount) => {
    setCashAmount(amount.toString());
  };

  const changeDue = useMemo(() => {
    if (paymentMethod !== 'CASH') return 0;
    const paid = parseFloat(cashAmount) || 0;
    return Math.max(0, paid - cartTotal);
  }, [cashAmount, cartTotal, paymentMethod]);

  const isPaymentValid = useMemo(() => {
    if (paymentMethod !== 'CASH') return true;
    const paid = parseFloat(cashAmount) || 0;
    return paid >= cartTotal;
  }, [cashAmount, cartTotal, paymentMethod]);

  const handleCompletePayment = async () => {
    if (!isPaymentValid) return;

    const orderData = {
      total_amount: cartTotal, // Final net amount after discount
      discount_amount: cartDiscount, // Discount amount saved separately
      payment_method: paymentMethod,
      cashier_name: 'Kasir Utama'
    };

    const orderItems = cart.map(item => ({
      product_id: item.id,
      product_name: item.name, // Lewatkan nama untuk struk
      quantity: item.quantity,
      unit_price: item.price,
      notes: item.notes
    }));

    try {
      // Simpan transaksi
      const completedOrder = await onCreateOrder({
        ...orderData,
        amount_paid: paymentMethod === 'CASH' ? parseFloat(cashAmount) : cartTotal
      }, orderItems);

      // Efek Confetti Perayaan
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#f97316', '#ec4899', '#06b6d4', '#eab308']
      });

      // Reset POS
      setCart([]);
      setIsDiscountApplied(false);
      setDiscountValue('');
      setIsCheckoutModalOpen(false);
    } catch (err) {
      alert('Gagal memproses transaksi: ' + err.message);
    }
  };

  const formatRupiah = (number) => {
    return 'Rp ' + Math.round(number).toLocaleString('id-ID');
  };

  // Denominasi uang cepat untuk pembayaran tunai
  const quickCashOptions = useMemo(() => {
    const options = [10000, 20000, 50000, 100000];
    // Masukkan "Uang Pas"
    return options;
  }, []);

  return (
    <div className="pos-container">
      {/* BAGIAN UTAMA: MENU & PROSPEK */}
      <div className="menu-section">
        {/* HEADER & PENCARIAN */}
        <div className="pos-header glass-panel">
          <div className="search-bar">
            <Search className="search-icon" size={20} />
            <input
              type="text"
              placeholder="Cari dim sum atau es krim favorit..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="category-tabs">
            <button
              onClick={() => setSelectedCategory('ALL')}
              className={`category-tab ${selectedCategory === 'ALL' ? 'active' : ''}`}
            >
              Semua Menu
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`category-tab ${selectedCategory === cat.id ? 'active' : ''}`}
                style={{ 
                  '--accent-color': cat.color,
                  borderColor: selectedCategory === cat.id ? cat.color : 'transparent' 
                }}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* DAFTAR PRODUK GRID */}
        <div className="product-grid">
          {filteredProducts.map((prod) => {
            const cat = categories.find(c => c.id === prod.category_id);
            const isOutOfStock = prod.stock <= 0;
            const inCart = cart.find(item => item.id === prod.id);
            
            return (
              <div 
                key={prod.id} 
                onClick={() => !isOutOfStock && addToCart(prod)}
                className={`product-card glass-panel ${isOutOfStock ? 'out-of-stock' : ''} ${inCart ? 'selected' : ''}`}
                style={{ '--card-accent': cat?.color || '#f97316' }}
              >
                {/* Gambar Produk */}
                <div className="product-card-image-wrapper">
                  <img 
                    src={prod.image_url || 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=400&auto=format&fit=crop&q=60'} 
                    alt={prod.name} 
                    className="product-card-image" 
                  />
                  <div className="card-badge" style={{ backgroundColor: cat?.color || '#f97316' }}>
                    {cat?.name}
                  </div>
                </div>
                
                <div className="product-details">
                  <h3 className="product-name">{prod.name}</h3>
                  <p className="product-desc">{prod.description}</p>
                  
                  <div className="product-footer">
                    <span className="product-price">{formatRupiah(prod.price)}</span>
                    <span className={`product-stock ${prod.stock < 10 ? 'low-stock' : ''}`}>
                      Stok: {prod.stock}
                    </span>
                  </div>
                </div>

                {isOutOfStock && (
                  <div className="out-of-stock-overlay">
                    <span>Habis</span>
                  </div>
                )}

                {inCart && (
                  <div className="selected-indicator">
                    <Check size={16} />
                    <span>{inCart.quantity}x</span>
                  </div>
                )}
              </div>
            );
          })}
          {filteredProducts.length === 0 && (
            <div className="empty-search glass-panel">
              <p>Menu tidak ditemukan. Coba ketik kata kunci lain.</p>
            </div>
          )}
        </div>
      </div>

      {/* KANAN: KERANJANG KASIR */}
      <div className="cart-section glass-panel">
        <div className="cart-header">
          <ShoppingCart size={22} className="cart-icon" />
          <h2>Keranjang Belanja</h2>
          {cart.length > 0 && (
            <button onClick={clearCart} className="btn-clear-cart" title="Kosongkan Keranjang">
              <Trash2 size={18} />
            </button>
          )}
        </div>

        <div className="cart-items-container">
          {cart.map((item) => (
            <div key={item.id} className="cart-item glass-panel">
              <div className="cart-item-info">
                <span className="item-name">{item.name}</span>
                <span className="item-price">{formatRupiah(item.price * item.quantity)}</span>
              </div>
              
              <input 
                type="text" 
                className="item-notes-input" 
                placeholder="Tambah catatan (misal: pedas, es dipisah)..."
                value={item.notes}
                onChange={(e) => updateItemNotes(item.id, e.target.value)}
              />

              <div className="cart-item-actions">
                <button onClick={() => removeFromCart(item.id)} className="btn-trash">
                  <Trash2 size={16} />
                </button>
                <div className="quantity-adjuster">
                  <button onClick={() => updateQuantity(item.id, -1)} className="btn-qty">
                    <Minus size={14} />
                  </button>
                  <span className="item-qty">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, 1)} className="btn-qty">
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {cart.length === 0 && (
            <div className="empty-cart">
              <ShoppingCart size={48} className="empty-cart-icon" />
              <p>Keranjang kosong</p>
              <span>Ketuk menu di sebelah kiri untuk menambahkan.</span>
            </div>
          )}
        </div>

        {/* HITUNGAN TOTAL & CHECKOUT */}
        {cart.length > 0 && (
          <div className="cart-summary">
            {/* Input Diskon */}
            <div className="discount-section" style={{
              paddingBottom: '12px',
              borderBottom: '1px solid var(--border-color)',
              marginBottom: '12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>Diskon / Promo</span>
                <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}>
                  <input 
                    type="checkbox" 
                    checked={isDiscountApplied} 
                    onChange={(e) => setIsDiscountApplied(e.target.checked)} 
                    style={{ cursor: 'pointer' }}
                  />
                  <span>Aktifkan</span>
                </label>
              </div>
              
              {isDiscountApplied && (
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <select 
                    value={discountType} 
                    onChange={(e) => setDiscountType(e.target.value)}
                    style={{
                      padding: '6px 8px',
                      background: '#ffffff',
                      border: '1px solid var(--border-color)',
                      borderRadius: '6px',
                      fontSize: '12px',
                      outline: 'none',
                      color: 'var(--text-primary)'
                    }}
                  >
                    <option value="PERCENT">%</option>
                    <option value="NOMINAL">Rp</option>
                  </select>
                  <input 
                    type="number" 
                    min="0"
                    placeholder={discountType === 'PERCENT' ? 'Persen (misal: 10)' : 'Nominal (misal: 5000)'}
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    style={{
                      flex: 1,
                      padding: '6px 10px',
                      background: '#ffffff',
                      border: '1px solid var(--border-color)',
                      borderRadius: '6px',
                      fontSize: '12px',
                      outline: 'none',
                      color: 'var(--text-primary)'
                    }}
                  />
                </div>
              )}
            </div>

            {/* Subtotal & Diskon Row (jika ada diskon) */}
            {cartDiscount > 0 && (
              <>
                <div className="summary-row" style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span>Subtotal</span>
                  <span>{formatRupiah(cartSubtotal)}</span>
                </div>
                <div className="summary-row" style={{ fontSize: '13px', color: '#ef4444', display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span>Potongan Diskon</span>
                  <span>-{formatRupiah(cartDiscount)}</span>
                </div>
              </>
            )}

            <div className="summary-row total">
              <span>Total Bayar</span>
              <span>{formatRupiah(cartTotal)}</span>
            </div>
            
            <button onClick={handleOpenCheckout} className="btn-checkout btn-primary">
              <FileText size={18} />
              <span>Lanjut ke Pembayaran</span>
            </button>
          </div>
        )}
      </div>

      {/* MODAL PEMBAYARAN */}
      {isCheckoutModalOpen && (
        <div className="checkout-overlay">
          <div className="checkout-container glass-panel">
            <div className="checkout-header">
              <h2>Proses Pembayaran</h2>
              <button onClick={() => setIsCheckoutModalOpen(false)} className="btn-close-modal">✕</button>
            </div>

            <div className="checkout-body">
              <div className="amount-summary">
                <span className="label">TOTAL AKHIR</span>
                <span className="value">{formatRupiah(cartTotal)}</span>
              </div>

              {/* PILIHAN METODE PEMBAYARAN */}
              <div className="payment-methods">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('CASH')}
                  className={`method-tab ${paymentMethod === 'CASH' ? 'active' : ''}`}
                >
                  <Coins size={18} />
                  <span>Tunai (Cash)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('QRIS')}
                  className={`method-tab ${paymentMethod === 'QRIS' ? 'active' : ''}`}
                >
                  <QrCode size={18} />
                  <span>QRIS</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('CARD')}
                  className={`method-tab ${paymentMethod === 'CARD' ? 'active' : ''}`}
                >
                  <CreditCard size={18} />
                  <span>Kartu</span>
                </button>
              </div>

              {/* FORM KHUSUS TUNAI */}
              {paymentMethod === 'CASH' && (
                <div className="cash-payment-form">
                  <div className="form-group">
                    <label>Jumlah Uang Tunai Diterima</label>
                    <div className="input-group">
                      <span className="input-prefix">Rp</span>
                      <input
                        type="number"
                        placeholder="Masukkan jumlah bayar..."
                        value={cashAmount}
                        onChange={(e) => setCashAmount(e.target.value)}
                        className="cash-input"
                        autoFocus
                      />
                    </div>
                  </div>

                  <div className="quick-cash-grid">
                    <button onClick={() => handleSelectQuickCash(cartTotal)} className="quick-cash-btn pass-amount">
                      Uang Pas
                    </button>
                    {quickCashOptions.map((amount) => (
                      <button 
                        key={amount} 
                        onClick={() => handleSelectQuickCash(amount)}
                        className="quick-cash-btn"
                        disabled={amount < cartTotal}
                      >
                        {amount.toLocaleString('id-ID')}
                      </button>
                    ))}
                  </div>

                  <div className="change-summary">
                    <span className="label">Kembalian</span>
                    <span className={`value ${changeDue > 0 ? 'has-change' : ''}`}>
                      {formatRupiah(changeDue)}
                    </span>
                  </div>
                </div>
              )}

              {/* TAMPILAN QRIS */}
              {paymentMethod === 'QRIS' && (
                <div className="qris-display">
                  <div className="qris-code">
                    <QrCode size={160} className="qr-graphic" />
                    <div className="qris-branding">QRIS GPN DUMMY</div>
                  </div>
                  <p>Tunjukkan QR Code ini pada pelanggan untuk di-scan.</p>
                </div>
              )}

              {/* TAMPILAN KARTU */}
              {paymentMethod === 'CARD' && (
                <div className="card-display">
                  <CreditCard size={64} className="card-graphic" />
                  <p>Masukkan kartu pada mesin EDC Merchant Anda, lalu lakukan swipe/insert.</p>
                </div>
              )}
            </div>

            <div className="checkout-footer">
              <button onClick={() => setIsCheckoutModalOpen(false)} className="btn-cancel">Batal</button>
              <button
                onClick={handleCompletePayment}
                disabled={!isPaymentValid}
                className="btn-complete btn-primary"
              >
                <Check size={18} />
                <span>Selesaikan Transaksi</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .pos-container {
          display: flex;
          gap: 20px;
          height: calc(100vh - 48px);
        }

        .menu-section {
          flex: 1.6;
          display: flex;
          flex-direction: column;
          gap: 20px;
          height: 100%;
        }

        .pos-header {
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .search-bar {
          position: relative;
          width: 100%;
        }

        .search-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted);
        }

        .search-bar input {
          width: 100%;
          padding: 12px 14px 12px 46px;
          background: #ffffff;
          border: 1px solid var(--border-color);
          border-radius: 12px;
          color: var(--text-primary);
          font-size: 15px;
          outline: none;
          transition: border-color 0.2s ease;
        }

        .search-bar input:focus {
          border-color: var(--primary);
        }

        .category-tabs {
          display: flex;
          gap: 10px;
          overflow-x: auto;
          padding-bottom: 4px;
        }

        .category-tab {
          padding: 8px 16px;
          border-radius: 20px;
          border: 1px solid var(--border-color);
          background: rgba(255, 255, 255, 0.02);
          color: var(--text-muted);
          font-size: 13px;
          font-weight: 600;
          white-space: nowrap;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .category-tab:hover {
          color: var(--text-primary);
          background: rgba(255, 255, 255, 0.05);
        }

        .category-tab.active {
          background: var(--accent-color, var(--primary));
          color: white;
          border-color: var(--accent-color, var(--primary));
          box-shadow: 0 4px 10px rgba(0,0,0,0.15);
        }

        .product-grid {
          flex: 1;
          overflow-y: auto;
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          gap: 16px;
          padding-bottom: 24px;
        }

        .product-card {
          position: relative;
          padding: 16px;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          height: 230px;
          transition: all 0.2s ease;
          border-left: 4px solid var(--card-accent);
          overflow: hidden;
        }

        .product-card-image-wrapper {
          position: relative;
          width: 100%;
          height: 110px;
          overflow: hidden;
          border-radius: 8px;
        }

        .product-card-image-wrapper::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          border: 1px solid var(--border-color);
          border-radius: 8px;
          pointer-events: none;
          z-index: 2;
        }

        .product-card-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }

        .product-card:hover .product-card-image {
          transform: scale(1.06);
        }

        .product-card:hover {
          background: var(--bg-surface-hover);
          transform: translateY(-2px);
          box-shadow: 0 6px 14px rgba(0, 0, 0, 0.25);
        }

        .product-card.selected {
          border-color: var(--primary);
          background: rgba(249, 115, 22, 0.04);
        }

        .card-badge {
          position: absolute;
          top: 8px;
          right: 8px;
          font-size: 10px;
          font-weight: 700;
          color: white;
          padding: 3px 8px;
          border-radius: 20px;
          z-index: 5;
        }

        .product-details {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          flex: 1;
          margin-top: 10px;
        }

        .product-name {
          font-size: 15px;
          font-weight: 600;
          color: var(--text-primary);
          line-height: 1.3;
          margin-bottom: 4px;
        }

        .product-desc {
          font-size: 11px;
          color: var(--text-muted);
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          margin-bottom: 12px;
        }

        .product-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .product-price {
          font-size: 15px;
          font-weight: 700;
          color: var(--text-primary);
        }

        .product-stock {
          font-size: 10px;
          color: var(--text-muted);
          background: rgba(255,255,255,0.03);
          padding: 2px 6px;
          border-radius: 4px;
        }

        .product-stock.low-stock {
          color: var(--secondary);
          background: rgba(236, 72, 249, 0.05);
        }

        .out-of-stock {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .out-of-stock-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(9, 13, 22, 0.8);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 16px;
          color: var(--text-muted);
          text-transform: uppercase;
        }

        .selected-indicator {
          position: absolute;
          bottom: 12px;
          right: 12px;
          background: var(--primary);
          color: white;
          border-radius: 8px;
          padding: 2px 8px;
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 11px;
          font-weight: 700;
          box-shadow: 0 2px 6px rgba(249, 115, 22, 0.3);
        }

        /* KERANJANG KASIR */
        .cart-section {
          flex: 0.9;
          display: flex;
          flex-direction: column;
          height: 100%;
          overflow: hidden;
        }

        .cart-header {
          padding: 20px;
          border-bottom: 1px solid var(--border-color);
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .cart-icon {
          color: var(--primary);
        }

        .cart-header h2 {
          font-size: 16px;
          font-weight: 600;
          flex: 1;
        }

        .btn-clear-cart {
          border: none;
          background: transparent;
          color: var(--text-muted);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 4px;
          border-radius: 6px;
          transition: all 0.2s ease;
        }

        .btn-clear-cart:hover {
          color: var(--secondary);
          background: rgba(236, 72, 153, 0.08);
        }

        .cart-items-container {
          flex: 1;
          overflow-y: auto;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .cart-item {
          padding: 12px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          background: #ffffff;
          border: 1px solid var(--border-color);
          border-radius: 12px;
          box-shadow: var(--shadow-sm);
        }

        .cart-item-info {
          display: flex;
          justify-content: space-between;
          font-weight: 600;
          font-size: 13px;
        }

        .item-price {
          color: var(--primary);
        }

        .item-notes-input {
          width: 100%;
          background: #f8fafc;
          border: 1px solid var(--border-color);
          border-radius: 6px;
          padding: 6px 10px;
          font-size: 11px;
          color: var(--text-primary);
          outline: none;
        }

        .item-notes-input:focus {
          border-color: rgba(249, 115, 22, 0.5);
        }

        .cart-item-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 4px;
        }

        .btn-trash {
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          padding: 4px;
          border-radius: 6px;
          transition: all 0.2s ease;
        }

        .btn-trash:hover {
          color: #ef4444;
          background: rgba(239, 68, 68, 0.08);
        }

        .quantity-adjuster {
          display: flex;
          align-items: center;
          gap: 10px;
          background: #f8fafc;
          border: 1px solid var(--border-color);
          border-radius: 8px;
          padding: 2px;
        }

        .btn-qty {
          width: 24px;
          height: 24px;
          border: none;
          background: transparent;
          color: var(--text-primary);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 6px;
          transition: all 0.2s ease;
        }

        .btn-qty:hover {
          background: rgba(255, 255, 255, 0.05);
        }

        .item-qty {
          font-size: 13px;
          font-weight: 600;
          min-width: 18px;
          text-align: center;
        }

        .empty-cart {
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          color: var(--text-muted);
          padding: 20px;
        }

        .empty-cart-icon {
          color: var(--border-color);
          margin-bottom: 12px;
        }

        .empty-cart p {
          font-weight: 600;
          margin-bottom: 4px;
          color: var(--text-primary);
        }

        .empty-cart span {
          font-size: 11px;
        }

        .cart-summary {
          padding: 20px;
          border-top: 1px solid var(--border-color);
          background: rgba(0, 0, 0, 0.01);
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .summary-row {
          display: flex;
          justify-content: space-between;
          font-size: 13px;
          color: var(--text-muted);
        }

        .summary-row.total {
          font-size: 16px;
          font-weight: 700;
          color: var(--text-primary);
          border-top: 1px dashed var(--border-color);
          padding-top: 10px;
        }

        .btn-checkout {
          width: 100%;
          padding: 14px;
          border-radius: 12px;
          font-weight: 600;
          font-size: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-top: 8px;
        }

        /* MODAL PEMBAYARAN */
        .checkout-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 500;
          padding: 16px;
        }

        .checkout-container {
          width: 100%;
          max-width: 460px;
          display: flex;
          flex-direction: column;
          padding: 24px;
          border: 1px solid var(--border-color);
          animation: fade-in-scale 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .checkout-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .checkout-header h2 {
          font-size: 18px;
          font-weight: 700;
        }

        .btn-close-modal {
          background: transparent;
          border: none;
          color: var(--text-muted);
          font-size: 18px;
          cursor: pointer;
        }

        .amount-summary {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border-color);
          padding: 16px;
          border-radius: 12px;
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 20px;
        }

        .amount-summary .label {
          font-size: 11px;
          font-weight: 700;
          color: var(--text-muted);
          letter-spacing: 1px;
          margin-bottom: 4px;
        }

        .amount-summary .value {
          font-size: 28px;
          font-weight: 800;
          color: var(--primary);
        }

        .payment-methods {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
          margin-bottom: 20px;
        }

        .method-tab {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          padding: 12px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border-color);
          border-radius: 10px;
          cursor: pointer;
          color: var(--text-muted);
          transition: all 0.2s ease;
        }

        .method-tab:hover {
          background: rgba(255, 255, 255, 0.05);
          color: var(--text-primary);
        }

        .method-tab.active {
          background: rgba(249, 115, 22, 0.1);
          border-color: var(--primary);
          color: var(--primary);
        }

        .method-tab span {
          font-size: 12px;
          font-weight: 600;
        }

        .cash-payment-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .form-group label {
          font-size: 13px;
          color: var(--text-muted);
        }

        .input-group {
          position: relative;
          display: flex;
          align-items: center;
        }

        .input-prefix {
          position: absolute;
          left: 14px;
          font-weight: 700;
          color: var(--text-muted);
        }

        .cash-input {
          width: 100%;
          padding: 12px 14px 12px 38px;
          background: #ffffff;
          border: 1px solid var(--border-color);
          border-radius: 10px;
          color: var(--text-primary);
          font-size: 18px;
          font-weight: 700;
          outline: none;
          text-align: right;
        }

        .cash-input:focus {
          border-color: var(--primary);
        }

        .quick-cash-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 8px;
        }

        .quick-cash-btn {
          padding: 8px;
          background: #ffffff;
          border: 1px solid var(--border-color);
          border-radius: 8px;
          color: var(--text-primary);
          font-size: 11px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .quick-cash-btn:hover:not(:disabled) {
          background: rgba(255,255,255,0.08);
        }

        .quick-cash-btn.pass-amount {
          background: rgba(34, 197, 94, 0.1);
          border-color: rgba(34, 197, 94, 0.3);
          color: rgb(34, 197, 94);
          grid-column: span 1;
        }

        .quick-cash-btn:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        .change-summary {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          background: rgba(0,0,0,0.03);
          border-radius: 10px;
          margin-top: 10px;
        }

        .change-summary .label {
          font-size: 13px;
          color: var(--text-muted);
        }

        .change-summary .value {
          font-size: 20px;
          font-weight: 700;
          color: var(--text-muted);
        }

        .change-summary .value.has-change {
          color: rgb(34, 197, 94);
        }

        .qris-display, .card-display {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 24px;
          background: rgba(255, 255, 255, 0.01);
          border: 1px dashed var(--border-color);
          border-radius: 12px;
          text-align: center;
        }

        .qr-graphic {
          color: white;
          padding: 10px;
          background: white;
          border-radius: 8px;
          margin-bottom: 12px;
          box-shadow: 0 4px 10px rgba(0,0,0,0.2);
        }

        .qris-branding {
          color: #000;
          font-weight: 800;
          font-size: 12px;
          margin-top: -6px;
          background: white;
          width: 100%;
          border-radius: 0 0 8px 8px;
          padding: 2px 0;
        }

        .card-graphic {
          color: var(--accent);
          margin-bottom: 16px;
          animation: pulse 2s infinite ease-in-out;
        }

        .qris-display p, .card-display p {
          font-size: 13px;
          color: var(--text-muted);
          line-height: 1.4;
          margin-top: 8px;
        }

        .checkout-footer {
          display: flex;
          gap: 12px;
          margin-top: 24px;
        }

        .btn-cancel {
          flex: 1;
          padding: 12px;
          border-radius: 10px;
          border: 1px solid var(--border-color);
          background: transparent;
          color: var(--text-muted);
          cursor: pointer;
          font-weight: 600;
        }

        .btn-cancel:hover {
          background: rgba(255, 255, 255, 0.03);
          color: var(--text-primary);
        }

        .btn-complete {
          flex: 1.5;
          padding: 12px;
          border-radius: 10px;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .btn-complete:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          box-shadow: none;
          transform: none;
        }

        .empty-search {
          grid-column: 1 / -1;
          padding: 40px;
          text-align: center;
          color: var(--text-muted);
        }

        @keyframes pulse {
          0% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.05); opacity: 1; }
          100% { transform: scale(1); opacity: 0.8; }
        }

        @media (max-width: 992px) {
          .pos-container {
            flex-direction: column;
            height: auto;
          }
          .menu-section, .cart-section {
            flex: none;
            height: auto;
          }
        }
      `}</style>
    </div>
  );
};

export default CashierView;
