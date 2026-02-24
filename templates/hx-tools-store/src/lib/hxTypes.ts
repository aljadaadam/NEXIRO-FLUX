// ─── HX Tools Store - Types ───

export interface HxProduct {
  id: number;
  name: string;
  arabic_name?: string;
  displayName?: string;
  description?: string;
  price: number;
  originalPrice?: string;
  icon: string;
  image?: string;
  category: string;
  badge?: string;
  badgeColor?: string;
  rating?: number;
  sales?: number;
  desc?: string;
  stock?: number;
  status?: string;
  is_featured?: number | boolean;
  is_active?: boolean;
  is_game?: number;
  name_priority?: 'ar' | 'en';
  allowsQuantity?: boolean;
  minQuantity?: number;
  maxQuantity?: number;
  service_type?: string;
  service_time?: string;
  group_name?: string;
  external_service_key?: string;
  source_id?: number;
  linked_product_id?: number | null;
  requires_custom_json?: unknown;
  custom_json?: unknown;
  weight?: number;
  dimensions?: string;
  brand?: string;
  model?: string;
  warranty?: string;
  images?: string[];
  customFields?: Array<{
    key: string;
    label: string;
    placeholder?: string;
    required?: boolean;
  }>;
  [key: string]: unknown;
}

export interface HxOrder {
  id: number;
  order_number: string;
  product_name: string;
  product_id?: number;
  customer_id?: number;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  shipping_cost: number;
  total_with_shipping: number;
  status: string;
  payment_method?: string;
  payment_status?: string;
  shipping_address?: HxShippingAddress;
  tracking_number?: string;
  server_response?: string;
  notes?: string;
  currency: string;
  created_at?: string;
  completed_at?: string;
  shipped_at?: string;
}

export interface HxShippingAddress {
  fullName: string;
  phone: string;
  country: string;
  city: string;
  area: string;
  street: string;
  building?: string;
  postalCode?: string;
  notes?: string;
}

export interface HxCustomer {
  id: number;
  name: string;
  email: string;
  phone?: string;
  country?: string;
  city?: string;
  address?: string;
  orders_count?: number;
  total_orders?: number;
  total_spent?: number;
  wallet_balance?: number;
  created_at?: string;
}

export interface HxDeliveryZone {
  id: number;
  country: string;
  country_code: string;
  regions: HxDeliveryRegion[];
  is_enabled?: boolean;
  is_active?: boolean;
  base_shipping_cost: number;
  currency: string;
  estimated_days: string;
}

export interface HxDeliveryRegion {
  id: number;
  zone_id?: number;
  name: string;
  extra_cost: number;
  is_enabled?: boolean;
  is_active?: boolean;
}

export interface HxCurrency {
  id: number;
  code: string;
  name: string;
  symbol: string;
  rate: number;
  is_default: boolean;
}

export interface HxPaymentGateway {
  id: number;
  site_key: string;
  type: 'paypal' | 'bank_transfer' | 'usdt' | 'binance' | 'cod';
  name: string;
  name_en?: string;
  is_enabled?: boolean;
  is_active?: boolean;
  is_default: boolean;
  details?: string;
  config: Record<string, unknown>;
  countries?: string[] | null;
  display_order: number;
  created_at?: string;
  updated_at?: string;
}

export interface HxCartItem {
  product: HxProduct;
  quantity: number;
}

export interface HxStatsCard {
  key?: string;
  label: string;
  value: string;
  change: number;
  positive: boolean;
  icon: string;
  color: string;
  bg: string;
}

export interface HxAnnouncement {
  id: number;
  title: string;
  content?: string;
  message?: string;
  date?: string;
  type?: string;
  active?: boolean;
  is_active?: boolean;
}

export interface HxBanner {
  id: number | string;
  title: string;
  subtitle: string;
  image: string;
  link?: string;
  gradient: string;
  icon?: string;
  is_active?: boolean;
}
