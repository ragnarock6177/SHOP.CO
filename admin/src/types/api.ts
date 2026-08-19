export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ApiErrorDetail {
  code?: string;
  message: string;
  field?: string;
  details?: any;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
  error?: ApiErrorDetail;
}

export interface ApiPaginatedResponse<T = any> {
  success: boolean;
  message: string;
  data: T[];
  pagination: PaginationMeta;
  error?: ApiErrorDetail;
}

export interface AdminQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  status?: string;
  fromDate?: string;
  toDate?: string;
  [key: string]: any;
}

export interface DashboardMetrics {
  grossRevenue: number;
  totalOrders: number;
  todayOrders: number;
  lowStockCount: number;
  outOfStockCount: number;
  pendingReturns: number;
  pendingRefunds: number;
  activeCustomersCount: number;
  recentOrders: Array<{
    id: string;
    orderNumber: string;
    customerName: string;
    customerEmail: string;
    totalAmount: number;
    status: string;
    createdAt: string;
  }>;
  recentAuditLogs: Array<{
    id: string;
    action: string;
    entityType: string;
    entityId: string;
    actorName: string;
    createdAt: string;
  }>;
}
