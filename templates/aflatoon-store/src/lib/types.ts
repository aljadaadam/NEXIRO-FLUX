export interface Product {
  id: number;
  name: string;
  arabic_name?: string;
  price: number;
  final_price?: number;
  description?: string;
  category?: string;
  group_name?: string;
  image?: string;
  status?: string;
  qnt?: number;
  is_custom_price?: boolean;
  service_type?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Category {
  name: string;
  count: number;
}

export interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  totalCustomers: number;
}
