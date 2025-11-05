import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';
import { useDream } from '../../contexts/DreamContext';
import Modal from '../common/Modal';
import ConfirmDialog from '../common/ConfirmDialog';
import LoginForm from '../Auth/LoginForm';
import RegisterForm from '../Auth/RegisterForm';
import './Header.css';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const { sidebarCollapsed } = useDream();

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    logout();
    setShowLogoutConfirm(false);
    toast.success('Đăng xuất thành công!');
  };

  const handleLoginSuccess = () => {
    setShowLoginModal(false);
  };

  const handleRegisterSuccess = () => {
    setShowRegisterModal(false);
  };

  const switchToRegister = () => {
    setShowLoginModal(false);
    setShowRegisterModal(true);
  };

  const switchToLogin = () => {
    setShowRegisterModal(false);
    setShowLoginModal(true);
  };

  return (
    <header className={`header ${isAuthenticated && !sidebarCollapsed ? 'sidebar-open' : ''} ${isAuthenticated && sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <nav className="header-container">
        <div className="header-content">
          {/* Logo */}
          <div className="logo-wrapper">
            <Link to="/" style={{ position: 'relative', textDecoration: 'none' }}>
              <div className="logo-glow-bg"></div>
              <span className="logo-text">✨ DreamLens</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="nav-desktop">
            <Link to="/" className="nav-link">
              Trang chủ
              <span className="nav-link-underline"></span>
            </Link>
            <Link to="/about" className="nav-link">
              Về chúng tôi
              <span className="nav-link-underline"></span>
            </Link>
            {isAuthenticated && (
              <Link to="/settings" className="nav-link">
                Cài đặt
                <span className="nav-link-underline"></span>
              </Link>
            )}

            {/* Auth Buttons */}
            {isAuthenticated ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                  Xin chào, {user?.username || user?.email}
                </span>
                <button onClick={handleLogout} className="cta-button">
                  Đăng xuất
                </button>
              </div>
            ) : (
              <button onClick={() => setShowLoginModal(true)} className="cta-button">
                Đăng nhập
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="mobile-menu-button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="mobile-menu">
            <Link
              to="/"
              className="mobile-menu-link"
              onClick={() => setIsMenuOpen(false)}
            >
              Trang chủ
            </Link>
            <Link
              to="/about"
              className="mobile-menu-link"
              onClick={() => setIsMenuOpen(false)}
            >
              Về chúng tôi
            </Link>
            {isAuthenticated && (
              <Link
                to="/settings"
                className="mobile-menu-link"
                onClick={() => setIsMenuOpen(false)}
              >
                Cài đặt
              </Link>
            )}
            {isAuthenticated ? (
              <>
                <span className="mobile-menu-link" style={{ color: '#94a3b8' }}>
                  {user?.username || user?.email}
                </span>
                <button onClick={handleLogout} className="mobile-cta-button">
                  Đăng xuất
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  setShowLoginModal(true);
                  setIsMenuOpen(false);
                }}
                className="mobile-cta-button"
              >
                Đăng nhập
              </button>
            )}
          </div>
        )}
      </nav>

      {/* Auth Modals */}
      <Modal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)}>
        <LoginForm
          onSwitchToRegister={switchToRegister}
          onSuccess={handleLoginSuccess}
        />
      </Modal>

      <Modal isOpen={showRegisterModal} onClose={() => setShowRegisterModal(false)}>
        <RegisterForm
          onSwitchToLogin={switchToLogin}
          onSuccess={handleRegisterSuccess}
        />
      </Modal>

      {/* Logout Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={confirmLogout}
        title="Xác nhận đăng xuất"
        message="Bạn có chắc chắn muốn đăng xuất khỏi tài khoản không?"
      />
    </header>
  );
};

export default Header;
