export type WalletTransactionType = "credit" | "debit";

export type WalletTransaction = {
  id: string;
  createdAt: string; // ISO
  reference?: string;
  gateway: string;
  title: string;
  type: WalletTransactionType;
  amount: number;
};

export type WalletState = {
  balance: number;
  currency: string;
  transactions: WalletTransaction[];
};

const STORAGE_KEY = "profile_wallet_v2";
const LEGACY_STORAGE_KEY = "profile_wallet_v1";

function normalizeCurrency(currency: string | null | undefined): string {
  const c = (currency ?? "").trim();
  if (!c) return "USD";
  if (c === "ر.س" || c.toLowerCase() === "sar") return "USD";
  return c;
}

function safeParseJson<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function seed(): WalletState {
  const now = Date.now();
  return {
    balance: 125.5,
    currency: "USD",
    transactions: [
      {
        id: `tx_${now - 1000}`,
        createdAt: new Date(now - 1000 * 60 * 60 * 6).toISOString(),
        reference: "INV-DEMO-1001",
        gateway: "Stripe",
        title: "شحن رصيد",
        type: "credit",
        amount: 50,
      },
      {
        id: `tx_${now - 2000}`,
        createdAt: new Date(now - 1000 * 60 * 60 * 28).toISOString(),
        reference: "ORD-DEMO-2002",
        gateway: "Wallet",
        title: "شراء خدمة",
        type: "debit",
        amount: 24.5,
      },
      {
        id: `tx_${now - 3000}`,
        createdAt: new Date(now - 1000 * 60 * 60 * 72).toISOString(),
        reference: "CZ-DEMO-3003",
        gateway: "Bank Transfer",
        title: "شحن رصيد",
        type: "credit",
        amount: 100,
      },
    ],
  };
}

export function loadWallet(): WalletState {
  try {
    const parsed = safeParseJson<WalletState>(localStorage.getItem(STORAGE_KEY));
    if (parsed && typeof parsed.balance === "number" && Array.isArray(parsed.transactions)) {
      return { ...parsed, currency: normalizeCurrency(parsed.currency) };
    }

    const legacy = safeParseJson<WalletState>(localStorage.getItem(LEGACY_STORAGE_KEY));
    if (legacy && typeof legacy.balance === "number" && Array.isArray(legacy.transactions)) {
      const migrated = { ...legacy, currency: normalizeCurrency(legacy.currency) };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
      return migrated;
    }
  } catch {
    // ignore
  }

  const initial = seed();
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
  } catch {
    // ignore
  }

  return initial;
}

export function saveWallet(next: WalletState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

export function creditWallet(args: {
  amount: number;
  gateway: string;
  title?: string;
  reference?: string;
}): WalletState {
  const amount = Number(args.amount);
  if (!Number.isFinite(amount) || amount <= 0) {
    return loadWallet();
  }

  const current = loadWallet();
  const next: WalletState = {
    ...current,
    currency: normalizeCurrency(current.currency),
    balance: Math.round((current.balance + amount) * 100) / 100,
    transactions: [
      {
        id: `tx_${Date.now()}_${Math.random().toString(16).slice(2)}`,
        createdAt: new Date().toISOString(),
        reference: args.reference,
        gateway: args.gateway,
        title: args.title ?? "شحن رصيد",
        type: "credit",
        amount,
      },
      ...current.transactions,
    ],
  };

  saveWallet(next);
  return next;
}
