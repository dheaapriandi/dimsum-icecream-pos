import React from 'react';
import { ShoppingBag, ChefHat, BarChart2, Package, Sparkles, Settings } from 'lucide-react';

const Sidebar = ({ activeView, setActiveView, currentUser, onLogout, onAvatarClick }) => {
  const handleAvatarClick = () => {
    if (onAvatarClick) {
      onAvatarClick();
    }
  };

  const menuItems = [
    { id: 'cashier', name: 'Kasir POS', icon: ShoppingBag },
    { id: 'kitchen', name: 'Antrean Dapur', icon: ChefHat },
    { id: 'dashboard', name: 'Laporan Penjualan', icon: BarChart2 },
    { id: 'inventory', name: 'Kelola Menu', icon: Package },
    { id: 'settings', name: 'Pengaturan', icon: Settings }
  ];

  return (
    <div className="sidebar-container">
      <div className="sidebar-brand">
        <div className="brand-icon">
          <img src="/logo.png" alt="Logo Kedai AA" className="logo-img" />
        </div>
        <div className="brand-text">
          <h1 className="brand-name">Kedai AA</h1>
          <span className="brand-tagline">Kasir POS Pintar v1.0</span>
        </div>
      </div>

      <nav className="sidebar-menu">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`menu-item ${isActive ? 'active' : ''}`}
            >
              <Icon size={20} className="menu-icon" />
              <span className="menu-text">{item.name}</span>
              {isActive && <div className="active-indicator" />}
            </button>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="cashier-info" onClick={handleAvatarClick}>
          <div className="avatar" style={{ background: 'var(--primary)', color: '#ffffff', fontWeight: 'bold' }}>
            {currentUser ? currentUser.name.charAt(0) : 'K'}
          </div>
          <div className="info">
            <span className="name">{currentUser ? currentUser.name : 'Kasir Utama'}</span>
            <span className="role">{currentUser && currentUser.role === 'admin' ? 'Administrator' : 'Kasir Staf'}</span>
          </div>
        </div>
        <button 
          onClick={onLogout}
          className="logout-btn"
        >
          <span>Keluar Kasir (Logout)</span>
        </button>
      </div>

      <style>{`
        .sidebar-container {
          width: var(--sidebar-width);
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(10px);
          border-right: 1px solid var(--border-color);
          height: 100vh;
          position: fixed;
          left: 0;
          top: 0;
          display: flex;
          flex-direction: column;
          z-index: 100;
          transition: width 0.3s ease;
        }

        .sidebar-brand {
          padding: 24px;
          display: flex;
          align-items: center;
          gap: 12px;
          border-bottom: 1px solid var(--border-color);
        }

        .brand-icon {
          width: 42px;
          height: 42px;
          border-radius: 12px;
          background: white;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          border: 1px solid var(--border-color);
          overflow: hidden;
          padding: 2px;
        }

        .logo-img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        .brand-text {
          display: flex;
          flex-direction: column;
        }

        .brand-name {
          font-size: 16px;
          font-weight: 700;
          letter-spacing: 0.5px;
          background: linear-gradient(to right, #0f172a, #334155);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .brand-tagline {
          font-size: 11px;
          color: var(--text-muted);
        }

        .sidebar-menu {
          flex: 1;
          padding: 24px 12px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .menu-item {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 12px 16px;
          border: none;
          background: transparent;
          color: var(--text-muted);
          border-radius: 12px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          text-align: left;
          position: relative;
          transition: all 0.2s ease;
        }

        .menu-item:hover {
          background: rgba(0, 0, 0, 0.02);
          color: var(--text-primary);
        }

        .menu-item.active {
          background: rgba(249, 115, 22, 0.08);
          color: var(--primary);
          font-weight: 600;
        }

        .menu-icon {
          transition: transform 0.2s ease;
        }

        .menu-item:hover .menu-icon {
          transform: scale(1.1);
        }

        .active-indicator {
          position: absolute;
          right: 0;
          top: 15%;
          height: 70%;
          width: 4px;
          background-color: var(--primary);
          border-radius: 4px 0 0 4px;
          box-shadow: -1px 0 6px rgba(249, 115, 22, 0.4);
        }

        .sidebar-footer {
          padding: 20px;
          border-top: 1px solid var(--border-color);
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .logout-btn {
          width: 100%;
          padding: 10px;
          border: 1px solid var(--border-color);
          background: transparent;
          color: #ef4444;
          border-radius: 10px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: background 0.2s;
        }

        .logout-btn:hover {
          background: rgba(239, 68, 68, 0.05);
        }

        .cashier-info {
          display: flex;
          align-items: center;
          gap: 12px;
          background: rgba(0, 0, 0, 0.02);
          padding: 10px 14px;
          border-radius: 12px;
          border: 1px solid rgba(0, 0, 0, 0.03);
        }

        .avatar {
          width: 36px;
          height: 36px;
          background: var(--bg-surface-hover);
          color: var(--primary);
          font-weight: bold;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(249, 115, 22, 0.15);
        }

        .info {
          display: flex;
          flex-direction: column;
        }

        .info .name {
          font-size: 13px;
          font-weight: 600;
          color: var(--text-primary);
        }

        .info .role {
          font-size: 10px;
          color: var(--text-muted);
        }

        @keyframes spin-pulse {
          0% { transform: rotate(0deg) scale(1); }
          50% { transform: rotate(180deg) scale(1.05); }
          100% { transform: rotate(360deg) scale(1); }
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
          animation: fade-in-scale 0.2s cubic-bezier(0.16, 1, 0.3, 1);
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
        }

        .account-menu-logout-btn:hover {
          background: #fee2e2;
        }

        /* Collapsed Sidebar on medium screens */
        @media (max-width: 992px) {
          .sidebar-container {
            width: 80px;
          }
          .brand-text, .menu-text, .info, .sidebar-footer {
            display: none;
          }
          .sidebar-brand {
            justify-content: center;
            padding: 16px;
          }
          .menu-item {
            justify-content: center;
            padding: 14px;
          }
        }

        /* Mobile sidebar hidden, bottom navigation instead */
        @media (max-width: 768px) {
          .sidebar-container {
            width: 100%;
            height: 60px;
            position: fixed;
            bottom: 0;
            top: auto;
            flex-direction: row;
            border-right: none;
            border-top: 1px solid var(--border-color);
            padding: 0;
            background: rgba(255, 255, 255, 0.98);
            box-shadow: 0 -2px 10px rgba(0,0,0,0.05);
          }
          .sidebar-brand {
            display: none;
          }
          .sidebar-menu {
            flex-direction: row;
            justify-content: space-around;
            padding: 0;
            width: calc(100% - 60px);
            gap: 0;
          }
          .sidebar-menu button:nth-child(4),
          .sidebar-menu button:nth-child(5) {
            display: none !important;
          }
          .menu-item {
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 4px;
            font-size: 10px;
            padding: 6px 0;
            flex: 1;
            border-radius: 0;
          }
          .menu-item.active {
            background: transparent;
          }
          .active-indicator {
            top: 0;
            left: 20%;
            right: 20%;
            width: auto;
            height: 3px;
            border-radius: 0 0 4px 4px;
          }
          
          /* Show only avatar button on mobile */
          .sidebar-footer {
            display: flex !important;
            padding: 0;
            border: none;
            width: 60px;
            height: 60px;
            align-items: center;
            justify-content: center;
            margin-right: 8px;
          }
          .cashier-info {
            padding: 0;
            background: transparent;
            border: none;
          }
          .info, .logout-btn {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Sidebar;
