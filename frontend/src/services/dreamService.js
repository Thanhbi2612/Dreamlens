import axiosInstance from '../utils/api/axios';

const dreamService = {
  /**
   * Lấy danh sách dreams của user (paginated)
   * @param {boolean} includeArchived - Có bao gồm dreams đã archive không
   * @param {number} page - Số trang (1-indexed)
   * @param {number} limit - Số items per page
   * @returns {Promise<Object>} - { data: Array, pagination: Object }
   */
  getDreams: async (includeArchived = false, page = 1, limit = 10) => {
    const response = await axiosInstance.get('/api/dreams/', {
      params: {
        include_archived: includeArchived,
        page: page,
        limit: limit
      }
    });
    return response.data;
  },

  /**
   * Tạo dream mới
   * @param {Object} dreamData - { title, description? }
   * @returns {Promise<Object>} - Dream object vừa tạo
   */
  createDream: async (dreamData) => {
    const response = await axiosInstance.post('/api/dreams/', dreamData);
    return response.data;
  },

  /**
   * Lấy chi tiết một dream (kèm tất cả images)
   * @param {number} dreamId - ID của dream
   * @returns {Promise<Object>} - Dream object với images
   */
  getDreamDetail: async (dreamId) => {
    const response = await axiosInstance.get(`/api/dreams/${dreamId}/`);
    return response.data;
  },

  /**
   * Cập nhật dream
   * @param {number} dreamId - ID của dream
   * @param {Object} updateData - { title?, description?, is_pinned?, is_archived? }
   * @returns {Promise<Object>} - Dream đã update
   */
  updateDream: async (dreamId, updateData) => {
    const response = await axiosInstance.put(`/api/dreams/${dreamId}/`, updateData);
    return response.data;
  },

  /**
   * Xóa dream (cascade xóa tất cả images)
   * @param {number} dreamId - ID của dream
   * @returns {Promise<void>}
   */
  deleteDream: async (dreamId) => {
    await axiosInstance.delete(`/api/dreams/${dreamId}/`);
  },

  /**
   * Toggle pin dream
   * @param {number} dreamId - ID của dream
   * @returns {Promise<Object>} - Dream sau khi toggle
   */
  togglePin: async (dreamId) => {
    const dream = await dreamService.getDreamDetail(dreamId);
    return dreamService.updateDream(dreamId, { is_pinned: !dream.is_pinned });
  },

  /**
   * Xóa TẤT CẢ dreams và images của user
   * @returns {Promise<Object>} - { message, dreams_deleted, images_deleted }
   */
  deleteAllDreams: async () => {
    const response = await axiosInstance.delete('/api/dreams/all');
    return response.data;
  }
};

export default dreamService;
