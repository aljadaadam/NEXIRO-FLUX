// ─── GX-VAULT Types ───
// أنواع بيانات فريدة لقالب شحن الألعاب

export interface GxvProduct {
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
  gameSlug?: string;
  service_type?: string;
  group_name?: string;
  external_service_key?: string;
  source_id?: number;
  requires_custom_json?: unknown;
  custom_json?: unknown;
  customFields?: GxvCustomField[];
}

export interface GxvCustomField {
  key: string;
  label: string;
  placeholder?: string;
  required?: boolean;
}

export interface GxvOrder {
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

export interface GxvUser {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  joined: string;
  orders?: number;
  spent?: string;
}

export interface GxvStatCard {
  label: string;
  value: string;
  change: string;
  positive: boolean;
  icon: string;
  color: string;
  bg: string;
}

export interface GxvAnnouncement {
  id: number;
  title: string;
  content: string;
  date: string;
  active: boolean;
}

export interface GxvPaymentGateway {
  name: string;
  icon: string;
  status: boolean;
  fees: string;
  desc: string;
}

export interface GxvExternalSource {
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

export interface GxvGameInfo {
  slug: string;
  name: string;
  nameAr: string;
  color: string;
  gradient: string;
  icon: string;
  banner: string;
}
