// ─── أنواع البيانات ───

export interface Product {
  id: number;
  name: string;
  arabic_name?: string;
  price: string;
  originalPrice?: string;
  icon: string;
  category: string;
  badge?: string;
  badgeColor?: string;
  rating?: number;
  sales?: number;
  desc?: string;
  stock?: number;
  status?: string;
  is_featured?: number;
  is_game?: number;
  name_priority?: 'ar' | 'en';
  allowsQuantity?: boolean;
  minQuantity?: number;
  maxQuantity?: number;
  // حقول الباكند
  service_type?: string;
  service_time?: string;
  group_name?: string;
  external_service_key?: string;
  source_id?: number;
  linked_product_id?: number | null;
  requires_custom_json?: unknown;
  custom_json?: unknown;
  customFields?: Array<{
    key: string;
    label: string;
    placeholder?: string;
    required?: boolean;
  }>;
}

export interface Order {
  id: number;
  order_number: string;
  product_name: string;
  product_id?: number;
  customer_id?: number;
  customer_name?: string;
  customer_email?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  status: string;
  payment_method?: string;
  payment_status?: string;
  imei?: string;
  server_response?: string;
  notes?: string;
  external_reference_id?: string;
  source_id?: number;
  created_at?: string;
  completed_at?: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  joined: string;
  orders?: number;
  spent?: string;
  wallet_balance?: number;
  _type?: 'customer' | 'staff';
}

export interface StatsCard {
  label: string;
  value: string;
  change: string;
  positive: boolean;
  icon: string;
  color: string;
  bg: string;
}

export interface Announcement {
  id: number;
  title: string;
  content: string;
  date: string;
  active: boolean;
}

export interface BlogPost {
  id: number;
  title: string;
  title_en: string;
  excerpt: string;
  excerpt_en: string;
  content: string[];
  category: string;
  category_color: string;
  image: string;
  read_time: number;
  views: number;
  is_published: boolean;
  published_at: string;
  created_at: string;
  updated_at: string;
}

export interface PaymentGateway {
  id: number;
  site_key: string;
  type: 'paypal' | 'bank_transfer' | 'usdt' | 'binance';
  name: string;
  name_en?: string;
  is_enabled: boolean;
  is_default: boolean;
  config: Record<string, unknown>;
  countries?: string[] | null;
  display_order: number;
  created_at?: string;
  updated_at?: string;
}

export interface ExternalSource {
  id: number;
  name: string;
  icon: string;
  type: string;
  url: string;
  status: string;
  statusColor: string;
  lastSync: string;
  products: number;
  balance: string;
}

export interface CustomizeState {
  themeId: string;
  setThemeId: (id: string) => void;
  logoPreview: string | null;
  setLogoPreview: (url: string | null) => void;
  storeName: string;
  setStoreName: (name: string) => void;
  darkMode: boolean;
  setDarkMode: (v: boolean) => void;
  buttonRadius: string;
  setButtonRadius: (v: string) => void;
  headerStyle: string;
  setHeaderStyle: (v: string) => void;
  showBanner: boolean;
  setShowBanner: (v: boolean) => void;
  fontFamily: string;
  setFontFamily: (v: string) => void;
  currentTheme: import('./themes').ColorTheme;
  colorThemes: import('./themes').ColorTheme[];
  refetch: () => Promise<void>;
}
