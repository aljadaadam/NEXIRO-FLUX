// ─── أنواع البيانات — متجر سيارات ───

export interface Car {
  id: number;
  name: string;
  name_en?: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  original_price?: number;
  condition: 'new' | 'used';
  mileage?: number;
  fuel_type: string;
  transmission: string;
  color: string;
  engine: string;
  horsepower?: number;
  seats?: number;
  description?: string;
  description_en?: string;
  images: string[];
  is_featured?: boolean;
  is_sold?: boolean;
  category?: string;
  created_at?: string;
}

export interface Branch {
  id: number;
  name: string;
  name_en?: string;
  address: string;
  address_en?: string;
  city: string;
  phone: string;
  email?: string;
  lat?: number;
  lng?: number;
  working_hours?: string;
  is_main?: boolean;
  image?: string;
}

export interface Order {
  id: number;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  car_id: number;
  car_name?: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
  branch_id?: number;
  created_at?: string;
  total_price?: number;
}

export interface Customer {
  id: number;
  name: string;
  email: string;
  phone?: string;
  created_at?: string;
}

export interface User {
  id: number;
  username: string;
  role: string;
}

export interface DashboardStats {
  total_cars: number;
  new_cars: number;
  used_cars: number;
  total_orders: number;
  pending_orders: number;
  total_customers: number;
  total_revenue: number;
  featured_cars: number;
}
