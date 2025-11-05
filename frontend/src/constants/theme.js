// Theme colors cho MuseMap
export const COLORS = {
  // Màu chính
  DREAM_DARK: '#0D0D1A',      // Nền chính - xanh đen sâu
  DREAM_PURPLE: '#A66CFF',    // Accent - tím neon
  DREAM_AQUA: '#3EECAC',      // Phụ - aqua dịu
  DREAM_TEXT: '#F5F5F5',      // Text sáng
  DREAM_PINK: '#FFB6C1',      // Hover/glow - light pink
};

// Animation durations
export const ANIMATION_DURATION = {
  FAST: '150ms',
  NORMAL: '300ms',
  SLOW: '500ms',
  VERY_SLOW: '1000ms',
};

// Breakpoints
export const BREAKPOINTS = {
  SM: '640px',
  MD: '768px',
  LG: '1024px',
  XL: '1280px',
  '2XL': '1536px',
};

// API endpoints (sẽ cập nhật sau)
export const API_ENDPOINTS = {
  BASE_URL: 'http://localhost:8000',
  ANALYZE_DREAM: '/api/dreams/analyze',
  GET_DREAMS: '/api/dreams',
  GENERATE_IMAGE: '/api/dreams/generate-image',
};
