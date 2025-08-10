export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  emailVerified?: boolean;
  createdAt?: Date;
  lastLoginAt?: Date;
}

export interface UserProfile extends User {
  preferences: UserPreferences;
  subscription?: UserSubscription;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  currency: string;
  language: string;
  notifications: NotificationPreferences;
  dashboard: DashboardPreferences;
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  marketUpdates: boolean;
  portfolioAlerts: boolean;
  priceAlerts: boolean;
}

export interface DashboardPreferences {
  defaultView: 'grid' | 'list';
  chartsVisible: boolean;
  refreshInterval: number;
  compactMode: boolean;
}

export interface UserSubscription {
  plan: 'free' | 'premium' | 'pro';
  status: 'active' | 'cancelled' | 'expired';
  startDate: Date;
  endDate?: Date;
  features: string[];
}

export type UserRole = 'user' | 'admin' | 'moderator';

export interface UserPermissions {
  canCreatePortfolios: boolean;
  canSharePortfolios: boolean;
  canExportData: boolean;
  maxPortfolios: number;
  maxStocksPerPortfolio: number;
}
