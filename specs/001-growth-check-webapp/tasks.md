---
description: "Task list for GrowthCheck Webapp implementation"
---

# Tasks: GrowthCheck Webapp

**Input**: Design documents from `specs/001-growth-check-webapp/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Organization**: Tasks are grouped by phase and user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel
- **[Story]**: US1 (Staff), US2 (Admin), US3 (Head), US4 (Auth)

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Initialize Next.js 15 project with TypeScript, Tailwind, ESLint
- [ ] T002 [P] Install and configure ShadCN UI (Button, Input, Table, Dialog, Drawer, etc.)
- [ ] T003 [P] Configure TanStack Query (React Query) provider and devtools
- [ ] T004 [P] Setup Lucide React for icons
- [ ] T005 Create `lib/api-client.ts` (Axios) with base URL and error interceptors
- [ ] T006 Setup `USE_MOCK_DATA` environment variable and Mock API Route handlers base

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core auth and layout infrastructure

- [ ] T007 [P] Create `components/layouts/AdminLayout.tsx` (Sidebar + Header)
- [ ] T008 [P] Create `components/layouts/HeadLayout.tsx` (Sidebar + Header)
- [ ] T009 [P] Create `components/layouts/StaffLayout.tsx` (Bottom Navigation + Header for Mobile)
- [ ] T010 [P] Create `components/shared/RoleGuard.tsx` for client-side protection
- [ ] T011 [US4] Configure BetterAuth (Email + Google) in `lib/auth.ts`
- [ ] T012 [US4] Create Next.js Middleware for Role-Based Access Control (Redirect /admin for Staff)

**Checkpoint**: App shell and Auth ready.

---

## Phase 3: User Story 4 - Authentication (Priority: P0)

**Goal**: Login and Register pages working with redirects.

- [ ] T013 [US4] Implement `app/(auth)/login/page.tsx` with BetterAuth hooks
- [ ] T014 [US4] Implement `app/(auth)/register/page.tsx`
- [ ] T015 [US4] Verify redirects after login based on role (Staff -> /staff, etc.)

---

## Phase 4: User Story 1 - Staff Growth Recording (Priority: P1)

**Goal**: Mobile-optimized child list and measurement entry.
**Constraint**: Mobile-First (Touch targets > 44px).

- [ ] T016 [US1] Create `components/features/staff/ChildList.tsx` (Cards view for mobile)
- [ ] T017 [US1] Implement Server-Side Pagination & Search in `ChildList`
- [ ] T018 [US1] Create `components/features/staff/MeasurementDrawer.tsx` (ShadCN Drawer)
- [ ] T019 [US1] Connect Measurement Form to API (`POST /children/{id}/measurements`)
- [ ] T020 [US1] Verify "Add Measurement" flow on mobile viewport

---

## Phase 5: User Story 2 - Admin Management (Priority: P1)

**Goal**: User management and request approval.

- [ ] T021 [US2] Create `components/features/admin/UserTable.tsx` (ShadCN Table)
- [ ] T022 [US2] Create `components/features/admin/RequestTable.tsx` with Approve/Reject actions
- [ ] T023 [US2] Implement `RejectModal.tsx` with Reason dropdown and text area
- [ ] T024 [US2] Connect Approve/Reject actions to API

---

## Phase 6: User Story 3 - Head Dashboard (Priority: P2)

**Goal**: Aggregated statistics view.

- [ ] T025 [US3] Create `components/features/head/StatsOverview.tsx`
- [ ] T026 [US3] Connect Stats to API (`GET /admin/stats`)
- [ ] T027 [US3] Create Area Child List view (similar to Admin but read-only)

---

## Phase 7: Polish & Verification

**Purpose**: Final quality checks.

- [ ] T028 [P] Verify Staff Mobile Responsiveness (Touch targets, layout check)
- [ ] T029 Run E2E Smoke Tests (Login flow)
- [ ] T030 Final Accessibility Audit (Lighthouse)
