export const APP_CONSTANTS = {
  // Application Settings
  APP_NAME: 'Portfolio Management',
  APP_VERSION: '1.0.0',
  
  // API Configuration
  API: {
    TIMEOUT: 30000,
    RETRY_ATTEMPTS: 3
  },
  
  // Market Configuration
  MARKET: {
    HOURS: {
      OPEN: { hour: 9, minute: 15 },
      CLOSE: { hour: 15, minute: 30 }
    },
    REFRESH_INTERVAL: 5 * 60 * 1000, // 5 minutes
    CURRENCIES: {
      PRIMARY: 'INR',
      SYMBOL: '₹'
    }
  },
  
  // Validation Rules
  VALIDATION: {
    PASSWORD_MIN_LENGTH: 6,
    PORTFOLIO_NAME_MAX_LENGTH: 50,
    STOCK_SYMBOL_MAX_LENGTH: 20
  },
  
  // UI Configuration
  UI: {
    DEBOUNCE_TIME: 300,
    PAGE_SIZES: [10, 25, 50, 100],
    ANIMATION_DURATION: 200
  },
  
  // Storage Keys
  STORAGE_KEYS: {
    AUTH_TOKEN: 'auth_token',
    USER_PREFERENCES: 'user_preferences',
    THEME: 'theme'
  },
  
  // Routes
  ROUTES: {
    HOME: '/',
    DASHBOARD: '/dashboard',
    LOGIN: '/login',
    PORTFOLIO: '/portfolio',
    STOCK: '/stock'
  }
};

export const STOCK_EXCHANGES = {
  NSE: 'National Stock Exchange',
  BSE: 'Bombay Stock Exchange'
} as const;

export const PORTFOLIO_TYPES = {
  EQUITY: 'equity',
  DEBT: 'debt',
  HYBRID: 'hybrid'
} as const;
