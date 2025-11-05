import { useDream } from '../../contexts/DreamContext';

const SidebarHeader = () => {
  const { createNewDream, toggleSidebar, sidebarCollapsed } = useDream();

  return (
    <div className="sidebar-header">
      {!sidebarCollapsed && (
        <button
          className="btn-new-dream"
          onClick={() => createNewDream()}
          title="Tạo giấc mơ mới"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          <span>Giấc mơ mới</span>
        </button>
      )}

      <button
        className="btn-toggle-sidebar"
        onClick={toggleSidebar}
        title={sidebarCollapsed ? 'Mở rộng' : 'Thu nhỏ'}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          style={{
            transform: sidebarCollapsed ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.3s ease'
          }}
        >
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      </button>
    </div>
  );
};

export default SidebarHeader;
