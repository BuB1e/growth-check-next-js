# Feature Specification: GrowthCheck Webapp

**Feature Branch**: `001-growth-check-webapp`
**Created**: 2026-02-17
**Status**: Draft
**Input**: User description: "Build the frontend web application for GrowthCheck using Next.js. The application should: Provide authentication UI. Render different dashboards based on user roles (Staff, Head, Admin). Provide data tables, modals, and role-based navigation. Mobile-first for Staff. API-driven."

## User Scenarios & Testing _(mandatory)_

> **Constitution Reminder**: Any scenario involving the **Staff** role MUST be verifiable on a mobile viewport. Design accordingly.

### User Story 1 - Staff Growth Recording (Priority: P1)

Staff members need to easily find a child in their care and record new growth measurements (height/weight) while on-site, often using a mobile device.

**Why this priority**: Core value proposition of the system. Without data entry, there is no growth monitoring.
**Independent Test**: Can be tested by logging in as Staff, finding a child, adding a measurement, and verifying the update in the child's profile.

**Acceptance Scenarios**:

1.  **Given** a Staff user is logged in on a mobile device, **When** they access the Child List, **Then** they see a searchable, filterable list of children optimized for touch (large rows/cards).
2.  **Given** a Staff user viewing a Child Profile, **When** they click "Add Measurement", **Then** a mobile-friendly form appears asking for Height, Weight, and Date.
3.  **Given** valid measurement data, **When** the Staff submits the form, **Then** the data is saved via API and the UI updates to show the new record.

---

### User Story 2 - Admin User & Request Management (Priority: P1)

Admins need to manage user accounts and approve new registration requests to ensure system security and proper team assignment.

**Why this priority**: Critical for system administration and onboarding new users.
**Independent Test**: Can be tested by logging in as Admin, viewing pending requests, and approving one.

**Acceptance Scenarios**:

1.  **Given** an Admin user on desktop, **When** they view the User Management page, **Then** they see a table of users (Staff/Head) with status and role.
2.  **Given** a pending registration request, **When** the Admin clicks "Approve", **Then** a modal appears confirming the action.
3.  **Given** a pending request, **When** the Admin clicks "Reject", **Then** a modal appears requiring a rejection reason before submission.

---

### User Story 3 - Head Area Monitoring (Priority: P2)

Heads need to monitor aggregated growth statistics for their assigned area to identify trends and issues.

**Why this priority**: Provides high-level visibility and reporting value.
**Independent Test**: Can be tested by logging in as Head and verifying the dashboard loads correct statistical data.

**Acceptance Scenarios**:

1.  **Given** a Head user on desktop, **When** they log in, **Then** they are redirected to the Area Dashboard.
2.  **Given** the dashboard is loaded, **When** viewing the main overview, **Then** they see aggregated statistics (e.g., total children, malnutrition rates) derived from API data.

---

### User Story 4 - Authentication & Routing (Priority: P0)

Users need to securely log in and be directed to the correct interface based on their role.

**Why this priority**: Foundational requirement for all other stories.
**Independent Test**: Can be tested by logging in with different credentials and verifying redirection targets.

**Acceptance Scenarios**:

1.  **Given** an unauthenticated user, **When** they visit any protected route, **Then** they are redirected to the Login page.
2.  **Given** a valid login, **When** the user is a Staff, **Then** they are redirected to the Child List.
3.  **Given** a valid login, **When** the user is a Head, **Then** they are redirected to the Area Dashboard.
4.  **Given** a valid login, **When** the user is an Admin, **Then** they are redirected to the Admin Dashboard.

## Clarifications

### Session 2026-02-17

- Q: Authentication Flow? → A: Hybrid (Email/Password + Google OAuth).
- Q: API Definition Strategy? → A: Defer to Implementation Plan (High-level Entities in Spec).
- Q: Table Pagination? → A: Server-Side (API handles filtering/paging).
- Q: Rejection Validation? → A: Dropdown (Reason Category) + Optional Text Detail.

### Edge Cases

- **Network Failure**: If the API is unreachable during a measurement submission, the user MUST be notified with a distinct error message and the data should NOT be lost if possible (form remains filled).
- **Session Timeout**: If a user's session expires while they are filling out a form, they MUST be prompted to re-login without losing their current input context if technically feasible, or at least warned.
- **Invalid Data**: If a user enters impossible growth values (e.g., negative weight), the system MUST block submission and highlight the specific field with a helpful error message.
- **Concurrent Access**: If an Admin tries to approve a request that has already been processed by another Admin, they MUST see an error message indicating the current status.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST provide a Login page supporting **Email/Password and Google OAuth**.
- **FR-002**: System MUST support a Register page for new users to request access (via email) or link Google accounts.
- **FR-003**: System MUST enforce Role-Based Access Control (RBAC) on client-side routes (protect Admin routes from Staff, etc.).
- **FR-004**: Staff Child List MUST support **server-side** text search (name) and filtering (age, status).
- **FR-005**: Admin Request View MUST allow approving or rejecting requests via a modal dialog.
- **FR-006**: Rejection actions MUST require selecting a **Reason Category** and supporting **Optional Text**.
- **FR-007**: Frontend MUST communicate exclusively via REST API (no direct DB access).
- **FR-008**: System MUST support a `USE_MOCK_DATA=true` environment variable to switch between real API and mock data services.
- **FR-009**: Detailed API contracts (endpoints, schemas) are deferred to the Implementation Plan; Spec defines data requirements via Entities.

### Key Entities

- **User**: ID, Name, Role (Admin/Head/Staff), Team/Location.
- **Child**: ID, Name, Birthdate, Gender, LocationID.
- **Measurement**: ChildID, Height, Weight, Date.
- **Request**: ID, Type (UserRegistration/LocationCreation), Status, RequesterID.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Staff Users can locate a specific child record within 15 seconds using search/filter on a mobile device.
- **SC-002**: Admin Users can process (approve/reject) a pending request in under 3 clicks.
- **SC-003**: Dashboard pages load time (First Contentful Paint) is under 1.5 seconds on 4G networks.
- **SC-004**: Application achieves a Lighthouse Accessibility score of >90.
- **SC-005**: All Staff interfaces render correctly (no horizontal scroll, clickable targets >44px) on viewports as small as 375px width.
