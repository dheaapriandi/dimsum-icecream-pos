import React, { useState, useMemo } from 'react';
import { Package, Plus, Edit, Trash2, CheckCircle2, XCircle, Search } from 'lucide-react';

const InventoryView = ({ products, categories, onAddProduct, onUpdateProduct, onDeleteProduct }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  
  // State Modal (Add/Edit)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null); // null = mode tambah baru
  
  // Fields Form
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [stock, setStock] = useState('');
  const [isActive, setIsActive] = useState(true);

  // Filter produk
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesCategory = selectedCategory === 'ALL' || product.category_id === selectedCategory;
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  // Buka Modal Tambah Baru
  const handleOpenAdd = () => {
    setEditingProduct(null);
    setName('');
    setDescription('');
    setPrice('');
    setCategoryId(categories[0]?.id || '');
    setStock('50');
    setIsActive(true);
    setIsModalOpen(true);
  };

  // Buka Modal Edit
  const handleOpenEdit = (product) => {
    setEditingProduct(product);
    setName(product.name);
    setDescription(product.description || '');
    setPrice(product.price.toString());
    setCategoryId(product.category_id || '');
    setStock(product.stock.toString());
    setIsActive(product.active);
    setIsModalOpen(true);
  };

  // Simpan Form
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !price || !categoryId) return alert('Nama, Kategori, dan Harga wajib diisi!');

    const parsedPrice = parseFloat(price);
    const parsedStock = parseInt(stock) || 0;

    if (parsedPrice < 0) return alert('Harga tidak boleh negatif!');
    if (parsedStock < 0) return alert('Stok tidak boleh negatif!');

    const productPayload = {
      name,
      description,
      price: parsedPrice,
      category_id: categoryId,
      stock: parsedStock,
      active: isActive
    };

    try {
      if (editingProduct) {
        // Mode Edit
        await onUpdateProduct(editingProduct.id, productPayload);
      } else {
        // Mode Tambah Baru
        await onAddProduct(productPayload);
      }
      setIsModalOpen(false);
    } catch (err) {
      alert('Gagal menyimpan produk: ' + err.message);
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus "${name}" dari menu?`)) {
      try {
        await onDeleteProduct(id);
      } catch (err) {
        alert('Gagal menghapus produk: ' + err.message);
      }
    }
  };

  const toggleStatus = async (product) => {
    try {
      await onUpdateProduct(product.id, { active: !product.active });
    } catch (err) {
      alert('Gagal memperbarui status: ' + err.message);
    }
  };

  const formatRupiah = (number) => {
    return 'Rp ' + Math.round(number).toLocaleString('id-ID');
  };

  return (
    <div className="inventory-container">
      <div className="inventory-header glass-panel">
        <Package className="header-icon" size={24} />
        <h2>Kelola Menu & Stok Produk</h2>
        <button onClick={handleOpenAdd} className="btn-add-product btn-primary">
          <Plus size={16} />
          <span>Tambah Menu Baru</span>
        </button>
      </div>

      {/* FILTER & PENCARIAN */}
      <div className="inventory-filters-card glass-panel">
        <div className="search-bar">
          <Search className="search-icon" size={18} />
          <input
            type="text"
            placeholder="Cari produk berdasarkan nama..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="category-select-wrapper">
          <select 
            value={selectedCategory} 
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="category-select"
          >
            <option value="ALL">Semua Kategori</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* LIST PRODUK TABLE */}
      <div className="inventory-card glass-panel table-card">
        <div className="table-wrapper">
          <table className="inventory-table">
            <thead>
              <tr>
                <th>Nama Produk</th>
                <th>Kategori</th>
                <th>Harga Jual</th>
                <th>Sisa Stok</th>
                <th>Status Kasir</th>
                <th className="text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((prod) => {
                const cat = categories.find(c => c.id === prod.category_id);
                return (
                  <tr key={prod.id} className={!prod.active ? 'inactive-row' : ''}>
                    <td>
                      <div className="product-info-cell">
                        <span className="name">{prod.name}</span>
                        {prod.description && <span className="desc">{prod.description}</span>}
                      </div>
                    </td>
                    <td>
                      <span className="category-tag" style={{ '--tag-color': cat?.color || '#999' }}>
                        {cat ? cat.name : 'Uncategorized'}
                      </span>
                    </td>
                    <td className="bold">{formatRupiah(prod.price)}</td>
                    <td>
                      <span className={`stock-indicator ${prod.stock < 10 ? 'low' : ''}`}>
                        {prod.stock} Porsi
                      </span>
                    </td>
                    <td>
                      <button 
                        onClick={() => toggleStatus(prod)}
                        className={`status-toggle-btn ${prod.active ? 'active' : 'inactive'}`}
                        title={prod.active ? 'Klik untuk sembunyikan dari kasir' : 'Klik untuk tampilkan di kasir'}
                      >
                        {prod.active ? (
                          <>
                            <CheckCircle2 size={14} />
                            <span>Tayang</span>
                          </>
                        ) : (
                          <>
                            <XCircle size={14} />
                            <span>Arsip</span>
                          </>
                        )}
                      </button>
                    </td>
                    <td className="text-right">
                      <div className="action-buttons">
                        <button onClick={() => handleOpenEdit(prod)} className="btn-action edit" title="Edit Produk">
                          <Edit size={14} />
                        </button>
                        <button onClick={() => handleDelete(prod.id, prod.name)} className="btn-action delete" title="Hapus Produk">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan="6" className="empty-table">Belum ada produk untuk ditampilkan.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Tampilan List Kartu untuk HP / Tablet */}
        <div className="mobile-product-list">
          {filteredProducts.map((prod) => {
            const cat = categories.find(c => c.id === prod.category_id);
            return (
              <div key={prod.id} className={`mobile-product-card glass-panel ${!prod.active ? 'inactive-row' : ''}`}>
                <div className="mobile-card-top">
                  <div className="product-info">
                    <span className="mobile-product-name">{prod.name}</span>
                    {prod.description && <span className="mobile-product-desc">{prod.description}</span>}
                  </div>
                  <span className="category-tag" style={{ '--tag-color': cat?.color || '#999' }}>
                    {cat ? cat.name : 'Uncategorized'}
                  </span>
                </div>
                
                <div className="mobile-card-middle">
                  <div className="metric">
                    <span className="label">Harga Jual</span>
                    <span className="value bold">{formatRupiah(prod.price)}</span>
                  </div>
                  <div className="metric">
                    <span className="label">Sisa Stok</span>
                    <span className={`value stock-indicator ${prod.stock < 10 ? 'low' : ''}`}>
                      {prod.stock} Porsi
                    </span>
                  </div>
                </div>

                <div className="mobile-card-actions">
                  <button 
                    onClick={() => toggleStatus(prod)}
                    className={`status-toggle-btn ${prod.active ? 'active' : 'inactive'}`}
                    title={prod.active ? 'Klik untuk sembunyikan' : 'Klik untuk tampilkan'}
                  >
                    {prod.active ? (
                      <>
                        <CheckCircle2 size={14} />
                        <span>Tayang</span>
                      </>
                    ) : (
                      <>
                        <XCircle size={14} />
                        <span>Arsip</span>
                      </>
                    )}
                  </button>
                  
                  <div className="action-buttons">
                    <button onClick={() => handleOpenEdit(prod)} className="btn-action edit" title="Edit Produk">
                      <Edit size={14} />
                    </button>
                    <button onClick={() => handleDelete(prod.id, prod.name)} className="btn-action delete" title="Hapus Produk">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
          {filteredProducts.length === 0 && (
            <div className="empty-table" style={{ padding: '24px', textAlign: 'center' }}>
              Belum ada produk untuk ditampilkan.
            </div>
          )}
        </div>
      </div>

      {/* MODAL FORM TAMBAH / EDIT */}
      {isModalOpen && (
        <div className="form-overlay">
          <form onSubmit={handleSubmit} className="form-container glass-panel">
            <div className="form-header">
              <h2>{editingProduct ? 'Edit Menu Produk' : 'Tambah Menu Baru'}</h2>
              <button type="button" onClick={() => setIsModalOpen(false)} className="btn-close-form">✕</button>
            </div>

            <div className="form-body">
              <div className="form-group">
                <label>Nama Menu *</label>
                <input
                  type="text"
                  placeholder="Misal: Siomay Ayam Mozzarella"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Kategori *</label>
                <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label>Harga Jual (Rupiah) *</label>
                  <input
                    type="number"
                    placeholder="Contoh: 15000"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Stok Awal *</label>
                  <input
                    type="number"
                    placeholder="Contoh: 50"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Deskripsi Menu</label>
                <textarea
                  placeholder="Jelaskan isi/rasa menu..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows="3"
                />
              </div>

              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                  />
                  <span>Tampilkan di Kasir POS (Aktif)</span>
                </label>
              </div>
            </div>

            <div className="form-footer">
              <button type="button" onClick={() => setIsModalOpen(false)} className="btn-cancel">Batal</button>
              <button type="submit" className="btn-save btn-primary">
                Simpan Menu
              </button>
            </div>
          </form>
        </div>
      )}

      <style>{`
        .inventory-container {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .inventory-header {
          padding: 16px 24px;
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .header-icon {
          color: var(--primary);
        }

        .inventory-header h2 {
          font-size: 18px;
          font-weight: 700;
          flex: 1;
        }

        .btn-add-product {
          padding: 10px 18px;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .inventory-filters-card {
          padding: 16px;
          display: flex;
          gap: 16px;
        }

        .inventory-filters-card .search-bar {
          position: relative;
          flex: 1;
        }

        .inventory-filters-card .search-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted);
        }

        .inventory-filters-card .search-bar input {
          width: 100%;
          padding: 10px 14px 10px 42px;
          background: #ffffff;
          border: 1px solid var(--border-color);
          border-radius: 8px;
          color: var(--text-primary);
          font-size: 14px;
          outline: none;
        }

        .inventory-filters-card .search-bar input:focus {
          border-color: var(--primary);
        }

        .category-select-wrapper {
          width: 200px;
        }

        .category-select {
          width: 100%;
          padding: 10px 12px;
          background: #ffffff;
          border: 1px solid var(--border-color);
          border-radius: 8px;
          color: var(--text-primary);
          font-size: 14px;
          outline: none;
          cursor: pointer;
        }

        /* TABLE */
        .inventory-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }

        .inventory-table th, .inventory-table td {
          padding: 14px 20px;
          font-size: 13px;
          border-bottom: 1px solid var(--border-color);
        }

        .inventory-table th {
          background: rgba(255,255,255,0.01);
          color: var(--text-muted);
          font-weight: 600;
        }

        .inventory-table tr:last-child td {
          border-bottom: none;
        }

        .inactive-row {
          opacity: 0.55;
        }

        .product-info-cell {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .product-info-cell .name {
          font-weight: 700;
          font-size: 14px;
          color: var(--text-primary);
        }

        .product-info-cell .desc {
          font-size: 11px;
          color: var(--text-muted);
        }

        .category-tag {
          font-size: 11px;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: 20px;
          border: 1px solid var(--tag-color);
          color: var(--tag-color);
        }

        .inventory-table td.bold {
          font-weight: 700;
          font-size: 14px;
        }

        .stock-indicator {
          font-weight: 600;
          color: rgb(34, 197, 94);
        }

        .stock-indicator.low {
          color: var(--secondary);
        }

        .status-toggle-btn {
          border: none;
          background: transparent;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 700;
          transition: all 0.2s ease;
        }

        .status-toggle-btn.active {
          background: rgba(34, 197, 94, 0.1);
          color: rgb(34, 197, 94);
        }

        .status-toggle-btn.inactive {
          background: rgba(255, 255, 255, 0.05);
          color: var(--text-muted);
        }

        .action-buttons {
          display: flex;
          justify-content: flex-end;
          gap: 8px;
        }

        .btn-action {
          width: 28px;
          height: 28px;
          border-radius: 6px;
          border: 1px solid var(--border-color);
          background: rgba(255,255,255,0.03);
          color: var(--text-muted);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }

        .btn-action:hover {
          color: var(--text-primary);
          background: rgba(255,255,255,0.08);
        }

        .btn-action.delete:hover {
          color: #ef4444;
          background: rgba(239, 68, 68, 0.08);
          border-color: rgba(239, 68, 68, 0.2);
        }

        /* MODAL FORM */
        .form-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.75);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 500;
          padding: 16px;
        }

        .form-container {
          width: 100%;
          max-width: 480px;
          display: flex;
          flex-direction: column;
          padding: 24px;
          border: 1px solid var(--border-color);
          animation: fade-in-scale 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .form-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .form-header h2 {
          font-size: 18px;
          font-weight: 700;
        }

        .btn-close-form {
          background: transparent;
          border: none;
          color: var(--text-muted);
          font-size: 18px;
          cursor: pointer;
        }

        .form-body {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .form-group label {
          font-size: 12px;
          font-weight: 600;
          color: var(--text-muted);
        }

        .form-group input[type="text"],
        .form-group input[type="number"],
        .form-group select,
        .form-group textarea {
          width: 100%;
          padding: 10px 12px;
          background: #ffffff;
          border: 1px solid var(--border-color);
          border-radius: 8px;
          color: var(--text-primary);
          font-size: 14px;
          outline: none;
          transition: border-color 0.2s ease;
        }

        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
          border-color: var(--primary);
        }

        .form-row-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .checkbox-group {
          padding-top: 4px;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          font-size: 13px !important;
          color: var(--text-primary) !important;
        }

        .checkbox-label input {
          width: 16px;
          height: 16px;
          accent-color: var(--primary);
        }

        .form-footer {
          display: flex;
          gap: 12px;
          margin-top: 24px;
        }

        .form-footer button {
          flex: 1;
          padding: 12px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 13px;
          cursor: pointer;
        }

        .form-footer .btn-cancel {
          background: transparent;
          border: 1px solid var(--border-color);
          color: var(--text-muted);
        }

        .form-footer .btn-cancel:hover {
          background: rgba(255,255,255,0.03);
          color: var(--text-primary);
        }
        .form-footer .btn-save {
          border: none;
        }

        @keyframes fade-in-scale {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }

        /* Mobile Card Styles */
        .mobile-product-list {
          display: none;
          flex-direction: column;
          gap: 12px;
          padding: 16px;
        }

        .mobile-product-card {
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          border-radius: 12px;
          background: #ffffff;
          border: 1px solid var(--border-color);
        }

        .mobile-card-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 12px;
        }

        .mobile-card-top .product-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
          text-align: left;
        }

        .mobile-product-name {
          font-weight: 700;
          font-size: 15px;
          color: var(--text-primary);
        }

        .mobile-product-desc {
          font-size: 11px;
          color: var(--text-muted);
          line-height: 1.4;
        }

        .mobile-card-middle {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          padding: 10px 12px;
          background: rgba(0, 0, 0, 0.01);
          border-radius: 8px;
          border: 1px solid rgba(0, 0, 0, 0.02);
        }

        .mobile-card-middle .metric {
          display: flex;
          flex-direction: column;
          gap: 4px;
          text-align: left;
        }

        .mobile-card-middle .metric .label {
          font-size: 10px;
          color: var(--text-muted);
          text-transform: uppercase;
          font-weight: 600;
          letter-spacing: 0.5px;
        }

        .mobile-card-middle .metric .value {
          font-size: 13px;
        }

        .mobile-card-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-top: 1px solid var(--border-color);
          padding-top: 12px;
          margin-top: 4px;
        }

        @media (max-width: 768px) {
          .table-wrapper {
            display: none;
          }
          .mobile-product-list {
            display: flex;
          }
          .inventory-filters-card {
            flex-direction: column;
            gap: 12px;
            padding: 12px;
          }
          .category-select-wrapper {
            width: 100%;
          }
          .inventory-header {
            padding: 12px 16px;
            gap: 12px;
            align-items: flex-start;
            flex-direction: column;
          }
          .inventory-header h2 {
            font-size: 16px;
          }
          .btn-add-product {
            width: 100%;
            justify-content: center;
          }
          .table-card {
            border: none;
            box-shadow: none;
            background: transparent;
          }
          .form-container {
            max-height: 90vh;
            overflow-y: auto;
            padding: 16px;
          }
        }
      `}</style>
    </div>
  );
};

export default InventoryView;
