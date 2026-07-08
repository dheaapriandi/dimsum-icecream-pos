import React, { useState } from 'react';
import { Lock, User, Shield, Info, Database, CheckCircle2, Clock, Key } from 'lucide-react';
import { db, isSupabaseConfigured } from '../supabase';
import confetti from 'canvas-confetti';

const SettingsView = ({ currentUser, onUpdateUser }) => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!oldPassword || !newPassword || !confirmPassword) {
      setErrorMsg('Semua kolom password wajib diisi.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('Password baru dan konfirmasi password tidak cocok.');
      return;
    }

    if (newPassword.length < 3) {
      setErrorMsg('Password baru harus minimal 3 karakter.');
      return;
    }

    setIsSubmitting(true);
    try {
      const updatedUser = await db.changePassword(currentUser.id, oldPassword, newPassword);
      
      // Update session state
      if (onUpdateUser) {
        onUpdateUser(updatedUser);
      }

      // Success effects
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#f97316', '#ec4899', '#10b981']
      });

      setSuccessMsg('Password berhasil diperbarui!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setErrorMsg(err.message || 'Gagal mengubah password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="settings-view-container">
      {/* HEADER UTAMA */}
      <div className="settings-header">
        <div className="header-info">
          <h2>Pengaturan POS</h2>
          <p className="header-tagline">Kelola keamanan akun dan konfigurasi sistem POS Anda</p>
        </div>
      </div>

      <div className="settings-grid">
        {/* PANEL KIRI: KEAMANAN & PASSWORD */}
        <div className="settings-card glass-panel security-card">
          <div className="card-header">
            <Lock size={20} className="header-icon orange-icon" />
            <h3>Keamanan Akun & Ganti Password</h3>
          </div>

          {errorMsg && (
            <div className="alert-message error-alert">
              <span className="alert-icon">⚠️</span>
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="alert-message success-alert">
              <CheckCircle2 size={16} className="alert-icon" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handlePasswordChange} className="settings-form">
            <div className="form-group">
              <label>Nama Pengguna / Username</label>
              <div className="input-with-icon disabled-input">
                <User size={16} className="input-icon" />
                <input type="text" value={currentUser ? currentUser.username : ''} disabled />
              </div>
              <span className="input-tip">Username tidak dapat diubah demi konsistensi data</span>
            </div>

            <div className="form-group">
              <label>Password Lama</label>
              <div className="input-with-icon">
                <Key size={16} className="input-icon" />
                <input
                  type="password"
                  placeholder="Masukkan password saat ini..."
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Password Baru</label>
              <div className="input-with-icon">
                <Lock size={16} className="input-icon" />
                <input
                  type="password"
                  placeholder="Masukkan password baru..."
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Konfirmasi Password Baru</label>
              <div className="input-with-icon">
                <Lock size={16} className="input-icon" />
                <input
                  type="password"
                  placeholder="Ulangi password baru..."
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn-save-settings btn-primary" disabled={isSubmitting}>
              <Lock size={16} />
              <span>{isSubmitting ? 'Menyimpan...' : 'Perbarui Password'}</span>
            </button>
          </form>
        </div>

        {/* PANEL KANAN: DETAIL SISTEM */}
        <div className="settings-card glass-panel system-card">
          <div className="card-header">
            <Info size={20} className="header-icon pink-icon" />
            <h3>Informasi Sistem & Database</h3>
          </div>

          <div className="system-info-list">
            <div className="info-item">
              <div className="info-label">
                <Database size={16} />
                <span>Konektivitas Database</span>
              </div>
              <div className={`info-badge ${isSupabaseConfigured ? 'supabase-active' : 'local-active'}`}>
                {isSupabaseConfigured ? 'Supabase Cloud (Online)' : 'LocalStorage (Offline/Demo)'}
              </div>
            </div>

            <div className="info-item">
              <div className="info-label">
                <Shield size={16} />
                <span>Hak Akses Anda</span>
              </div>
              <div className="info-value">
                <strong>{currentUser ? currentUser.role.toUpperCase() : 'CASHIER'}</strong>
              </div>
            </div>

            <div className="info-item">
              <div className="info-label">
                <Clock size={16} />
                <span>Waktu Sistem POS</span>
              </div>
              <div className="info-value">
                <span>{new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
            </div>

            <div className="info-divider"></div>

            <div className="credentials-doc">
              <h4>Dokumentasi Akun Bawaan</h4>
              <p>Berikut adalah kredensial login bawaan POS Kedai AA:</p>
              <div className="cred-box">
                <div className="cred-line"><strong>Admin:</strong> username: <code>cindy</code> / password: <code>123</code></div>
                <div className="cred-line"><strong>Kasir:</strong> username: <code>kasir</code> / password: <code>123</code></div>
              </div>
              <p className="cred-warn">⚠️ Disarankan untuk segera mengubah password bawaan ini demi keamanan sistem POS Anda.</p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .settings-view-container {
          display: flex;
          flex-direction: column;
          gap: 24px;
          animation: fade-in 0.3s ease-out;
        }

        .settings-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 16px;
        }

        .settings-header h2 {
          font-size: 22px;
          font-weight: 700;
          color: var(--text-primary);
        }

        .settings-header .header-tagline {
          font-size: 13px;
          color: var(--text-muted);
          margin-top: 2px;
        }

        .settings-grid {
          display: grid;
          grid-template-columns: 1.2fr 1fr;
          gap: 24px;
        }

        @media (max-width: 992px) {
          .settings-grid {
            grid-template-columns: 1fr;
          }
        }

        .settings-card {
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .settings-card .card-header {
          display: flex;
          align-items: center;
          gap: 10px;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 12px;
        }

        .settings-card .card-header h3 {
          font-size: 16px;
          font-weight: 700;
          color: var(--text-primary);
        }

        .orange-icon {
          color: var(--primary);
        }

        .pink-icon {
          color: var(--secondary);
        }

        .alert-message {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 16px;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 600;
        }

        .error-alert {
          background: #fef2f2;
          color: #ef4444;
          border: 1px solid #fee2e2;
        }

        .success-alert {
          background: #ecfdf5;
          color: #10b981;
          border: 1px solid #d1fae5;
        }

        .settings-form {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .form-group label {
          font-size: 13px;
          font-weight: 600;
          color: var(--text-primary);
        }

        .input-with-icon {
          position: relative;
          display: flex;
          align-items: center;
        }

        .input-with-icon input {
          width: 100%;
          padding: 12px 14px 12px 38px;
          background: rgba(255, 255, 255, 0.8);
          border: 1px solid var(--border-color);
          border-radius: 10px;
          color: var(--text-primary);
          font-size: 14px;
          outline: none;
          transition: all 0.2s ease;
        }

        .input-with-icon input:focus {
          border-color: var(--primary);
          background: #ffffff;
          box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.1);
        }

        .disabled-input input {
          background: rgba(0, 0, 0, 0.03) !important;
          color: var(--text-muted);
          cursor: not-allowed;
        }

        .input-icon {
          position: absolute;
          left: 12px;
          color: var(--text-muted);
        }

        .input-tip {
          font-size: 11px;
          color: var(--text-muted);
        }

        .btn-save-settings {
          padding: 12px;
          font-weight: 700;
          font-size: 14px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-top: 8px;
        }

        .system-info-list {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .info-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 13px;
        }

        .info-label {
          display: flex;
          align-items: center;
          gap: 8px;
          color: var(--text-muted);
          font-weight: 600;
        }

        .info-value {
          color: var(--text-primary);
        }

        .info-badge {
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 700;
        }

        .supabase-active {
          background: #d1fae5;
          color: #065f46;
        }

        .local-active {
          background: #ffedd5;
          color: #9a3412;
        }

        .info-divider {
          border-top: 1px solid var(--border-color);
          margin: 6px 0;
        }

        .credentials-doc {
          text-align: left;
        }

        .credentials-doc h4 {
          font-size: 14px;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 8px;
        }

        .credentials-doc p {
          font-size: 12px;
          color: var(--text-muted);
          margin-bottom: 10px;
        }

        .cred-box {
          background: rgba(0, 0, 0, 0.02);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          padding: 12px;
          font-family: monospace;
          font-size: 12px;
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-bottom: 12px;
        }

        .cred-line code {
          background: rgba(0, 0, 0, 0.04);
          padding: 2px 4px;
          border-radius: 4px;
        }

        .cred-warn {
          font-size: 11px !important;
          color: #ea580c !important;
          font-weight: 600;
        }

        @keyframes fade-in {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default SettingsView;
