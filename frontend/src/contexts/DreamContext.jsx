import { createContext, useState, useContext, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from './AuthContext';
import dreamService from '../services/dreamService';

const DreamContext = createContext(null);

export const DreamProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [dreams, setDreams] = useState([]);
  const [currentDream, setCurrentDream] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false); // Loading khi load more
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false); // Mặc định sidebar mở

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const ITEMS_PER_PAGE = 10;

  // Load dreams from API khi user authenticated
  useEffect(() => {
    if (isAuthenticated) {
      console.log('[DreamContext] User authenticated, loading dreams...');
      console.log('[DreamContext] Token:', localStorage.getItem('access_token')?.substring(0, 20) + '...');
      loadDreams();
    } else {
      console.log('[DreamContext] User not authenticated, clearing dreams');
      // Clear dreams khi logout
      setDreams([]);
      setCurrentDream(null);
    }
  }, [isAuthenticated]);

  // Function để load dreams từ API (trang đầu tiên)
  const loadDreams = async () => {
    try {
      console.log('[DreamContext] Loading dreams (page 1)...');
      setLoading(true);
      setCurrentPage(1);

      const response = await dreamService.getDreams(false, 1, ITEMS_PER_PAGE);
      console.log('[DreamContext] Received response:', response);

      setDreams(response.data);
      setHasMore(response.pagination.has_next);

      // Set first dream as current nếu chưa có
      if (!currentDream && response.data.length > 0) {
        setCurrentDream(response.data[0]);
      }
    } catch (error) {
      console.error('Error loading dreams:', error);
      toast.error('Không thể tải danh sách giấc mơ', {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  // Function để load thêm dreams (infinite scroll)
  const loadMoreDreams = async () => {
    if (loadingMore || !hasMore) {
      console.log('[DreamContext] Skip load more - loadingMore:', loadingMore, 'hasMore:', hasMore);
      return;
    }

    try {
      const nextPage = currentPage + 1;
      console.log('[DreamContext] Loading more dreams (page', nextPage, ')...');
      setLoadingMore(true);

      const response = await dreamService.getDreams(false, nextPage, ITEMS_PER_PAGE);
      console.log('[DreamContext] Received more dreams:', response);

      // Append vào danh sách hiện tại
      setDreams(prev => [...prev, ...response.data]);
      setCurrentPage(nextPage);
      setHasMore(response.pagination.has_next);

    } catch (error) {
      console.error('Error loading more dreams:', error);
      toast.error('Không thể tải thêm giấc mơ', {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setLoadingMore(false);
    }
  };

  // Create new dream (API)
  const createNewDream = async (title = "Giấc mơ mới") => {
    try {
      // Ensure title is a string (in case event object is passed)
      const dreamTitle = typeof title === 'string' ? title : "Giấc mơ mới";

      console.log('[DreamContext] Creating new dream with title:', dreamTitle);

      const newDream = await dreamService.createDream({ title: dreamTitle });

      console.log('[DreamContext] Dream created:', newDream);

      setDreams(prev => [newDream, ...prev]);
      setCurrentDream(newDream);

      toast.success('Đã tạo giấc mơ mới!', {
        position: "top-right",
        autoClose: 2000,
      });

      return newDream;
    } catch (error) {
      console.error('Error creating dream:', error);
      toast.error('Không thể tạo giấc mơ mới', {
        position: "top-right",
        autoClose: 3000,
      });
      return null;
    }
  };

  // Select dream
  const selectDream = (dreamId) => {
    const dream = dreams.find(d => d.id === dreamId);
    if (dream) {
      setCurrentDream(dream);
      toast.info(`Đã chuyển sang: ${dream.title}`, {
        position: "top-right",
        autoClose: 1500,
      });
    }
  };

  // Update dream title (API)
  const updateDreamTitle = async (dreamId, newTitle) => {
    try {
      const updated = await dreamService.updateDream(dreamId, { title: newTitle });

      setDreams(prev =>
        prev.map(dream => dream.id === dreamId ? updated : dream)
      );

      if (currentDream?.id === dreamId) {
        setCurrentDream(updated);
      }

      toast.success('Đã đổi tên giấc mơ!', {
        position: "top-right",
        autoClose: 2000,
      });
    } catch (error) {
      console.error('Error updating dream:', error);
      toast.error('Không thể đổi tên giấc mơ', {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  // Toggle pin (API)
  const togglePin = async (dreamId) => {
    try {
      const dream = dreams.find(d => d.id === dreamId);
      const updated = await dreamService.updateDream(dreamId, {
        is_pinned: !dream.is_pinned
      });

      setDreams(prev => {
        const newDreams = prev.map(d => d.id === dreamId ? updated : d);

        // Sort: pinned first, then by created_at
        return newDreams.sort((a, b) => {
          if (a.is_pinned && !b.is_pinned) return -1;
          if (!a.is_pinned && b.is_pinned) return 1;
          return new Date(b.created_at) - new Date(a.created_at);
        });
      });

      if (currentDream?.id === dreamId) {
        setCurrentDream(updated);
      }

      toast.success(updated.is_pinned ? 'Đã ghim giấc mơ!' : 'Đã bỏ ghim', {
        position: "top-right",
        autoClose: 1500,
      });
    } catch (error) {
      console.error('Error toggling pin:', error);
      toast.error('Không thể cập nhật', {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  // Delete dream (API)
  const deleteDream = async (dreamId) => {
    try {
      await dreamService.deleteDream(dreamId);

      setDreams(prev => prev.filter(d => d.id !== dreamId));

      // If deleting current dream, select another one
      if (currentDream?.id === dreamId) {
        const remainingDreams = dreams.filter(d => d.id !== dreamId);
        setCurrentDream(remainingDreams.length > 0 ? remainingDreams[0] : null);
      }

      toast.success('Đã xóa giấc mơ!', {
        position: "top-right",
        autoClose: 2000,
      });
    } catch (error) {
      console.error('Error deleting dream:', error);
      toast.error('Không thể xóa giấc mơ', {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  // Toggle sidebar collapse
  const toggleSidebar = () => {
    setSidebarCollapsed(prev => !prev);
  };

  const value = {
    dreams,
    currentDream,
    loading,
    loadingMore,
    hasMore,
    sidebarCollapsed,
    loadDreams,
    loadMoreDreams,
    createNewDream,
    selectDream,
    updateDreamTitle,
    togglePin,
    deleteDream,
    toggleSidebar,
  };

  return <DreamContext.Provider value={value}>{children}</DreamContext.Provider>;
};

export const useDream = () => {
  const context = useContext(DreamContext);
  if (!context) {
    throw new Error('useDream must be used within a DreamProvider');
  }
  return context;
};

export default DreamContext;
