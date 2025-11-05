import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';
import './AuthForm.css';

// Utility functions for encoding/decoding password
const encodePassword = (password) => {
  return btoa(password); // Base64 encode
};

const decodePassword = (encodedPassword) => {
  try {
    return atob(encodedPassword); // Base64 decode
  } catch (e) {
    return '';
  }
};

const LoginForm = ({ onSwitchToRegister, onSuccess }) => {
  const { login, error } = useAuth();
  const [formData, setFormData] = useState({
    identifier: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [localError, setLocalError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Load saved credentials from localStorage when component mounts
  useEffect(() => {
    const savedIdentifier = localStorage.getItem('rememberedIdentifier');
    const savedPassword = localStorage.getItem('rememberedPassword');

    if (savedIdentifier) {
      const decodedPassword = savedPassword ? decodePassword(savedPassword) : '';
      setFormData({
        identifier: savedIdentifier,
        password: decodedPassword
      });
      setRememberMe(true);
    }
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setLocalError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setLocalError('');

    try {
      await login(formData);

      // Save or remove credentials from localStorage based on rememberMe
      if (rememberMe) {
        const encodedPassword = encodePassword(formData.password);
        localStorage.setItem('rememberedIdentifier', formData.identifier);
        localStorage.setItem('rememberedPassword', encodedPassword);
      } else {
        localStorage.removeItem('rememberedIdentifier');
        localStorage.removeItem('rememberedPassword');
      }

      // Show success toast
      toast.success('Đăng nhập thành công!', {
        position: "top-right",
        autoClose: 2000,
      });

      // Close modal after short delay
      setTimeout(() => {
        if (onSuccess) onSuccess();
      }, 500);
    } catch (err) {
      setLocalError(err.message);
      toast.error(err.message || 'Đăng nhập thất bại!', {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-card-wrapper">
      <div className="auth-card-glow"></div>
      <div className="auth-card">
        <div className="auth-header">
          <h2 className="auth-title">Đăng nhập</h2>
          <p className="auth-subtitle">Chào mừng trở lại! Hãy đăng nhập để tiếp tục</p>
        </div>

        {(error || localError) && (
          <div className="error-message">
            {error || localError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="identifier" className="form-label">
              Email hoặc Username
            </label>
            <input
              type="text"
              id="identifier"
              name="identifier"
              value={formData.identifier}
              onChange={handleChange}
              className="form-input"
              placeholder="your@email.com hoặc username"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Mật khẩu
            </label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="form-input"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                aria-label="Toggle password visibility"
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <div className="remember-me-wrapper">
            <input
              type="checkbox"
              id="rememberMe"
              checked={rememberMe}
              onChange={(e) => {
                setRememberMe(e.target.checked);
              }}
              className="remember-me-checkbox"
            />
            <label htmlFor="rememberMe" className="remember-me-label">
              Nhớ tài khoản
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="auth-button"
          >
            Đăng nhập
          </button>
        </form>

        <div className="auth-divider">
          <span className="divider-line"></span>
          <span className="divider-text">hoặc</span>
          <span className="divider-line"></span>
        </div>

        <button
          type="button"
          className="google-auth-button"
          onClick={() => {
            // Redirect to backend Google OAuth
            window.location.href = 'http://localhost:8000/api/auth/google/login';
          }}
        >
          <svg className="google-icon" viewBox="0 0 24 24" width="20" height="20">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Đăng nhập với Google
        </button>

        <div className="auth-footer">
          <p className="auth-link-text">
            Chưa có tài khoản?{' '}
            <button onClick={onSwitchToRegister} className="auth-link-button">
              Đăng ký ngay
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
