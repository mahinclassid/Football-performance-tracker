/**
 * Universal Theme Configuration
 * Import this file to use consistent colors throughout the application
 */

export const theme = {
  colors: {
    // Primary brand colors
    primary: {
      DEFAULT: '#10B981', // emerald-500
      dark: '#065F46', // emerald-900
      light: '#A7F3D0', // emerald-200 (accent)
    },
    
    // Text colors
    text: {
      primary: '#000000', // Black for main text
      secondary: '#1F2937', // gray-800 for secondary text
      tertiary: '#374151', // gray-700 for tertiary text
      muted: '#6B7280', // gray-500 for muted text
      inverse: '#FFFFFF', // White for text on dark backgrounds
    },
    
    // Background colors
    background: {
      primary: '#FFFFFF', // White
      secondary: '#F9FAFB', // gray-50
      dark: '#0B0F10', // pitch black
    },
    
    // Status colors
    status: {
      success: '#84CC16', // lime-500
      warning: '#F59E0B', // amber-500
      error: '#EF4444', // rose-500
      info: '#3B82F6', // blue-500
    },
    
    // Card colors
    card: {
      background: '#FFFFFF',
      border: '#F3F4F6', // gray-100
      shadow: 'rgba(6, 95, 70, 0.12)',
    },
    
    // Border colors
    border: {
      light: '#E5E7EB', // gray-200
      DEFAULT: '#D1D5DB', // gray-300
      dark: '#9CA3AF', // gray-400
    },
  },
  
  // Typography
  typography: {
    fontFamily: {
      sans: 'var(--font-geist-sans)',
      mono: 'var(--font-geist-mono)',
    },
  },
  
  // Spacing (using Tailwind defaults)
  spacing: {
    xs: '0.5rem',
    sm: '1rem',
    md: '1.5rem',
    lg: '2rem',
    xl: '3rem',
  },
  
  // Border radius
  borderRadius: {
    sm: '0.5rem',
    DEFAULT: '0.75rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
  },
  
  // Shadows
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    card: '0 8px 24px rgba(6, 95, 70, 0.12)',
  },
} as const;

/**
 * Get text color class based on theme
 */
export const getTextColor = (variant: 'primary' | 'secondary' | 'tertiary' | 'muted' | 'inverse' = 'primary') => {
  const colorMap = {
    primary: 'text-black',
    secondary: 'text-gray-800',
    tertiary: 'text-gray-700',
    muted: 'text-gray-500',
    inverse: 'text-white',
  };
  return colorMap[variant];
};

/**
 * Get background color class based on theme
 */
export const getBgColor = (variant: 'primary' | 'secondary' | 'dark' = 'primary') => {
  const colorMap = {
    primary: 'bg-white',
    secondary: 'bg-gray-50',
    dark: 'bg-gray-900',
  };
  return colorMap[variant];
};

/**
 * Get border color class based on theme
 */
export const getBorderColor = (variant: 'light' | 'DEFAULT' | 'dark' = 'DEFAULT') => {
  const colorMap = {
    light: 'border-gray-200',
    DEFAULT: 'border-gray-300',
    dark: 'border-gray-400',
  };
  return colorMap[variant];
};

// Export individual color values for use in inline styles or CSS
export const colors = theme.colors;
export const textColors = theme.colors.text;
export const bgColors = theme.colors.background;
export const statusColors = theme.colors.status;



