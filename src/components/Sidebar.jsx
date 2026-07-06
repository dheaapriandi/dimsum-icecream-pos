import React from 'react';
import { ShoppingBag, ChefHat, BarChart2, Package, Sparkles } from 'lucide-react';

const Sidebar = ({ activeView, setActiveView }) => {
  const menuItems = [
    { id: 'cashier', name: 'Kasir POS', icon: ShoppingBag },
    { id: 'kitchen', name: 'Antrean Dapur', icon: ChefHat },
    { id: 'dashboard', name: 'Laporan Penjualan', icon: BarChart2 },
    { id: 'inventory', name: 'Kelola Menu', icon: Package }
  ];

  return (
    <div className="sidebar-container">
      <div className="sidebar-brand">
        <div className="brand-icon">
          <Sparkles className="logo-sparkle" size={24} />
        </div>
        <div className="brand-text">
          <h1 className="brand-name">Dimsum & Ice AA</h1>
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
        <div className="cashier-info">
          <div className="avatar">K</div>
          <div className="info">
            <span className="name">Kasir Utama</span>
            <span className="role">Administrator</span>
          </div>
        </div>
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
          background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 10px rgba(249, 115, 22, 0.15);
        }

        .logo-sparkle {
          color: white;
          animation: spin-pulse 3s infinite linear;
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
        @media (max-width: 576px) {
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
          .sidebar-brand, .sidebar-footer {
            display: none;
          }
          .sidebar-menu {
            flex-direction: row;
            justify-content: space-around;
            padding: 0;
            width: 100%;
            gap: 0;
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
        }
      `}</style>
    </div>
  );
};

export default Sidebar;
