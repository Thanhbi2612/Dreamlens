import axiosInstance from '../utils/api/axios';

const imageService = {
  /**
   * Generate image from text prompt
   * @param {string} prompt - Text mô tả ảnh
   * @param {number} dreamId - ID của dream session
   * @param {string|null} negativePrompt - Negative prompt (optional)
   * @returns {Promise<Object>} - Image data với base64 image_url
   */
  generateImage: async (prompt, dreamId, negativePrompt = null) => {
    const response = await axiosInstance.post('/api/images/generate', {
      prompt,
      dream_id: dreamId,
      negative_prompt: negativePrompt
    });
    return response.data;
  },

  // Get user's generated images
  getMyImages: async (limit = 20) => {
    const response = await axiosInstance.get('/api/images/my-images', {
      params: { limit }
    });
    return response.data;
  },
};

export default imageService;
