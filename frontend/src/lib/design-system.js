// Design System - Color Tokens & Utilities
// Use these constants throughout the application for consistency

export const COLORS = {
  // Primary Brand Color
  brand: {
    primary: '#F59E0B',      // Orange-500 - Main brand color
    primaryHover: '#F97316', // Orange-600 - Hover state
    primaryActive: '#EA580C', // Orange-700 - Active state
  },

  // Semantic Status Colors
  status: {
    success: '#22C55E',      // Green-500
    successBg: 'rgba(34, 197, 94, 0.1)',
    successBorder: 'rgba(34, 197, 94, 0.2)',
    
    warning: '#EAB308',      // Yellow-500
    warningBg: 'rgba(234, 179, 8, 0.1)',
    warningBorder: 'rgba(234, 179, 8, 0.2)',
    
    error: '#EF4444',        // Red-500
    errorBg: 'rgba(239, 68, 68, 0.1)',
    errorBorder: 'rgba(239, 68, 68, 0.2)',
    
    info: '#3B82F6',         // Blue-500
    infoBg: 'rgba(59, 130, 246, 0.1)',
    infoBorder: 'rgba(59, 130, 246, 0.2)',
  },

  // Severity Levels (Security Context)
  severity: {
    critical: {
      text: '#FCA5A5',       // Red-300
      bg: 'rgba(239, 68, 68, 0.1)',
      border: 'rgba(239, 68, 68, 0.2)',
      solid: '#EF4444',
    },
    high: {
      text: '#FB923C',       // Orange-400
      bg: 'rgba(249, 115, 22, 0.1)',
      border: 'rgba(249, 115, 22, 0.2)',
      solid: '#F97316',
    },
    medium: {
      text: '#FACC15',       // Yellow-400
      bg: 'rgba(234, 179, 8, 0.1)',
      border: 'rgba(234, 179, 8, 0.2)',
      solid: '#EAB308',
    },
    low: {
      text: '#60A5FA',       // Blue-400
      bg: 'rgba(59, 130, 246, 0.1)',
      border: 'rgba(59, 130, 246, 0.2)',
      solid: '#3B82F6',
    },
  },

  // Neutral Grays
  neutral: {
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#E5E5E5',
    300: '#D4D4D4',
    400: '#A3A3A3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
  },

  // Dark Theme Backgrounds
  dark: {
    bg: '#101010',
    card: '#1A1A1A',
    elevated: '#262626',
  },
};

// Tailwind CSS Class Utilities
export const BUTTON_STYLES = {
  primary: 'bg-[#F59E0B] hover:bg-[#F97316] active:bg-[#EA580C] text-black font-semibold transition-colors',
  secondary: 'bg-white/10 hover:bg-white/20 text-white border border-white/10 transition-colors',
  success: 'bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/20 transition-colors',
  danger: 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-colors',
  ghost: 'hover:bg-white/5 text-white/60 hover:text-white transition-colors',
};

export const BADGE_STYLES = {
  success: 'bg-green-500/10 text-green-400 border border-green-500/20',
  warning: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20',
  error: 'bg-red-500/10 text-red-400 border border-red-500/20',
  info: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
  brand: 'bg-orange-500/10 text-orange-400 border border-orange-500/20',
};

export const SEVERITY_BADGE_STYLES = {
  critical: 'bg-red-500/10 text-red-400 border border-red-500/20',
  high: 'bg-orange-500/10 text-orange-400 border border-orange-500/20',
  medium: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20',
  low: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
};

export const STATUS_BADGE_STYLES = {
  active: 'bg-green-500/10 text-green-400 border border-green-500/20',
  inactive: 'bg-red-500/10 text-red-400 border border-red-500/20',
  pending: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20',
  running: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
  completed: 'bg-green-500/10 text-green-400 border border-green-500/20',
  failed: 'bg-red-500/10 text-red-400 border border-red-500/20',
};

export const CARD_STYLES = {
  default: 'bg-[#1A1A1A] border border-white/10 rounded-xl',
  elevated: 'bg-[#262626] border border-white/10 rounded-xl shadow-lg',
  success: 'bg-[#1A1A1A] border border-green-500/20 rounded-xl',
  warning: 'bg-[#1A1A1A] border border-yellow-500/20 rounded-xl',
  error: 'bg-[#1A1A1A] border border-red-500/20 rounded-xl',
};

export const INPUT_STYLES = {
  default: 'bg-[#101010] border border-white/10 text-white placeholder:text-white/40 focus:border-[#F59E0B] focus:ring-2 focus:ring-[#F59E0B]/20 transition-colors',
  error: 'bg-[#101010] border border-red-500/50 text-white focus:border-red-500 focus:ring-2 focus:ring-red-500/20',
};

// Helper function to get severity badge class
export const getSeverityBadge = (severity) => {
  const s = severity?.toLowerCase();
  return SEVERITY_BADGE_STYLES[s] || SEVERITY_BADGE_STYLES.low;
};

// Helper function to get status badge class
export const getStatusBadge = (status) => {
  const s = status?.toLowerCase();
  return STATUS_BADGE_STYLES[s] || STATUS_BADGE_STYLES.pending;
};

// Helper function to get payment status badge
export const getPaymentBadge = (status) => {
  if (status === 'paid') return BADGE_STYLES.success;
  if (status === 'pending') return BADGE_STYLES.warning;
  if (status === 'failed') return BADGE_STYLES.error;
  return BADGE_STYLES.info;
};
