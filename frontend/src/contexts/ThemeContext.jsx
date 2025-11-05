import { createContext, useState, useContext, useEffect } from 'react';

const ThemeContext = createContext(null);

// Utility function to convert hex to RGB
const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
};

// Generate color with opacity
const colorWithOpacity = (hex, opacity) => {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity / 100})`;
};

// Precompute all color variants for a theme
const generateThemeVariants = (baseColors) => {
  const opacities = [3, 5, 8, 10, 12, 15, 20, 25, 30, 40, 50, 60, 70, 80];
  const variants = {};

  // Generate variants for each color
  ['primary', 'secondary', 'accent', 'background'].forEach((colorName) => {
    const baseColor = baseColors[colorName];
    opacities.forEach((opacity) => {
      variants[`${colorName}-${opacity}`] = colorWithOpacity(baseColor, opacity);
    });
  });

  return { ...baseColors, ...variants };
};

// Theme configurations
const purpleTheme = generateThemeVariants({
  primary: '#A66CFF',
  secondary: '#3EECAC',
  accent: '#FFB6C1',
  background: '#0D0D1A',
});

const oceanTheme = generateThemeVariants({
  primary: '#3B82F6',
  secondary: '#EC4899',
  accent: '#8B5CF6',
  background: '#0A0E1A',
});

const fireTheme = generateThemeVariants({
  primary: '#F97316',
  secondary: '#EF4444',
  accent: '#FCD34D',
  background: '#1A0D0D',
});

const forestTheme = generateThemeVariants({
  primary: '#10B981',
  secondary: '#14B8A6',
  accent: '#34D399',
  background: '#0D1A15',
});

export const THEMES = {
  purple: { id: 'purple', name: 'Purple Dream', ...purpleTheme },
  ocean: { id: 'ocean', name: 'Ocean Sunset', ...oceanTheme },
  fire: { id: 'fire', name: 'Fire Blaze', ...fireTheme },
  forest: { id: 'forest', name: 'Forest Mint', ...forestTheme },
};

const STORAGE_KEY = 'dreamlens-theme';

export const ThemeProvider = ({ children }) => {
  // Load theme from localStorage or use default
  const [currentTheme, setCurrentTheme] = useState(() => {
    const savedTheme = localStorage.getItem(STORAGE_KEY);
    return savedTheme && THEMES[savedTheme] ? savedTheme : 'purple';
  });

  // Apply theme to CSS variables
  const applyTheme = (themeId) => {
    const theme = THEMES[themeId];
    if (!theme) return;

    const root = document.documentElement;

    // Apply all precomputed color variables
    Object.keys(theme).forEach((key) => {
      if (key !== 'id' && key !== 'name') {
        root.style.setProperty(`--color-${key}`, theme[key]);
      }
    });

    // Set data attribute for CSS selectors
    root.setAttribute('data-theme', themeId);

    console.log(`[ThemeContext] Applied ${themeId} theme with ${Object.keys(theme).length - 2} color variants`);
  };

  // Apply theme on mount and when theme changes
  useEffect(() => {
    applyTheme(currentTheme);
  }, [currentTheme]);

  // Change theme function
  const setTheme = (themeId) => {
    if (THEMES[themeId]) {
      setCurrentTheme(themeId);
      localStorage.setItem(STORAGE_KEY, themeId);
      console.log('[ThemeContext] Theme changed to:', themeId);
    }
  };

  const value = {
    currentTheme,
    setTheme,
    themes: THEMES,
    activeTheme: THEMES[currentTheme],
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeContext;
