// src/constants/theme.js

export const COLORS = {
  canvas: '#f8fafc',
  surface: '#ffffff',
  text: '#0f172a',
  textSecondary: '#64748b',
  border: '#f1f5f9',
  borderDark: '#e2e8f0',
  primary: '#7c3aed',
  primaryLight: '#ede9fe',
  success: '#10b981',
  successLight: '#d1fae5',
  error: '#f43f5e',
  errorLight: '#ffe4e6',
  warning: '#f59e0b',
  warningLight: '#fef3c7',
};

export const SIZES = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
  
  // Component sizes
  inputHeight: 52,
  buttonHeight: 52,
};

export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,     // Buttons, Inputs
  xl: 24,     // Cards
  xxl: 32,    // Modals
};

export const SHADOWS = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
  },
};

export const FONTS = {
  // Using system fonts since custom fonts require linking
  bold: '700',
  semiBold: '600',
  medium: '500',
  regular: '400',
};

export const TEXT = {
  h1: {
    fontSize: 32,
    fontWeight: FONTS.bold,
    color: COLORS.text,
    letterSpacing: -0.5,
  },
  h2: {
    fontSize: 24,
    fontWeight: FONTS.bold,
    color: COLORS.text,
    letterSpacing: -0.5,
  },
  h3: {
    fontSize: 18,
    fontWeight: FONTS.semiBold,
    color: COLORS.text,
  },
  body: {
    fontSize: 15,
    fontWeight: FONTS.regular,
    color: COLORS.text,
  },
  bodySecondary: {
    fontSize: 14,
    fontWeight: FONTS.medium,
    color: COLORS.textSecondary,
  },
  label: {
    fontSize: 12,
    fontWeight: FONTS.semiBold,
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
};

export default {
  COLORS,
  SIZES,
  RADIUS,
  SHADOWS,
  FONTS,
  TEXT,
};
