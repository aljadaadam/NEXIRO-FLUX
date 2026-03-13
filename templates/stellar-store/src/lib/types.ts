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

export interface Customer {
  id: number;
  name: string;
  email: string;
  phone?: string;
  country?: string;
  wallet_balance: number;
  is_verified?: boolean;
}

export interface Order {
  id: number;
  order_number: string;
  product_name: string;
  quantity: number;
  total_price: number;
  status: string;
  payment_method: string;
  notes?: string;
  response?: string;
  created_at: string;
}
