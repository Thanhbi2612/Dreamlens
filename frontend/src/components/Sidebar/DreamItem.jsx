import { useState, useRef, useEffect } from 'react';
import { useDream } from '../../contexts/DreamContext';

const DreamItem = ({ dream }) => {
  const {
    currentDream,
    selectDream,
    updateDreamTitle,
    togglePin,
    deleteDream,
    sidebarCollapsed
  } = useDream();

  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(dream.title);
  const [showMenu, setShowMenu] = useState(false);
  const inputRef = useRef(null);
  const menuRef = useRef(null);

  const isActive = currentDream?.id === dream.id;

  // Auto focus input khi vào edit mode
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  // Close menu khi click bên ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showMenu]);

  const handleClick = () => {
    if (!isEditing && !sidebarCollapsed) {
      selectDream(dream.id);
    }
  };

  const handleDoubleClick = () => {
    if (!sidebarCollapsed) {
      setIsEditing(true);
    }
  };

  const handleSaveEdit = () => {
    if (editTitle.trim() && editTitle !== dream.title) {
      updateDreamTitle(dream.id, editTitle.trim());
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditTitle(dream.title);
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  const handleDelete = () => {
    if (window.confirm(`Bạn có chắc muốn xóa giấc mơ "${dream.title}"?`)) {
      deleteDream(dream.id);
    }
    setShowMenu(false);
  };

  const handleTogglePin = () => {
    togglePin(dream.id);
    setShowMenu(false);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;

    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (sidebarCollapsed) {
    return (
      <div
        className={`dream-item collapsed ${isActive ? 'active' : ''}`}
        onClick={handleClick}
        title={dream.title}
      >
        <div className="dream-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"></path>
          </svg>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`dream-item ${isActive ? 'active' : ''}`}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
    >
      <div className="dream-item-content">
        {dream.is_pinned && (
          <div className="dream-pin-indicator" title="Đã ghim">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M16 9V4h1c.55 0 1-.45 1-1s-.45-1-1-1H7c-.55 0-1 .45-1 1s.45 1 1 1h1v5c0 1.66-1.34 3-3 3v2h5.97v7l1 1 1-1v-7H19v-2c-1.66 0-3-1.34-3-3z"/>
            </svg>
          </div>
        )}

        <div className="dream-item-main">
          {isEditing ? (
            <input
              ref={inputRef}
              type="text"
              className="dream-title-input"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onBlur={handleSaveEdit}
              onKeyDown={handleKeyDown}
              maxLength={100}
            />
          ) : (
            <>
              <div className="dream-title" title={dream.title}>
                {dream.title}
              </div>
              <div className="dream-meta">
                <span className="dream-date">{formatDate(dream.created_at)}</span>
                {dream.image_count > 0 && (
                  <>
                    <span className="dream-meta-separator">•</span>
                    <span className="dream-image-count">
                      {dream.image_count} ảnh
                    </span>
                  </>
                )}
              </div>
            </>
          )}
        </div>

        {!isEditing && (
          <div className="dream-item-actions">
            <button
              className="btn-dream-menu"
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              title="Menu"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="5" r="2"></circle>
                <circle cx="12" cy="12" r="2"></circle>
                <circle cx="12" cy="19" r="2"></circle>
              </svg>
            </button>

            {showMenu && (
              <div className="dream-menu" ref={menuRef}>
                <button onClick={handleTogglePin} className="dream-menu-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M16 9V4h1c.55 0 1-.45 1-1s-.45-1-1-1H7c-.55 0-1 .45-1 1s.45 1 1 1h1v5c0 1.66-1.34 3-3 3v2h5.97v7l1 1 1-1v-7H19v-2c-1.66 0-3-1.34-3-3z"/>
                  </svg>
                  {dream.is_pinned ? 'Bỏ ghim' : 'Ghim'}
                </button>

                <button
                  onClick={() => {
                    setIsEditing(true);
                    setShowMenu(false);
                  }}
                  className="dream-menu-item"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                  </svg>
                  Đổi tên
                </button>

                <button onClick={handleDelete} className="dream-menu-item danger">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  </svg>
                  Xóa
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DreamItem;
