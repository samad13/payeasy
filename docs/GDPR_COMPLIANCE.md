# GDPR Compliance Documentation

This document outlines the GDPR compliance features integrated into the PayEasy platform. These features respect users' rights to access, export, manage, and erase their personal data while maintaining necessary audit trails to prove compliance.

## 1. Compliance Features

### 1.1 Data Export (Right to Access)
- **Endpoint**: `GET /api/users/export?format=json|csv`
- **Behavior**: Aggregates a user's entire data footprint across the database. This includes their profile, listings, payment records, messages, rent agreements, favorites, and consent records.
- **Authentication**: Required. Users can only export their own data.
- **Formats**: Available in both `application/json` (default) and `text/csv`.
- **Compliance Note**: An incomplete export represents a GDPR violation. This endpoint is designed to exhaustively query all tables linked to the user.

### 1.2 Account Deletion (Right to Erasure)
- **Endpoint**: `DELETE /api/users/delete`
- **Behavior**: Executes exhaustive cascading deletes across all tables associated with the user, ensuring no orphaned personal data remains. This includes `messages`, `conversations`, `payment_records`, `listings`, `user_favorites`, and `rent_agreements`.
- **Authentication**: Required.
- **Confirmation**: An email is fired asynchronously upon a successful deletion using the existing `sendEmail` infrastructure.
- **Compliance Note**: Hard deletes are legally required here. The only data retained post-deletion is the immutable audit log entry proving that we complied with the deletion request.

### 1.3 Consent Management
- **Endpoints**:
  - `GET /api/users/consent` - Retrieve history of consents given.
  - `POST /api/users/consent` - Record new consent.
  - `DELETE /api/users/consent` - Withdraw consent.
- **Schema**: 
  - `consent_records`: Tracks `user_id`, `consent_type`, `version`, `ip_address`, and `created_at`.
- **Behavior**: Withdrawal does not delete historical records. Instead, it appends a new record with `version = "withdrawn"`.
- **Compliance Note**: Consent must be granular, versioned, and easily retractable.

### 1.4 Audit Logging
- **Schema**: 
  - `audit_logs`: Tracks `user_id`, `action_type`, `outcome`, `details (JSONB)`, and `created_at`.
- **Immutability**: Guaranteed at the PostgreSQL database level using a `BEFORE UPDATE OR DELETE` trigger that raises an exception preventing alteration or deletion of any log.
- **Behavior**: Hooked into all sensitive actions (`EXPORT_DATA`, `DELETE_ACCOUNT`, `RECORD_CONSENT`, `WITHDRAW_CONSENT`).

### 1.5 Privacy Policy
- **Location**: `apps/web/pages/privacy.tsx`
- **Behavior**: A publicly accessible page dictating our data collection, handling, and erasure policies, written in clear, concise language.

## 2. Infrastructure Considerations

- **Response Times**: The export endpoint handles multiple queries via `Promise.all` to limit response time. Deletion employs batched queries using indexed columns (`sender_id`, `tenant_id`, `user_id`, `landlord_id`), ensuring completion under standard web timeouts.
- **Database Triggers**: Look at `supabase/migrations/005_gdpr_compliance.sql` for the immutable audit log setup.

## 3. Testing
Comprehensive unit testing resides adjacent to the API route files (`route.test.ts`), covering:
- Mocking the Supabase client and testing cascading deletes.
- Checking that audit logs are generated.
- Ensuring formatting for the export functions appropriately models the user data structure.
