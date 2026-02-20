# Data Model: GrowthCheck Webapp

**Feature**: `001-growth-check-webapp`
**Source Reference**: `docs/DBDIAGRAM.md`

## Entities

### User (Staff, Head, Admin)

- **ID**: UUID (PK)
- **Email**: String (Unique)
- **FirstName**: String
- **LastName**: String
- **Role**: Enum (Admin, Head, Staff)
- **TeamID**: Integer (FK -> Team) - _Nullable for Admin_
- **Status**: Boolean (DeleteStatus)

### Child

- **ID**: Integer (PK)
- **FirstName**: String
- **LastName**: String
- **BirthDate**: Date
- **Gender**: Enum (Male, Female)
- **LocationID**: Integer (FK -> Location)
- **Status**: Enum (In_Area, Out_Area, Unknown, Died)

### Measurement (ChildData)

- **ID**: Integer (PK)
- **ChildID**: Integer (FK -> Child)
- **Height**: Float
- **Weight**: Float
- **Date**: DateTime (WeightDate/HeightDate)
- **RecordedBy**: UUID (FK -> User)

### Requests (Polymorphic View)

#### UserRegistrationRequest

- **ID**: UUID (PK)
- **UserID**: UUID (FK -> User)
- **Status**: Enum (Approve, Reject, Waiting)
- **RejectReason**: String (Nullable)
- **UpdatedAt**: DateTime

#### LocationCreationRequest

- **ID**: Integer (PK)
- **UserID**: UUID (FK -> User)
- **LocationName**: String
- **Status**: Enum (Approve, Reject, Waiting)

## Value Objects / Enums

### UserRole

- `ADMIN`: Global access.
- `HEAD`: Area-level access (Dashboard).
- `STAFF`: Operational access (Child List, Measurements).

### RequestStatus

- `WAITING`: Pending Admin review.
- `APPROVE`: Request granted.
- `REJECT`: Request denied (requires reason).

## Validation Rules

1.  **Measurement**: Height and Weight must be positive values.
2.  **User**: Email must be valid format.
3.  **Request**: Reject action requires `RejectReason` (Min 10 chars).
