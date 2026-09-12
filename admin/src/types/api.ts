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
  netRevenue: number;
  totalRefunds: number;
  revenueTrend?: string;
  totalOrders: number;
  todayOrders: number;
  ordersTrend?: string;
  totalItemsSold: number;
  unfulfilledOrders: number;
  statusBreakdown: Record<string, number>;
  lowStockCount: number;
  outOfStockCount: number;
  pendingReturns: number;
  pendingRefunds: number;
  overduePendingOrdersCount: number;
  topSellingProducts: Array<{
    name: string;
    sku: string;
    unitsSold: number;
    revenue: number;
  }>;
  paymentDistribution: Array<{
    provider: string;
    count: number;
    amount: number;
    percentage: number;
  }>;
  salesVelocityTimeline: Array<{
    date: string;
    label: string;
    revenue: number;
    orders: number;
  }>;
  lowStockAlerts: Array<{
    id: string;
    variantId: string;
    sku: string;
    productTitle: string;
    productImage: string | null;
    quantityOnHand: number;
    quantityReserved: number;
    availableQuantity: number;
    reorderLevel: number;
    isLowStock: boolean;
    isOutOfStock: boolean;
  }>;
  recentOrders: Array<{
    id: string;
    orderNumber: string;
    customerName: string;
    customerEmail: string;
    totalAmount: number;
    status: string;
    paymentProvider?: string;
    paymentStatus?: string;
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
