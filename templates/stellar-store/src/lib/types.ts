export interface ProductField {
  name: string;
  label: string;
  required?: boolean;
  type?: 'text' | 'email' | 'number' | 'tel';
}

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
  is_featured?: boolean;
  service_type?: string;
  custom_fields?: ProductField[];
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
  pendingOrders?: number;
  completedOrders?: number;
  ordersToday?: number;
  todayRevenue?: number;
  revenueToday?: number;
  totalProfit?: number;
  todayProfit?: number;
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
  product_id?: number;
  quantity: number;
  total_price: number;
  status: string;
  payment_method: string;
  notes?: string;
  response?: string;
  server_response?: string;
  imei?: string;
  customer_name?: string;
  customer_email?: string;
  created_at: string;
}

export interface Payment {
  id: number;
  customer_name?: string;
  customer_email?: string;
  amount: number;
  type: string;
  status: string;
  payment_method?: string;
  reference?: string;
  receipt_url?: string;
  created_at?: string;
}

export interface Notification {
  id: number;
  title: string;
  message: string;
  type: string;
  link?: string;
  is_read?: boolean;
  recipient_type?: string;
  created_at?: string;
}

export interface PaymentGateway {
  id: number;
  name: string;
  type: 'bankak' | 'bank_transfer' | 'paypal' | 'usdt' | 'binance' | 'wallet';
  is_enabled: boolean;
  config?: {
    account_number?: string;
    full_name?: string;
    receipt_note?: string;
    [key: string]: unknown;
  };
  logo?: string;
  created_at?: string;
}

export interface Customization {
  theme_id?: string;
  primary_color?: string;
  secondary_color?: string;
  dark_mode?: boolean;
  button_radius?: string;
  header_style?: string;
  show_banner?: boolean;
  font_family?: string;
  store_language?: string;
  store_name?: string;
  store_description?: string;
  logo_url?: string;
  whatsapp_number?: string;
  telegram_link?: string;
  instagram_link?: string;
  twitter_link?: string;
  facebook_link?: string;
  // SMTP
  smtp_host?: string;
  smtp_port?: string;
  smtp_user?: string;
  smtp_pass?: string;
  support_email?: string;
  allow_customer_cancel?: boolean;
}
