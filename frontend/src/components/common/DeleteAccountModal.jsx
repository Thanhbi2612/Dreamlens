import { useState } from 'react';
import './DeleteAccountModal.css';

// Icon components
const XIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

const AlertTriangleIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"></path>
    <line x1="12" y1="9" x2="12" y2="13"></line>
    <line x1="12" y1="17" x2="12.01" y2="17"></line>
  </svg>
);

const DeleteAccountModal = ({ isOpen, onClose, onConfirm, authProvider }) => {
  const [password, setPassword] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');

  const isLocalAuth = authProvider === 'local';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate password cho local auth
    if (isLocalAuth && !password) {
      setError('Vui lòng nhập mật khẩu để xác nhận');
      return;
    }

    setIsDeleting(true);
    try {
      await onConfirm(password);
      // Modal sẽ tự đóng sau khi thành công (xử lý bởi parent)
    } catch (err) {
      setError(err.response?.data?.detail || 'Có lỗi xảy ra. Vui lòng thử lại.');
      setIsDeleting(false);
    }
  };

  const handleClose = () => {
    if (!isDeleting) {
      setPassword('');
      setError('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header danger">
          <div className="modal-header-content">
            <AlertTriangleIcon />
            <h2>Xóa Tài Khoản Vĩnh Viễn</h2>
          </div>
          <button
            className="modal-close-button"
            onClick={handleClose}
            disabled={isDeleting}
          >
            <XIcon />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          <div className="modal-warning-box">
            <p className="modal-warning-text">
              <strong>⚠️ Cảnh báo:</strong> Hành động này không thể hoàn tác!
            </p>
          </div>

          <div className="modal-info-section">
            <p className="modal-description">
              Khi xóa tài khoản, bạn sẽ <strong>mất tất cả</strong>:
            </p>
            <ul className="modal-list">
              <li>Tất cả giấc mơ đã tạo</li>
              <li>Tất cả hình ảnh đã sinh ra</li>
              <li>Thông tin tài khoản và cài đặt</li>
              <li>Dữ liệu này không thể khôi phục</li>
            </ul>
          </div>

          <form onSubmit={handleSubmit}>
            {isLocalAuth && (
              <div className="modal-input-group">
                <label htmlFor="password" className="modal-label">
                  Nhập mật khẩu để xác nhận:
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mật khẩu của bạn"
                  className="modal-input"
                  disabled={isDeleting}
                  autoFocus
                />
              </div>
            )}

            {!isLocalAuth && (
              <p className="modal-oauth-notice">
                Bạn đang sử dụng tài khoản Google. Không cần mật khẩu để xác nhận.
              </p>
            )}

            {error && (
              <div className="modal-error">
                {error}
              </div>
            )}

            {/* Actions */}
            <div className="modal-actions">
              <button
                type="button"
                className="modal-button modal-button-cancel"
                onClick={handleClose}
                disabled={isDeleting}
              >
                Hủy
              </button>
              <button
                type="submit"
                className="modal-button modal-button-danger"
                disabled={isDeleting || (isLocalAuth && !password)}
              >
                {isDeleting ? 'Đang xóa...' : 'Xóa Tài Khoản'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DeleteAccountModal;
