import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useDream } from '../../contexts/DreamContext';
import { toast } from 'react-toastify';
import authService from '../../services/authService';
import dreamService from '../../services/dreamService';
import DeleteAccountModal from '../../components/common/DeleteAccountModal';
import DeleteAllDreamsModal from '../../components/common/DeleteAllDreamsModal';
import './Settings.css';

const Settings = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const { currentTheme, setTheme, themes } = useTheme();
  const { loadDreams } = useDream();
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
  const [showDeleteDreamsModal, setShowDeleteDreamsModal] = useState(false);

  // Handle theme change
  const handleThemeChange = (themeId) => {
    setTheme(themeId);
    toast.success(`Đã đổi theme thành ${themes[themeId].name}!`, {
      position: "top-right",
      autoClose: 2000,
    });
  };

  // Handle delete all dreams
  const handleDeleteAllDreams = async () => {
    try {
      const result = await dreamService.deleteAllDreams();

      // Close modal
      setShowDeleteDreamsModal(false);

      // Show success message with statistics
      toast.success(
        `Đã xóa thành công ${result.dreams_deleted} giấc mơ và ${result.images_deleted} hình ảnh!`,
        {
          position: "top-center",
          autoClose: 4000,
        }
      );

      // Reload dreams list để update sidebar
      await loadDreams();
      console.log('[Settings] Dreams reloaded after deletion');
    } catch (error) {
      // Error sẽ được hiển thị trong modal
      throw error;
    }
  };

  // Handle delete account
  const handleDeleteAccount = async (password) => {
    try {
      const result = await authService.deleteAccount(password);

      // Show success message
      toast.success('Tài khoản đã được xóa thành công', {
        position: "top-center",
        autoClose: 3000,
      });

      // Logout and redirect to home
      logout();
      navigate('/');
    } catch (error) {
      // Error sẽ được hiển thị trong modal
      throw error;
    }
  };

  // Redirect nếu chưa đăng nhập
  if (!isAuthenticated) {
    return (
      <div className="settings-page">
        <main className="settings-main-content">
          <div className="settings-container">
            <div className="settings-login-required">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
              </svg>
              <h2>Vui lòng đăng nhập</h2>
              <p>Bạn cần đăng nhập để truy cập trang cài đặt</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="settings-page">
      <main className="settings-main-content">
        <div className="settings-container">
          {/* Header */}
          <div className="settings-header">
            <h1 className="settings-title">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M12 1v6m0 6v6m8.66-11.66l-4.24 4.24m-4.24 4.24l-4.24 4.24M23 12h-6m-6 0H1m20.66 8.66l-4.24-4.24m-4.24-4.24l-4.24-4.24"></path>
              </svg>
              Cài đặt
            </h1>
            <p className="settings-subtitle">Quản lý tài khoản và tùy chọn ứng dụng của bạn</p>
          </div>

          {/* Account Section */}
          <section className="settings-section">
            <h2 className="section-title">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              Tài khoản
            </h2>

            <div className="settings-group">
              <div className="setting-item">
                <label className="setting-label">Tên người dùng</label>
                <input
                  type="text"
                  className="setting-input"
                  defaultValue={user?.username || 'Chưa có tên'}
                  placeholder="Nhập tên người dùng"
                />
              </div>

              <div className="setting-item">
                <label className="setting-label">Email</label>
                <input
                  type="email"
                  className="setting-input"
                  defaultValue={user?.email || ''}
                  disabled
                />
                <p className="setting-hint">Email không thể thay đổi</p>
              </div>
            </div>

            <div className="settings-actions">
              <button className="btn-primary" disabled>
                Lưu thay đổi
              </button>
            </div>
          </section>

          {/* Appearance Section */}
          <section className="settings-section">
            <h2 className="section-title">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="5"></circle>
                <line x1="12" y1="1" x2="12" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="23"></line>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                <line x1="1" y1="12" x2="3" y2="12"></line>
                <line x1="21" y1="12" x2="23" y2="12"></line>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
              </svg>
              Giao diện
            </h2>

            <div className="settings-group">
              <div className="setting-item">
                <label className="setting-label">Chọn theme màu</label>
                <p className="setting-hint">Chọn bảng màu yêu thích cho ứng dụng</p>

                <div className="theme-selector">
                  {Object.values(themes).map((theme) => (
                    <div
                      key={theme.id}
                      className={`theme-card ${currentTheme === theme.id ? 'active' : ''}`}
                      onClick={() => handleThemeChange(theme.id)}
                    >
                      <div className="theme-preview">
                        <div className="theme-color" style={{ background: theme.primary }}></div>
                        <div className="theme-color" style={{ background: theme.secondary }}></div>
                      </div>
                      <div className="theme-info">
                        <span className="theme-name">{theme.name}</span>
                        {theme.id === 'purple' && <span className="theme-badge">Mặc định</span>}
                      </div>
                      <div className="theme-check">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>


          {/* Danger Zone */}
          <section className="settings-section danger-section">
            <h2 className="section-title danger-title">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
              Vùng nguy hiểm
            </h2>

            <div className="settings-group">
              <div className="setting-item">
                <label className="setting-label">Xóa tất cả giấc mơ</label>
                <p className="setting-hint">Xóa vĩnh viễn tất cả giấc mơ và ảnh đã tạo</p>
                <button
                  className="btn-danger"
                  onClick={() => setShowDeleteDreamsModal(true)}
                >
                  Xóa tất cả giấc mơ
                </button>
              </div>

              <div className="setting-item">
                <label className="setting-label">Xóa tài khoản</label>
                <p className="setting-hint">Xóa vĩnh viễn tài khoản và toàn bộ dữ liệu</p>
                <button
                  className="btn-danger"
                  onClick={() => setShowDeleteAccountModal(true)}
                >
                  Xóa tài khoản
                </button>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Delete All Dreams Modal */}
      <DeleteAllDreamsModal
        isOpen={showDeleteDreamsModal}
        onClose={() => setShowDeleteDreamsModal(false)}
        onConfirm={handleDeleteAllDreams}
      />

      {/* Delete Account Modal */}
      <DeleteAccountModal
        isOpen={showDeleteAccountModal}
        onClose={() => setShowDeleteAccountModal(false)}
        onConfirm={handleDeleteAccount}
        authProvider={user?.auth_provider || 'local'}
      />
    </div>
  );
};

export default Settings;
