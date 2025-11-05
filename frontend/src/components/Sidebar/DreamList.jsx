import { useDream } from '../../contexts/DreamContext';
import DreamItem from './DreamItem';
import { useRef, useCallback } from 'react';

const DreamList = () => {
  const { dreams, loading, loadingMore, hasMore, sidebarCollapsed, loadMoreDreams } = useDream();
  const listRef = useRef(null);

  // Handle scroll event - detect khi gần đến cuối
  const handleScroll = useCallback(() => {
    if (!listRef.current || loadingMore || !hasMore) return;

    const { scrollTop, scrollHeight, clientHeight } = listRef.current;
    const scrollPosition = scrollTop + clientHeight;
    const threshold = scrollHeight - 100; // Trigger khi còn 100px nữa đến cuối

    if (scrollPosition >= threshold) {
      console.log('[DreamList] Near bottom, loading more...');
      loadMoreDreams();
    }
  }, [loadingMore, hasMore, loadMoreDreams]);

  if (loading) {
    return (
      <div className="dream-list-loading">
        {!sidebarCollapsed && <p>Đang tải...</p>}
      </div>
    );
  }

  if (dreams.length === 0) {
    return (
      <div className="dream-list-empty">
        {!sidebarCollapsed && (
          <>
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              style={{ margin: '20px auto', opacity: 0.3 }}
            >
              <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"></path>
            </svg>
            <p>Chưa có giấc mơ nào</p>
            <p className="text-muted">Nhấn "Giấc mơ mới" để bắt đầu</p>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="dream-list" ref={listRef} onScroll={handleScroll}>
      {dreams.map(dream => (
        <DreamItem key={dream.id} dream={dream} />
      ))}

      {/* Loading indicator khi load more */}
      {loadingMore && !sidebarCollapsed && (
        <div className="dream-list-loading-more">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            style={{ animation: 'spin 1s linear infinite' }}
          >
            <circle cx="12" cy="12" r="10" opacity="0.25"></circle>
            <path d="M12 2a10 10 0 0 1 10 10" opacity="0.75"></path>
          </svg>
          <span>Đang tải thêm...</span>
        </div>
      )}

      {/* End of list indicator */}
      {!hasMore && dreams.length > 0 && !sidebarCollapsed && (
        <div className="dream-list-end">
          <span>Đã hết giấc mơ</span>
        </div>
      )}
    </div>
  );
};

export default DreamList;
