<div align="center">

# ✨ ShineUp Operations Dashboard

### A production-grade, dual-portal SaaS platform for managing on-demand automotive cleaning services at scale.

<br />

[![React](https://img.shields.io/badge/React-18.2-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-8.x-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![TanStack Query](https://img.shields.io/badge/TanStack_Query-5.x-FF4154?style=for-the-badge&logo=react-query&logoColor=white)](https://tanstack.com/query)
[![Zustand](https://img.shields.io/badge/Zustand-4.4-433E38?style=for-the-badge)](https://zustand-demo.pmnd.rs/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-4.8-010101?style=for-the-badge&logo=socket.io&logoColor=white)](https://socket.io/)
[![React Router](https://img.shields.io/badge/React_Router-6.x-CA4245?style=for-the-badge&logo=react-router&logoColor=white)](https://reactrouter.com/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![Nginx](https://img.shields.io/badge/Nginx-Proxied-009639?style=for-the-badge&logo=nginx&logoColor=white)](https://nginx.org/)
[![Leaflet](https://img.shields.io/badge/Leaflet-1.9-199900?style=for-the-badge&logo=leaflet&logoColor=white)](https://leafletjs.com/)

<br />

> **Built for a real client.** This dashboard manages the full operational lifecycle of a live on-demand car-wash platform — from provider onboarding and booking dispatch, to financial settlements and real-time support chat.

</div>

---

## 📖 Table of Contents

1. [Project Overview](#-project-overview)
2. [✨ Key Technical Achievements](#-key-technical-achievements)
3. [Feature Deep Dive](#-feature-deep-dive)
4. [Architecture & Directory Structure](#-architecture--directory-structure)
5. [Security & Engineering Best Practices](#-security--engineering-best-practices)
6. [Getting Started](#-getting-started)
7. [Screenshots & Demo](#-screenshots--demo)
8. [License](#-license)

---

## 🏢 Project Overview

The **ShineUp Operations Dashboard** is a full-featured, multi-tenant SaaS back-office application serving two distinct user personas on the same codebase:

| Portal | Path | Audience | Core Responsibilities |
|---|---|---|---|
| 🛡️ **Admin Portal** | `/admin/*` | Platform operators & super-admins | Booking oversight, provider vetting, financial reconciliation, RBAC management, support & analytics |
| 🚗 **Provider Dashboard** | `/provider/*` | Service company owners & individual providers | Incoming booking management, team operations, wallet withdrawals, service zone configuration |

### Business Value

- **Operational Efficiency:** Centralises all on-demand booking management, eliminating manual coordination and giving operators a single pane of glass.
- **Financial Transparency:** Tracks the full revenue lifecycle — customer payment → platform commission deduction → provider net earnings → withdrawal settlement.
- **Scalable Provider Network:** A structured onboarding flow (registration → admin review → approval → profile setup) enables controlled, quality-assured network growth.
- **Real-Time Support:** Integrated WebSocket-powered chat bridges support agents with both customers and providers without ever leaving the dashboard.

---

## ✨ Key Technical Achievements

> These are the engineering decisions that move this project beyond a typical CRUD dashboard.

### 1. 🕐 Smart Auto-Invalidation Timer (Deterministic Client-Side State Transitions)

**The Problem:** Bookings in `PENDING_PROVIDER_ACCEPTANCE` status have a server-side TTL — if no provider accepts within the window, the backend transitions them to `EXPIRED`. The challenge: the UI shows a stale `PENDING` badge until the next manual refresh, creating a confusing UX where the displayed state does not reflect reality.

**The Solution:** A self-scheduling `setTimeout`-based timer, computed directly from the booking's `paymentDeadlineAt` or acceptance window TTL, is mounted alongside each live booking row. Rather than polling the server every N seconds (which wastes bandwidth and server resources), the timer calculates the *exact milliseconds remaining* until the transition moment and fires a single, precise `queryClient.invalidateQueries()` at that instant.

```javascript
// Conceptual implementation within the Bookings feature
useEffect(() => {
  if (!booking.paymentDeadlineAt || booking.status !== 'PENDING') return;

  const msUntilExpiry = new Date(booking.paymentDeadlineAt).getTime() - Date.now();
  if (msUntilExpiry <= 0) return; // Already expired — let the next render handle it

  // Schedule a single, surgical cache invalidation at the exact expiry moment.
  // No polling. No wasted requests. Deterministic.
  const timerId = setTimeout(() => {
    queryClient.invalidateQueries({ queryKey: ['bookings'] });
    queryClient.invalidateQueries({ queryKey: ['booking', booking.id] });
  }, msUntilExpiry);

  return () => clearTimeout(timerId); // Cleanup on unmount or status change
}, [booking.id, booking.status, booking.paymentDeadlineAt]);
```

The `BookingDetailsPage` surfaces the live countdown (`paymentRemainingSeconds`) directly from the API payload, and the `BookingsPage` renders a visual payment-deadline indicator alongside each `PENDING_PAYMENT` booking — all without a single polling request.

**Why this matters:** This is the difference between an engineer who reads docs and an engineer who reasons about distributed systems. The UI acts as a deterministic state machine synchronised with the server's own TTL logic, achieving eventual consistency without the overhead of continuous polling.

---

### 2. 🧠 Advanced Data Fetching & Null-Safe Cache Merging (TanStack Query v5)

The data layer is not simply "call the API, show the result." Several sophisticated patterns were implemented:

#### a) Two-Source Data Merging in `useBookingDetails`

The list endpoint (`/admin/bookings`) returns rich booking objects (including `scheduledAt`, `pricing`, `paymentDeadlineAt`). The detail endpoint (`/admin/bookings/:id`) sometimes returns a subset, silently omitting fields the list already populated. A naive implementation would cause fields to *disappear* when navigating into the detail view.

The custom `useBookingDetails` hook solves this with a null-safe merge strategy:

```javascript
// Walk all cached 'bookings' list queries and pluck the matching item
function getListCacheItem() {
  const allListQueries = queryClient.getQueriesData({ queryKey: ['bookings'] });
  for (const [, data] of allListQueries) {
    const items = Array.isArray(data) ? data : data?.items;
    const found = items?.find((b) => b.id === bookingId);
    if (found) return found;
  }
}

// In the queryFn: merge detail over list-cache, but NEVER let a null/undefined
// from the detail response overwrite a real value from the list cache.
const merged = { ...cachedItem };
for (const [key, val] of Object.entries(detailData)) {
  if (val !== null && val !== undefined && val !== '') {
    merged[key] = val; // Detail wins only when it has a real value
  }
}
```

The `placeholderData: getListCacheItem` option means the detail page renders *instantly* from the cache while the detail request is in flight — zero loading spinners for data already in memory.

#### b) Global Query Defaults

Configured at the `QueryClient` level in `main.jsx`: `staleTime: 5 minutes`, `refetchOnWindowFocus: false`, and `retry: 1`. This prevents unnecessary background refetches on tab switches while still guaranteeing data freshness — a critical balance for a high-traffic ops dashboard.

#### c) Granular Predicate-Based Cache Invalidation

Mutations do not blindly `invalidateAll`. The `usePatchProviderManagement` hook uses a **predicate function** to surgically invalidate only the specific cached detail queries that include the `coverage` key — sparing all other cached provider data from unnecessary refetches:

```javascript
client.invalidateQueries({
  predicate: (query) => {
    const [root, kind, detailQuery] = query.queryKey;
    return (
      root === 'admin-provider-management' &&
      kind === 'detail' &&
      detailQuery?.providerId === providerId &&
      detailQuery?.include?.includes('coverage')
    );
  },
});
```

#### d) Flicker-Free Pagination with `placeholderData`

The `BookingsPage` uses `placeholderData: (prev) => prev` to keep the previous page's data visible while paginating — producing a flicker-free table UX that feels like a native app.

---

### 3. ⚡ Real-Time WebSocket Integration (Socket.IO + TanStack Query Bridge)

The `useChatSocket` hook, mounted once at the layout level (both `DashboardLayout` and `ProviderLayout`), manages the full WebSocket lifecycle for real-time chat and notifications.

**Architecture highlights:**

- **Token-authenticated connection:** The socket connects with `{ auth: { token } }`, auto-joining the user's personal room server-side — no explicit room-join emit is needed for personal notifications.
- **Role-aware token routing:** The hook inspects the current route path (`/admin/*` vs `/provider/*`) to select the correct Zustand store token, enabling a single hook to serve both portals without modification.
- **Zero-latency cache mutations on `message:created`:** Instead of re-fetching on every new message, the handler directly calls `queryClient.setQueryData()` to surgically append the new message to the correct `InfiniteQuery` page — with deduplication to prevent double-renders on message re-delivery:

```javascript
queryClient.setQueryData(['conversation-messages', convId], (old) => {
  if (!old?.pages?.length) return old;

  // Deduplicate — idempotent against re-delivery
  const exists = old.pages.some(page =>
    (page.items || []).some(m => m.id === actualMessage.id)
  );
  if (exists) return old;

  // Immutably append to the last page
  const newPages = [...old.pages];
  const lastPage = newPages[newPages.length - 1];
  newPages[newPages.length - 1] = {
    ...lastPage,
    items: [...(lastPage.items || []), actualMessage],
  };
  return { ...old, pages: newPages };
});
```

- **Cascade invalidation on `notification.created`:** A single server-emitted event simultaneously invalidates four query keys across both portals — provider bell badge, admin bell badge, admin notifications list, provider notifications list — cascading into a fully synchronised UI.
- **Leak-proof cleanup:** Every `socket.on()` subscription is captured in a `useEffect` return function, preventing the stale-listener memory-leak pattern that commonly plagues WebSocket integrations in React.

---

### 4. 🏗️ Vertical Slice / Feature-Scoped Architecture

Rather than organizing code by technical layer (`/components`, `/services`, `/utils`), the project adopts a **vertical slice** approach. Each feature module is a self-contained unit co-locating its page(s), custom hooks, and API calls:

```
features/
├── bookings/
│   ├── BookingsPage.jsx        ← view layer
│   ├── BookingDetailsPage.jsx  ← view layer
│   └── useBookingDetails.js    ← data layer (TanStack Query hook)
├── finance/
│   ├── FinanceOverviewPage.jsx
│   ├── ProviderWithdrawalsPage.jsx
│   └── hooks/
│       └── useFinanceOverview.js
└── provider-management/
    ├── ProviderManagementPage.jsx
    ├── useProviderManagement.js  ← 4 granular hooks (list, detail, create, patch)
    └── components/               ← feature-local sub-components
```

A developer navigating to `features/finance/` will find *everything* needed to understand, modify, or delete that feature — no cross-cutting concerns, no hidden dependencies in a global utilities folder.

**Both portals (`admin-dashboard/` and `owner-provider-dashboard/`) follow the exact same internal structure**, making context-switching between them cognitively trivial for any team member.

---

### 5. 🗺️ Interactive Geographic Service Zone Management

The Provider Dashboard includes a `ServiceZonesPage` built on **React Leaflet**, allowing providers to visually define and manage the geographic polygons that represent their operational coverage areas. This is a non-trivial data input and visualisation problem — rendered entirely client-side with Leaflet's drawing controls, with polygon data serialized to the backend via a standard REST mutation.

---

### 6. 📊 Drag-and-Drop Reordering & Data Visualisation

- **Recharts** powers the analytics and finance overview charts, rendering revenue trends, booking volume, and commission breakdowns as responsive SVG visualisations.
- **`@hello-pangea/dnd`** (the actively maintained fork of `react-beautiful-dnd`) enables drag-and-drop reordering in admin management views, providing a polished UX for ordering service categories and SKUs.

---

## 🚀 Feature Deep Dive

### 🛡️ Admin Portal (`/admin`)

- **📊 Dashboard Overview:** Real-time KPI cards (total bookings, revenue, provider count, customer count) powered by dedicated `useDashboardStats` and `useDashboardOverview` TanStack Query hooks.
- **📋 Bookings Management:** Full booking lifecycle view across 12 distinct status states (`PENDING`, `PENDING_PROVIDER_ACCEPTANCE`, `CONFIRMED`, `IN_PROGRESS`, `COMPLETED`, `EXPIRED`, `CANCELLED_BY_CUSTOMER`, `CANCELLED_BY_PROVIDER`, `REJECTED_BY_PROVIDER`, `PENDING_PAYMENT`, `PAYMENT_EXPIRED`, `NO_PROVIDERS_AVAILABLE`). Server-side paginated table (20 rows/page) with status pill filters. Click-through to a full booking detail page exposing parties, timeline, operational flags (`canPay`, `canCancel`, `slotHoldState`), and a granular financial breakdown — original amount → discount → customer payable → platform commission → provider gross → provider net — rendered in minor currency units (integer cents) for precision.
- **🏢 Provider Management:** The most architecturally complex feature. A single orchestrator page (~154 KB) drives the full provider lifecycle: applicant review, profile registration, member/technician management, service configuration and per-car-type pricing, geographic coverage zones, and weekly schedule management — composed from 4 granular TanStack Query hooks (`useProviderManagementList`, `useProviderManagementDetail`, `useCreateAdminProviderProfile`, `usePatchProviderManagement`).
- **👥 Customer Management:** Server-side paginated customer directory with individual profile and booking-history detail pages.
- **💰 Finance Module:** Finance overview charts, platform bank account management, provider payout method inspection, withdrawal request processing with an `ApproveWithdrawalModal`, and full withdrawal history tables.
- **🏷️ Deductions Engine:** Configuration and management of platform commission deduction rules with per-rule detail pages.
- **💸 Refund & Cancellation Requests:** Dedicated processing queues for customer-initiated refund and cancellation requests.
- **📂 Categories & Services:** Full CRUD for service categories and individual service SKUs, with drag-and-drop reordering via `@hello-pangea/dnd`.
- **🎫 Promotions:** Promo code creation and management. Applied codes are surfaced on booking detail financial breakdown cards with the discount amount clearly shown.
- **⭐ Reviews:** Aggregated customer review listing with individual detail drill-downs.
- **💬 Support Chat:** Real-time WebSocket-powered support chat with a conversation list sidebar, full message thread UI, and live unread-count badge on the topbar bell icon.
- **🔔 Notifications:** Admin notification center with real-time badge updates via `notification.created` socket events.
- **⚙️ Settings (Super-Admin only):** Full RBAC management — admin account management, role definitions, granular permission assignment, and a complete audit log — protected by `SuperAdminGuard`.

### 🚗 Provider Dashboard (`/provider`)

- **🏠 Dashboard Overview:** Provider-specific KPIs: pending bookings count, earnings summary, and recent activity feed.
- **📋 Bookings:** Incoming booking queue with multi-axis filtering (status pill tabs, date picker, text search). Status-aware action menus (Accept / Complete / Cancel). Mobile-first responsive design with a card view for small viewports and a data table for desktop.
- **👨‍🔧 Team Management:** Add, view, and manage technicians. A per-member `TeamMemberAnalyticsPage` displays individual performance metrics.
- **🗺️ Service Zones:** Interactive Leaflet map editor for drawing and editing geographic service coverage polygons.
- **🔧 Services & Pricing:** Manage subscribed platform services and configure per-car-type pricing matrices.
- **👛 Wallet:** Full earnings dashboard, withdrawal request submission, and payout history with status tracking.
- **📱 Profile & Onboarding:** Multi-step onboarding flow for newly registered providers to complete their company/individual profile before going live.
- **💬 Chat:** Provider-side real-time support chat sharing the same `useChatSocket` infrastructure as the admin portal.
- **🔔 Notifications:** Provider notification center with live WebSocket updates.
- **🌟 Reviews:** Provider's own customer review feed and star-rating aggregates.
- **🎫 Promotions:** Provider-scoped promotional offer management.

---

## 🗂️ Architecture & Directory Structure

```
dashboard-shineupapp/
├── .env.example                    # Env variable template (never committed with real values)
├── Dockerfile                      # Production multi-stage Docker build
├── nginx/                          # Nginx config: SPA routing + Socket.IO proxy
├── vite.config.js                  # Vite + React plugin configuration
│
└── src/
    ├── App.jsx                     # Root: GlobalErrorBoundary → BrowserRouter → AppRoutes
    ├── main.jsx                    # Entry: QueryClientProvider with global defaults
    │
    ├── shared/                     # Cross-portal reusable primitives
    │   ├── components/
    │   │   ├── ui/                 # Badge, Card, Modal, Pagination, StatCard,
    │   │   │                       # StatusBadge, Table, Toggle, PageSkeleton,
    │   │   │                       # GlobalErrorBoundary
    │   │   └── charts/             # Shared Recharts wrapper components
    │   └── utils/
    │       └── formatDate.js       # Locale-aware date formatter (Arabic/RTL)
    │
    ├── admin-dashboard/            # ADMIN PORTAL
    │   ├── api/
    │   │   ├── axiosClient.js      # Central Axios instance: auth interceptor,
    │   │   │                       # 401 auto-redirect, error message extractor
    │   │   └── endpoints/          # 15 API domain modules
    │   │       ├── bookings.api.js
    │   │       ├── finance.api.js
    │   │       ├── providerManagement.api.js
    │   │       └── ...
    │   ├── components/
    │   │   └── layout/             # DashboardLayout (sidebar, topbar, socket mount)
    │   ├── constants/              # Enum maps, status label dictionaries, color variants
    │   ├── features/               # 21 vertical slice modules
    │   │   ├── auth/               # Login, ForgotPassword, StaffActivation
    │   │   ├── bookings/           # BookingsPage, BookingDetailsPage, useBookingDetails
    │   │   ├── chat/               # useChatSocket (WebSocket bridge), AdminChatPage
    │   │   ├── finance/            # FinanceOverview, Withdrawals, BankAccounts
    │   │   ├── provider-management/# Full provider lifecycle (154 KB page + 4 hooks)
    │   │   ├── analytics/          # Platform analytics with Recharts
    │   │   ├── deductions/         # Commission deduction rule engine
    │   │   ├── promotions/         # Promo code management
    │   │   ├── settings/           # RBAC: admins, roles, permissions, audit log
    │   │   └── ...                 # + customers, reviews, categories, services,
    │   │                           #   notifications, cancellation/refund requests
    │   ├── hooks/
    │   │   ├── useAuth.js          # Auth state selector (reads from authStore)
    │   │   └── useAuthMutations.js # Login / logout mutations via React Hook Form
    │   ├── mocks/                  # 13 mock data modules (VITE_USE_MOCK_DATA gated)
    │   ├── routes/
    │   │   ├── AppRoutes.jsx       # All routes (admin + provider) with lazy() splits
    │   │   ├── ProtectedRoute.jsx  # Admin auth guard using React Router Outlet
    │   │   └── SuperAdminGuard.jsx # Role-based guard for the settings module
    │   ├── services/
    │   │   └── socket.service.js   # Socket.IO singleton: connect, emit, subscribe
    │   └── store/
    │       ├── authStore.js        # Zustand: admin session + localStorage persistence
    │       └── chatStore.js        # Zustand: active conversation + message append
    │
    ├── owner-provider-dashboard/   # PROVIDER PORTAL
    │   ├── api/                    # Provider-scoped Axios endpoints
    │   ├── components/
    │   │   └── layout/             # ProviderLayout (sidebar, topbar, socket mount)
    │   ├── constants/
    │   ├── features/               # 14 vertical slice modules
    │   │   ├── auth/               # ProviderLogin, Register, PendingApproval
    │   │   ├── bookings/           # ProviderBookingsPage + BookingDetails
    │   │   ├── wallet/             # WalletPage + useWallet (earnings + withdrawals)
    │   │   ├── service-zones/      # React Leaflet geographic zone editor
    │   │   ├── team/               # TeamPage + TeamMemberAnalyticsPage
    │   │   ├── profile/            # ProviderProfilePage + ProviderOnboardingPage
    │   │   ├── chat/               # ProviderChatPage (shares useChatSocket)
    │   │   └── ...                 # + services, reviews, promotions, notifications
    │   ├── hooks/
    │   │   ├── useProviderAuth.js
    │   │   └── useCarTypes.js
    │   ├── mocks/
    │   ├── routes/
    │   │   └── ProviderProtectedRoute.jsx
    │   └── store/
    │       └── providerAuthStore.js # Isolated Zustand store for provider session
    │
    └── pages/
        └── public/                 # Unauthenticated pages: legal, account deletion
```

### Key Architectural Decisions

| Decision | Rationale |
|---|---|
| **Two separate Zustand stores** (`authStore` vs `providerAuthStore`) | Prevents session bleed between portals that may be open simultaneously in different tabs |
| **Single `AppRoutes.jsx`** for both portals | Eliminates cross-portal navigation ambiguity; one authoritative routing source of truth |
| **`lazy()` + `Suspense` on every route** | Route-level code-splitting keeps the initial bundle minimal; each feature chunk loads on demand |
| **`GlobalErrorBoundary` at root** | Catches render-time errors anywhere in the tree and presents a graceful fallback |
| **Centralised `axiosClient.js`** | Request interceptor injects `Authorization: Bearer {token}` on every call; response interceptor auto-redirects on `401` without any component needing to handle it |
| **`VITE_USE_MOCK_DATA` feature flag** | All API calls branch behind a mock/real switch, enabling full offline development and live UI demos without a running backend |

---

## 🔒 Security & Engineering Best Practices

### Environment Variable Abstraction

Sensitive runtime values (`API base URL`, `WebSocket server URL`) are **never hardcoded**. They live exclusively in `.env.*` files using Vite's `VITE_` prefix convention. The committed `.env.example` documents every required variable without exposing real values:

```env
VITE_API_BASE_URL=/api/v1
VITE_SOCKET_URL=https://api-dev.example-company.tech
VITE_USE_MOCK_DATA=false
```

### Secure Mock Data Strategy

Mock data is gated behind a compile-time environment flag (`import.meta.env.VITE_USE_MOCK_DATA === 'true'`), which means:

1. **Zero mock data in production bundles** — mock modules are tree-shaken out entirely by Vite.
2. **Full UI development without a live backend** — a single `.env` variable switches modes.
3. **Deterministic test scenarios** — 13 mock data modules cover all 12 booking status variants for reliable UI state testing.

### Role-Based Access Control (RBAC)

- `ProtectedRoute` (admin) and `ProviderProtectedRoute` (provider) use React Router's Outlet pattern to guard entire route trees with a single authentication check.
- `SuperAdminGuard` adds a second guard layer for the Settings module, verifying `user.role === 'SUPER_ADMIN'` before rendering.
- The `axiosClient` response interceptor enforces server-side auth — any `401` clears `localStorage` and redirects to `/login`, preventing stale sessions from accessing protected data.

### Token Isolation

Admin and provider tokens are stored under **separate `localStorage` keys** (`auth_token` vs `provider_token`) and managed by completely isolated Zustand stores. The `useChatSocket` hook dynamically selects the correct token based on the current URL prefix (`/admin` vs `/provider`), preventing cross-portal authentication conflicts even when both portals are open simultaneously.

### Production Containerisation

The project ships with a production-ready `Dockerfile` and Nginx configuration:

- **Multi-stage Docker build:** A dedicated build stage compiles the Vite SPA; a lean Nginx serve stage delivers it — keeping the final image minimal.
- **SPA routing:** Nginx's `try_files $uri /index.html` directive prevents 404s on hard-refresh or direct URL access.
- **WebSocket proxy:** Nginx forwards `/socket.io/` to the backend with correct `Upgrade` and `Connection` headers, enabling transparent WebSocket tunnelling through the same domain.

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) >= 18.x
- npm >= 9.x (bundled with Node.js)

### Installation

**1. Clone the repository**

```bash
git clone https://github.com/your-username/dashboard-shineupapp.git
cd dashboard-shineupapp
```

**2. Install dependencies**

```bash
npm install
```

**3. Configure environment variables**

```bash
cp .env.example .env
```

Then edit `.env` with your actual values:

```env
# URL of your backend REST API (use /api/v1 if running behind the Nginx proxy)
VITE_API_BASE_URL=http://localhost:3000/api/v1

# URL of your Socket.IO server for real-time chat & notifications
VITE_SOCKET_URL=http://localhost:3000

# Set to 'true' to run entirely on mock data — no backend required
VITE_USE_MOCK_DATA=false
```

> **Tip:** Set `VITE_USE_MOCK_DATA=true` to explore the complete UI without any backend dependency.

**4. Start the development server**

```bash
npm run dev
```

The application will be available at `http://localhost:5173`.

| Route | Portal |
|---|---|
| `/login` | Admin login |
| `/admin` | Admin dashboard (authentication required) |
| `/provider/login` | Provider login |
| `/provider` | Provider dashboard (authentication required) |

### Production Build

```bash
npm run build
```

Output is written to `dist/`. Pair it with the included `Dockerfile` and Nginx configuration for a production-ready, containerised deployment.

---

## 📸 Screenshots & Demo

> **Note for maintainer:** Replace the placeholders below with your actual screenshots and demo video link.

### Admin Portal

**Dashboard Overview**

<img width="1920" height="1035" alt="image" src="https://github.com/user-attachments/assets/2439ae31-1bf1-4799-a4f8-c11c6ac41fe1" />


**Bookings Management — Paginated Table with Status Filters**

`[IMAGE_PLACEHOLDER: /screenshots/admin-bookings-table.png]`

**Booking Detail — Full Financial Breakdown**

`[IMAGE_PLACEHOLDER: /screenshots/admin-booking-detail-finance.png]`

**Provider Management — Full Lifecycle Orchestration**

`[IMAGE_PLACEHOLDER: /screenshots/admin-provider-management.png]`

**Finance Overview & Withdrawal Processing**

`[IMAGE_PLACEHOLDER: /screenshots/admin-finance-overview.png]`

**Real-Time Support Chat**

`[IMAGE_PLACEHOLDER: /screenshots/admin-chat.png]`

---

### Provider Dashboard

**Dashboard Overview**

`[IMAGE_PLACEHOLDER: /screenshots/provider-dashboard.png]`

**Bookings Queue with Multi-Axis Filtering**

`[IMAGE_PLACEHOLDER: /screenshots/provider-bookings.png]`

**Service Zone Editor — Interactive Leaflet Map**

`[IMAGE_PLACEHOLDER: /screenshots/provider-service-zones.png]`

**Wallet & Earnings**

`[IMAGE_PLACEHOLDER: /screenshots/provider-wallet.png]`

---

### 🎬 Full Product Demo

`[VIDEO_LINK_PLACEHOLDER: https://www.youtube.com/watch?v=your-demo-video-id]`

> A narrated walkthrough covering the booking lifecycle end-to-end: customer request → provider acceptance → real-time status transitions → financial settlement → admin withdrawal approval.

---

## 📄 License

This project was developed as a **client deliverable** and is included in this portfolio with the client's permission. All business logic, data, and brand assets belong to the client. The codebase architecture and implementation patterns are the work of the developer.

---

<div align="center">

**Built with precision, designed for scale.**

*If this project demonstrates the caliber of engineering you are looking for, feel free to [connect on LinkedIn](#) or [view more of my work](#).*

</div>
