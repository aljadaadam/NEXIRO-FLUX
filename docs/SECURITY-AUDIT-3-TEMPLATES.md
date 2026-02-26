# Security Audit Report — HX-Tools, Car-Store, GX-Vault Templates

**Auditor:** Senior Security Auditor  
**Date:** 2026-02-26  
**Scope:** `templates/hx-tools-store/src/`, `templates/car-store/src/`, `templates/gx-vault/src/`  
**Reference:** Vulnerabilities previously found & fixed in YCZ-Store

---

## Vulnerability Matrix (Summary)

| # | Vulnerability | HX-Tools | Car-Store | GX-Vault | Severity |
|---|---|:---:|:---:|:---:|---|
| 1 | Admin/Auth Token in URL → localStorage without validation | **YES** | No | **YES** | 🔴 Critical |
| 2 | JWT stored in localStorage | Confirmed | Confirmed | Confirmed | ⚪ Informational |
| 3 | Open Redirect via API response | No | No | **YES** | 🟠 High |
| 4 | Custom CSS Injection | No | No | No | ✅ Not Found |
| 5 | Auth Guards on Protected Pages | **WEAK** | N/A | **WEAK** | 🟡 Medium |
| 6 | Payment Endpoints Without Auth | No | N/A | **YES** | 🟡 Medium |
| 7 | Console Logging (sensitive data) | ✅ Clean | **YES** | **YES** | 🟢 Low |
| 8 | NEW: `gxvCustomerFetch` — No error status check | — | — | **YES** | 🟡 Medium |
| 9 | NEW: GX-Vault login page stores admin token from URL | — | — | **YES** | 🔴 Critical |
| 10 | NEW: Unchecked `res.json()` on non-ok responses in `gxvCustomerFetch` | — | — | **YES** | 🟡 Medium |

---

## 1. Admin/Auth Token in URL → localStorage Without Validation

### HX-Tools Store — 🔴 CRITICAL

**File:** `templates/hx-tools-store/src/app/login/page.tsx` (Lines 12–16)

```tsx
useEffect(() => {
  const token = searchParams.get('token');
  if (token) {
    localStorage.setItem('hx_auth_token', token);
    router.replace('/profile');
  } else {
    router.replace('/profile');
  }
}, [searchParams, router]);
```

**Issue:** Any value from `?token=<anything>` is blindly stored as `hx_auth_token` in localStorage. No JWT format validation, no server verification. An attacker can craft a phishing link like `https://store.com/login?token=malicious-value` and the victim's browser will store it.

**Impact:** Session hijacking, token fixation attacks. If an attacker knows a valid token, they can set it in another user's browser.

---

### GX-Vault — 🔴 CRITICAL

**File:** `templates/gx-vault/src/app/login/page.tsx` (Lines 28–31)

```tsx
const token = searchParams.get('token');
if (token) {
  localStorage.setItem('admin_key', token);
  router.replace('/admin');
}
```

**Issue:** Same vulnerability but **worse** — this stores the URL parameter directly as `admin_key` (the ADMIN token). An attacker can set an arbitrary admin token in the victim's browser or use this for token fixation to gain admin access.

**Impact:** Full admin panel compromise via token fixation.

---

### Car-Store — ✅ NOT VULNERABLE

