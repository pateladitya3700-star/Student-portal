/**
 * Tailwind CSS Theme Configuration
 * National Infotech College Portal
 * Teal & Orange Design System
 */

module.exports = {
  theme: {
    extend: {
      colors: {
        // Primary - Teal
        primary: {
          50: '#F0FDFA',
          100: '#CCFBF1',
          200: '#99F6E4',
          300: '#5EEAD4',
          400: '#2DD4BF',
          500: '#14B8A6',
          600: '#0D9488',
          700: '#0F766E',
          800: '#115E59',
          900: '#134E4A',
          DEFAULT: '#14B8A6',
        },
        // Accent - Orange
        accent: {
          50: '#FFF7ED',
          100: '#FFEDD5',
          200: '#FED7AA',
          300: '#FDBA74',
          400: '#FB923C',
          500: '#F97316',
          600: '#EA580C',
          700: '#C2410C',
          800: '#9A3412',
          900: '#7C2D12',
          DEFAULT: '#F97316',
        },
        // Semantic Colors
        success: {
          50: '#F0FDF4',
          500: '#10B981',
          600: '#059669',
          700: '#047857',
          DEFAULT: '#10B981',
        },
        warning: {
          50: '#FFFBEB',
          500: '#F59E0B',
          600: '#D97706',
          700: '#B45309',
          DEFAULT: '#F59E0B',
        },
        error: {
          50: '#FEF2F2',
          500: '#EF4444',
          600: '#DC2626',
          700: '#B91C1C',
          DEFAULT: '#EF4444',
        },
        info: {
          50: '#EFF6FF',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
          DEFAULT: '#3B82F6',
        },
      },
      
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          '"Helvetica Neue"',
          'Arial',
          'sans-serif',
        ],
        mono: [
          '"SF Mono"',
          'Monaco',
          '"Cascadia Code"',
          '"Roboto Mono"',
          'Consolas',
          'monospace',
        ],
      },
      
      fontSize: {
        xs: ['0.75rem', { lineHeight: '1.25' }],
        sm: ['0.875rem', { lineHeight: '1.5' }],
        base: ['1rem', { lineHeight: '1.5' }],
        lg: ['1.125rem', { lineHeight: '1.5' }],
        xl: ['1.25rem', { lineHeight: '1.5' }],
        '2xl': ['1.5rem', { lineHeight: '1.5' }],
        '3xl': ['1.875rem', { lineHeight: '1.25' }],
        '4xl': ['2.25rem', { lineHeight: '1.25' }],
      },
      
      spacing: {
        0: '0',
        1: '0.25rem',
        2: '0.5rem',
        3: '0.75rem',
        4: '1rem',
        5: '1.25rem',
        6: '1.5rem',
        8: '2rem',
        10: '2.5rem',
        12: '3rem',
        16: '4rem',
        20: '5rem',
      },
      
      borderRadius: {
        none: '0',
        sm: '0.25rem',
        DEFAULT: '0.375rem',
        md: '0.375rem',
        lg: '0.5rem',
        xl: '0.75rem',
        '2xl': '1rem',
        full: '9999px',
      },
      
      boxShadow: {
        xs: '0 1px 2px rgba(0, 0, 0, 0.05)',
        sm: '0 1px 3px rgba(0, 0, 0, 0.1)',
        DEFAULT: '0 1px 3px rgba(0, 0, 0, 0.1)',
        md: '0 4px 6px rgba(0, 0, 0, 0.1)',
        lg: '0 10px 15px rgba(0, 0, 0, 0.1)',
        xl: '0 20px 25px rgba(0, 0, 0, 0.15)',
        '2xl': '0 25px 50px rgba(0, 0, 0, 0.25)',
        none: 'none',
      },
      
      transitionDuration: {
        fast: '150ms',
        DEFAULT: '200ms',
        slow: '300ms',
        slower: '500ms',
      },
      
      transitionTimingFunction: {
        DEFAULT: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      
      // Custom utilities
      backgroundColor: {
        'primary-hover': 'var(--hover-overlay)',
        'primary-active': 'var(--active-overlay)',
      },
      
      ringColor: {
        'primary-focus': 'var(--focus-ring)',
      },
    },
  },
  
  // Dark mode configuration
  darkMode: 'class', // or 'media' for system preference
  
  plugins: [
    // Custom plugin for theme-specific utilities
    function({ addUtilities, theme }) {
      const newUtilities = {
        '.theme-transition': {
          transition: 'background-color 200ms cubic-bezier(0.4, 0, 0.2, 1), color 200ms cubic-bezier(0.4, 0, 0.2, 1), border-color 200ms cubic-bezier(0.4, 0, 0.2, 1)',
        },
        '.focus-ring-primary': {
          '&:focus': {
            outline: 'none',
            'box-shadow': `0 0 0 3px ${theme('colors.primary.500')}33`,
          },
        },
        '.focus-ring-accent': {
          '&:focus': {
            outline: 'none',
            'box-shadow': `0 0 0 3px ${theme('colors.accent.500')}33`,
          },
        },
      };
      
      addUtilities(newUtilities, ['responsive', 'hover', 'focus']);
    },
  ],
};

/**
 * Usage Examples:
 * 
 * Primary Button:
 * <button className="bg-primary-500 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-base">
 *   Click Me
 * </button>
 * 
 * Accent Button:
 * <button className="bg-accent-500 hover:bg-accent-600 text-white px-4 py-2 rounded-lg transition-base">
 *   Accent Action
 * </button>
 * 
 * Card:
 * <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6 theme-transition">
 *   Card Content
 * </div>
 * 
 * Input:
 * <input 
 *   className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:border-primary-500 focus-ring-primary theme-transition"
 *   type="text"
 * />
 * 
 * Badge:
 * <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-700 dark:bg-primary-500/15 dark:text-primary-400">
 *   Active
 * </span>
 * 
 * Alert Success:
 * <div className="bg-success-50 dark:bg-success-500/10 border border-success-500 text-success-700 dark:text-success-400 rounded-lg p-4">
 *   Success message
 * </div>
 */
