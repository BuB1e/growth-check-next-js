# Research & Technical Decisions: GrowthCheck Webapp

**Feature**: `001-growth-check-webapp`
**Date**: 2026-02-17

## 1. UI Framework: ShadCN vs. Ionic

**Context**: The user requested "ShadCN for desktop" and "Ionic for mobile (if ShadCN not compatible)".
**Analysis**:

- **ShadCN/UI**: Built on Radix UI and Tailwind. Highly customizable, accessible, and lightweight. Excellent for responsive web apps. Components like `Drawer` are mobile-native replacements for `Dialog`.
- **Ionic**: Powerful for "Hybrid" apps (Capacitor/Cordova) simulating native iOS/Android look-and-feel. Heavy styling overrides, uses Web Components which can conflict with React Server Components (RSC) patterns in Next.js App Router if not carefully managed.
- **Compatibility**: ShadCN is fully compatible with mobile web. Tailwind's usage makes "mobile-first" styling trivial.

**Decision**: **Use ShadCN (Tailwind) exclusively.**
**Rationale**:

- **Consistency**: A single design system reduces maintenance and cognitive load.
- **Performance**: Better RSC support and smaller bundle size than loading Ionic's massive component suite.
- **Recommendation**: Use ShadCN's `Drawer` component for mobile modals and standard `Dialog` for desktop. Use Tailwind primitives for grid/flex layouts.
- **Rejection**: Ionic is rejected as "overkill" for a web-only dashboard, introducing unnecessary complexity.

## 2. Authentication: BetterAuth

**Context**: Requirement to use BetterAuth for Hybrid (Email + Google) auth.
**Implementation Strategy**:

- **Backend (API)**: BetterAuth handles session management and OAuth callbacks.
- **Frontend**:
  - Middleware: Protect `/admin/*`, `/head/*`, `/staff/*` routes based on session role.
  - Client: `useSession` hook for UI conditional rendering.
  - Pages: Custom Login/Register pages using BetterAuth client SDK.

## 3. Data Fetching & State

**Context**: "API-driven architecture" and "Server-Side Pagination".
**Decision**: **TanStack Query (React Query)**
**Rationale**:

- Handles server-side pagination, caching, and background re-validation out of the box.
- Robust `useInfiniteQuery` for mobile "load more" lists (User Story 1).
- De-couples UI from fetch logic.

## 4. Mobile-First Staff Layout

**Decision**: **Bottom Navigation Bar** for Staff mobile view.
**Rationale**:

- Accessibility: Thumb-friendly navigation.
- Constitution Compliance: "Mobile-First Staff".
- Admin/Head views will use a **Sidebar** (responsive collapsible) as they are desktop-first.

## 5. Mock Data Strategy

**Decision**: **API Route Handlers (Next.js)** acts as a BFF / Mock server.

- If `USE_MOCK_DATA=true`, Next.js API Routes return JSON fixtures.
- If `false`, they proxy to the real backend or the frontend calls the real backend directly.
- _Refinement_: Frontend calls Next.js API Routes (BFF pattern) to keep secrets secure and handle mock switching transparently.