Car-Store has **no login page file** (`src/app/login/` doesn't exist). Admin login is handled via username/password form in `src/app/admin/page.tsx` (Line 58). No `?token=` parameter handling.

---

## 2. JWT Storage in localStorage

| Template | Key Name | File | Confirmed |
|---|---|---|---|
| HX-Tools | `hx_auth_token` | `src/lib/hxApi.ts:25` | ✅ |
| HX-Tools | `hx_admin_key` | `src/lib/hxApi.ts:20` | ✅ |
| Car-Store | `auth_token` | `src/lib/api.ts:25` | ✅ |
| Car-Store | `admin_key` | `src/lib/api.ts:20` | ✅ |
| GX-Vault | `auth_token` | `src/engine/gxvApi.ts:26` | ✅ |
| GX-Vault | `admin_key` | `src/engine/gxvApi.ts:22` | ✅ |

**Severity:** ⚪ Informational — This is the expected storage mechanism for this project. Noted for completeness; httpOnly cookies would be more secure but requires architectural change.

---

## 3. Open Redirects via API Response

### GX-Vault — 🟠 HIGH

**Files & Lines:**
- `src/app/(vault)/page.tsx` Lines 73–74
- `src/app/(vault)/services/page.tsx` Lines 66–67
- `src/app/(vault)/profile/page.tsx` Lines 99, 103

```tsx
// page.tsx:73-74
if (res.redirectUrl) { window.location.href = res.redirectUrl; return; }
if (res.checkoutUrl) { window.location.href = res.checkoutUrl; return; }
```

**Issue:** `res.redirectUrl` and `res.checkoutUrl` from the API response are used directly in `window.location.href` without ANY validation. If the API is compromised or a MITM attack occurs, the user can be redirected to any external malicious URL (phishing sites, malware downloads).

This pattern appears in **3 separate files** (6 instances total).

**Remediation:** Validate that redirect URLs are same-origin or on an allowlist of trusted payment provider domains.

---

### HX-Tools Store — ✅ NOT VULNERABLE

The HX checkout flow (`src/app/(store)/cart/page.tsx`) does NOT use `window.location.href` with API responses. Orders are placed and result is displayed inline.

---

### Car-Store — ✅ NOT VULNERABLE

No redirect-from-API-response patterns found.

---

## 4. Custom CSS Injection

### All Three Templates — ✅ NOT VULNERABLE

None of the three templates use `dangerouslySetInnerHTML` for CSS injection from API `customCss` fields in their source code. The ThemeProvider/ThemeCore components apply customization through React state (theme IDs, font family, etc.) rather than raw CSS injection. No `custom_css` field is consumed.

---

## 5. Auth Guards on Protected Pages

### HX-Tools Store — 🟡 MEDIUM

**File:** `src/app/(store)/orders/page.tsx` (Lines 22–28)

```tsx
useEffect(() => {
  const fetchOrders = async () => {
    try {
      const data = await hxStoreApi.getOrders();
      setOrders(data.orders || []);
    } catch { setOrders([]); }
    setLoading(false);
  };
  fetchOrders();
}, []);
```

**Issue:** The orders page does NOT check for `hx_auth_token` before rendering. It directly calls `hxStoreApi.getOrders()` which will fail with a 401 if not authenticated, but:
- The page **still renders the full UI shell** (header, empty state, etc.)
- No redirect to login on auth failure
- The catch silently swallows the error — user sees "no orders" instead of "please log in"

**Same pattern in:** `src/app/(store)/profile/page.tsx` — However, profile page DOES check for token (Line 40: `if (token) { setIsLoggedIn(true); fetchProfile(); }`) and shows a login form if not authenticated. This is acceptable.

---

### GX-Vault — 🟡 MEDIUM

**File:** `src/app/(vault)/orders/page.tsx` (Lines 24–29)

```tsx
useEffect(() => {
  gxvStoreApi.getOrders().then(data => {
    const list = Array.isArray(data) ? data : data?.orders || [];
    setOrders(list);
    setLoading(false);
  }).catch(() => setLoading(false));
}, []);
```

**Issue:** Same problem — no auth check before rendering. The vault layout (`(vault)/layout.tsx`) has NO auth guard. Anyone can navigate to `/orders` and the page renders.

**GX-Vault store layout** (`src/app/(vault)/layout.tsx`) has NO auth checking at all — it's just a navbar wrapper. The admin layout (`src/app/admin/layout.tsx`) DOES check for `admin_key` token.

---

### Car-Store — N/A

Car-Store has no customer-facing orders/profile pages (it's a car showroom, not an e-commerce store with customer accounts).

---

## 6. Payment Endpoints Without Auth

### GX-Vault — 🟡 MEDIUM

**File:** `src/engine/gxvApi.ts` (Lines 61–76)

```tsx
async function gxvCustomerFetch(endpoint: string, options: RequestInit = {}) {
  // ...demo mode...
  const token = gxvGetAuthToken();
  const res = await fetch(`${GXV_API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  return res.json(); // ← No auth check, no error handling
}
```

**Issue:** `gxvCustomerFetch` makes the auth token **optional** (the ternary `token ? {...} : {}`). If no token is in localStorage, the request goes out WITHOUT authorization. This means:
- `gxvStoreApi.createOrder()` — creates orders without auth
- `gxvStoreApi.chargeWallet()` — calls `/checkout/init` without auth
- `gxvStoreApi.getOrders()` — fetches orders without auth

The backend may reject these, but the frontend doesn't enforce authentication.

Compare with **HX-Tools** which has the same pattern in `hxCustomerFetch` BUT at least handles 401/403 responses and clears the invalid token (Lines 80-86).

---

### HX-Tools Store — ✅ BETTER

`hxCustomerFetch` (Line 80-86) handles 401/403:
```tsx
if (res.status === 401 || res.status === 403) {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('hx_auth_token');
  }
  // ... throws error
}
```

However, it still sends requests without a token if none is stored. The backend must enforce auth.

---

### Car-Store — ✅ SIMILAR PATTERN

`customerFetch` in `src/lib/api.ts` follows the same pattern as HX-Tools. Auth is optional on the frontend. No checkout/payment endpoints exist in the car-store API.

---

## 7. Console Logging

### HX-Tools Store — ✅ CLEAN

No `console.log`, `console.error`, or `console.warn` calls found in source files.

### Car-Store — 🟢 LOW

**File:** `src/providers/ThemeProvider.tsx` Line 125:
```tsx
console.warn('[ThemeProvider] فشل جلب التخصيص من الخادم');
```
**Impact:** Low — only logs a generic warning, no sensitive data exposed.

### GX-Vault — 🟢 LOW

**File:** `src/core/GxvThemeCore.tsx` Line 92:
```tsx
console.warn('[GxvThemeCore] فشل جلب التخصيص، استخدام الكاش');
```
**Impact:** Low — generic error message, no sensitive data.

---

## 8. NEW: `gxvCustomerFetch` Does Not Check Response Status

### GX-Vault — 🟡 MEDIUM

**File:** `src/engine/gxvApi.ts` Lines 61–76

```tsx
async function gxvCustomerFetch(endpoint: string, options: RequestInit = {}) {
  // ...
  const res = await fetch(`${GXV_API_BASE}${endpoint}`, { /* ... */ });
  return res.json(); // ← DANGER: No res.ok check, no status check
}
```

**Issue:** Unlike `gxvAdminFetch` (which checks for 401/403) and `hxCustomerFetch` (which checks for 401/403 and `!res.ok`), `gxvCustomerFetch`:
1. Does NOT check `res.ok` or `res.status`
2. Does NOT throw on HTTP errors
3. Does NOT clear invalid tokens on 401

**Impact:** 
- Failed requests return error JSON that gets silently treated as valid data
- Invalid/expired tokens are never cleaned up, causing persistent auth failures
- Error details from the server (potentially including stack traces, internal paths) are passed through as "data"

---

## 9. NEW: GX-Vault Login Page Stores Admin Token from URL (Elevated Privilege)

### GX-Vault — 🔴 CRITICAL

**File:** `src/app/login/page.tsx` Lines 28–31

```tsx
const token = searchParams.get('token');
if (token) {
  localStorage.setItem('admin_key', token);  // ← Stored as ADMIN key!
  router.replace('/admin');
}
```

**Issue (distinct from #1):** While HX-Tools stores URL tokens as customer auth tokens (`hx_auth_token`), GX-Vault stores URL tokens as **admin keys** (`admin_key`). This means:
- A phishing link can give the attacker admin access
- The admin key grants access to ALL admin API endpoints (products, orders, users, payment gateways, sources, etc.)
- Combined with the lack of validation, this is a full admin takeover vector

---

## 10. NEW: HX-Tools Admin `?key=` Slug Stored Without Validation

### HX-Tools — 🟢 LOW

**File:** `src/app/admin/layout.tsx` Lines 66–74

```tsx
const keyParam = searchParams.get('key');
const sessionSlug = typeof window !== 'undefined' ? sessionStorage.getItem('hx_admin_slug') : null;
const slug = keyParam || sessionSlug;
if (slug) {
  try {
    const res = await fetch(`/api/customization/verify-slug/${slug}`);
    if (res.ok) {
      if (typeof window !== 'undefined') sessionStorage.setItem('hx_admin_slug', slug);
      setSlugVerified(true);
    }
  } catch {}
}
```

**Finding:** The `?key=` parameter is a slug (not a token) and IS verified against the backend before being accepted. This is properly implemented — the slug only identifies which site to manage, and actual authentication still requires email/password login. **Not a vulnerability.**

---

## Remediation Priority

| Priority | Template | Issue | Fix |
|---|---|---|---|
| 🔴 P0 | GX-Vault | Login stores `admin_key` from URL (#1, #9) | Validate token with backend before storing; OR remove `?token=` flow entirely and use email/password only |
| 🔴 P0 | HX-Tools | Login stores `hx_auth_token` from URL (#1) | Same — validate before storing |
| 🟠 P1 | GX-Vault | Open redirects from API response (#3) | Validate redirect URLs are same-origin or on allowlist |
| 🟡 P2 | GX-Vault | `gxvCustomerFetch` no status check (#8, #10) | Add `res.ok` check, handle 401/403, throw on errors |
| 🟡 P2 | GX-Vault | Checkout calls without enforced auth (#6) | Add token check before making payment API calls |
| 🟡 P2 | HX-Tools & GX-Vault | Orders page no auth guard (#5) | Check for token and redirect to login/profile if missing |
| 🟢 P3 | Car-Store & GX-Vault | Console warnings (#7) | Remove or use production-safe logging |

---

## Templates With No Issues Found

| Check | Car-Store Status |
|---|---|
| Token in URL | ✅ Not vulnerable (no login page) |
| Open Redirects | ✅ Not vulnerable (no redirect from API) |
| Custom CSS Injection | ✅ Not vulnerable |
| Auth Guards | N/A (no customer auth flow) |
| Payment Without Auth | N/A (no payment flow) |
| Console Logging | 🟢 One benign warning |

**Car-Store is the cleanest template** — it's a simpler showroom site without customer auth/payment flows, which reduces its attack surface significantly.

---

*End of Report*
