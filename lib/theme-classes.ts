/**
 * Pre-defined Tailwind class combinations based on theme
 * Use these for consistent styling across the application
 */

export const themeClasses = {
  // Text colors
  text: {
    primary: 'text-black',
    secondary: 'text-black',
    tertiary: 'text-black',
    muted: 'text-gray-500',
    inverse: 'text-white',
    heading: 'text-black',
    label: 'text-black',
    body: 'text-black',
  },
  
  // Background colors
  bg: {
    primary: 'bg-white',
    secondary: 'bg-gray-50',
    dark: 'bg-gray-900',
    card: 'bg-white',
  },
  
  // Border colors
  border: {
    light: 'border-gray-200',
    DEFAULT: 'border-gray-300',
    dark: 'border-gray-400',
    card: 'border-gray-100',
  },
  
  // Button styles
  button: {
    primary: 'bg-club-primary text-white hover:bg-club-primary-dark',
    secondary: 'bg-gray-100 text-black hover:bg-gray-200',
    danger: 'bg-rose-500 text-white hover:bg-rose-600',
    outline: 'border border-gray-300 text-black hover:bg-gray-50',
  },
  
  // Input styles
  input: {
    DEFAULT: 'border-gray-300 focus:ring-club-primary focus:border-club-primary text-black bg-white placeholder:text-gray-400',
  },
  
  // Card styles
  card: {
    container: 'bg-white rounded-xl shadow-card border border-gray-100',
    header: 'text-xl font-semibold text-black',
    body: 'text-black',
  },
  
  // Table styles
  table: {
    header: 'text-xs font-medium text-black uppercase tracking-wider',
    cell: 'text-sm text-black',
    empty: 'text-black',
  },
  
  // Form styles
  form: {
    label: 'block text-sm font-semibold text-black',
    error: 'mt-1 text-sm text-rose-600',
  },
} as const;

/**
 * Helper function to combine theme classes
 */
export const cn = (...classes: (string | undefined | false)[]): string => {
  return classes.filter(Boolean).join(' ');
};

