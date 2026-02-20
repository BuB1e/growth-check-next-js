# Implementation Plan: GrowthCheck Webapp

**Branch**: `001-growth-check-webapp` | **Date**: 2026-02-17 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `specs/001-growth-check-webapp/spec.md`

## Summary

Build the GrowthCheck frontend application using Next.js App Router. This feature includes role-based dashboards (Admin, Head, Staff), authentication via BetterAuth (Hybrid), and a mobile-first interface for Staff members.

## Technical Context

**Language/Version**: TypeScript 5.x, Node 20+
**Framework**: Next.js 15 (App Router)
**Styling**: Tailwind CSS + ShadCN UI (Radix)
**State/Fetch**: TanStack Query (React Query)
**Auth**: BetterAuth (Email + Google)
**Icons**: Lucide React
**Testing**: Playwright (E2E), Vitest (Unit)
**Target Platform**: Responsive Web (Mobile-First for Staff)

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

- [x] **Role-Based Clarity**: Layouts and Middleware will strictly separate `/admin`, `/head`, and `/staff` routes.
- [x] **Staff Mobile-First**: Staff views use `Drawer` for forms and large tap targets for lists.
- [x] **API-Driven**: All data fetching happens via `lib/api-client` (Axios/Fetch) calling the backend; no direct DB.

## Project Structure

### Documentation (this feature)

```text
specs/001-growth-check-webapp/
├── plan.md              # This file
├── research.md          # Tech decisions (ShadCN vs Ionic)
├── data-model.md        # Entity definitions
├── contracts/           # OpenAPI specs
│   └── api.yaml
└── checklists/          # Quality checks
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── (auth)/          # Login/Register routes
│   ├── (dashboard)/     # Protected dashboard layouts
│   │   ├── admin/       # Admin-only pages
│   │   ├── head/        # Head-only pages
│   │   └── staff/       # Staff-only pages (Mobile optimized)
│   └── api/             # BFF / Mock handlers
├── components/
│   ├── ui/              # ShadCN primitives
│   ├── shared/          # Reusable domain components (UserTable, ChildCard)
│   └── layouts/         # Role-specific sidebars/navbars
├── lib/
│   ├── auth.ts          # BetterAuth config
│   └── api.ts           # Axios instance & React Query hooks
└── types/               # TypeScript interfaces (from data-model)
```

## Complexity Tracking

| Violation                | Why Needed             | Simpler Alternative Rejected Because                           |
| ------------------------ | ---------------------- | -------------------------------------------------------------- |
| Next.js API Routes (BFF) | Mock Data Switching    | Pure client-side mocking is harder to maintain securely later. |
| TanStack Query           | Server-side Pagination | `useEffect` fetching is brittle for complex paginated lists.   |

## Verification Plan

### Automated Tests

- **Lint**: `npm run lint` (ESLint/Prettier)
- **Unit**: `npm run test` (Vitest) for utility functions and complex form validation.
- **E2E**: `npx playwright test` for critical flows (Login -> Redirect -> Dashboard).

### Manual Verification

- **Staff Mobile Check**: Open Chrome DevTools -> Device Toolbar -> iPhone SE.
  - Verify "Add Measurement" drawer opens fully.
  - Verify list items are clickable (height > 44px).
- **Admin Approval**: Login as Admin, approve a request, verify API call payload.
- **Role Guard**: Try accessing `/admin` as Staff user -> Verify redirect to `/staff`.
