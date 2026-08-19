export * from "./api";

export interface Product {
  id: string;
  sku: string;
  title: string;
  description: string;
  price: number;
  compareAtPrice?: number | null;
  stock: number;
  status: 'IN_STOCK' | 'OUT_OF_STOCK' | 'ARCHIVED';
  category: string;
  tags: string[];
  images: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  total: number;
  status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  ordersCount: number;
  totalSpent: number;
  createdAt: string;
}
