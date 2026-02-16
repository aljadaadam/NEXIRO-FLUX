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
  // حقول الباكند
  service_type?: string;
  group_name?: string;
  external_service_key?: string;
  source_id?: number;
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
  id: string;
  product: string;
  status: string;
  statusColor: string;
  date: string;
  price: string;
  icon?: string;
  customer?: string;
  email?: string;
  payment?: string;
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

export interface PaymentGateway {
  name: string;
  icon: string;
  status: boolean;
  fees: string;
  desc: string;
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
