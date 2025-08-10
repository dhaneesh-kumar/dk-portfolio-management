/**
 * Base interface for entities with timestamps
 */
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Base interface for entities with user ownership
 */
export interface OwnedEntity extends BaseEntity {
  ownerId: string;
  ownerEmail: string;
}

/**
 * Base interface for API responses
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
  timestamp: Date;
}

/**
 * Pagination interface
 */
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

/**
 * Loading state interface
 */
export interface LoadingState {
  isLoading: boolean;
  loadingMessage?: string;
}

/**
 * Error state interface
 */
export interface ErrorState {
  hasError: boolean;
  errorMessage?: string;
  errorCode?: string;
}

/**
 * Combined async state interface
 */
export interface AsyncState<T = any> extends LoadingState, ErrorState {
  data?: T;
  lastUpdated?: Date;
}

/**
 * Filter interface for data filtering
 */
export interface Filter {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'contains';
  value: any;
}

/**
 * Search parameters interface
 */
export interface SearchParams extends PaginationParams {
  query?: string;
  filters?: Filter[];
  fields?: string[];
}

/**
 * Audit trail interface
 */
export interface AuditTrail {
  action: string;
  userId: string;
  userEmail: string;
  timestamp: Date;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}
