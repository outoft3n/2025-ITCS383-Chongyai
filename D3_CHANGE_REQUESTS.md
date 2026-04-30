# D3: Change Request Analysis

**Project:** Job Center Management System  
**Group:** Chongyai (Maintainer)  
**Product Owner:** JianCha  

## Features Overview

| Feature | Description |
|---------|-------------|
| Feature 1 | **Mobile Client App** — Native Android app (Flutter) replicating all web functionalities |
| Feature 2 | **Applicant Search & Invitation System** — Recruiters search/filter applicants and send job invitations |
| Feature 3 | **Job Recommendation System** — System recommends similar jobs after applicant views a job |

---

## Change Requests

### CR-1: Search returns no results when query contains special characters

| Attribute | Description |
|-----------|-------------|
| **Associated Feature** | Feature 2 — Applicant Search & Invitation System |
| **Description** | When a recruiter searches for applicants using queries that contain special characters such as `%`, `&`, `@`, or `+`, the search returns no results or throws an unhandled error. These characters are not properly sanitized or escaped before being passed to the Prisma query, causing the `contains` filter to behave incorrectly. |
| **Maintenance Type** | Corrective |
| **Priority** | High |
| **Severity** | Critical |
| **Time to Implement** | 0.5 person-weeks |
| **Verification Method** | Testing — unit tests with special character inputs to verify correct filtering behavior |

---

### CR-2: Invitation status does not update in real-time on the recruiter's sent list

| Attribute | Description |
|-----------|-------------|
| **Associated Feature** | Feature 2 — Applicant Search & Invitation System |
| **Description** | After an applicant accepts or rejects an invitation, the recruiter's "Sent Invitations" page still shows the old status (PENDING) until the page is manually refreshed. The frontend `useInvitations` hook does not re-fetch data after a status change event, causing stale data to be displayed. |
| **Maintenance Type** | Corrective |
| **Priority** | Medium |
| **Severity** | Major |
| **Time to Implement** | 0.5 person-weeks |
| **Verification Method** | Testing — verify UI updates after status change without manual refresh; integration test on hook re-fetch logic |

---

### CR-3: Add native Android mobile client platform

| Attribute | Description |
|-----------|-------------|
| **Associated Feature** | Feature 1 — Mobile Client App |
| **Description** | A new native Android client must be built using Flutter to replicate all user-facing functionalities of the existing Next.js web application, including authentication, job browsing, applications, bookmarks, interviews, chat, invitations, and recommendations. The mobile app communicates with the existing backend API. A new repository is created for the mobile app, and the link is added to the main repository's README.md. |
| **Maintenance Type** | Adaptive |
| **Priority** | High |
| **Severity** | Critical |
| **Time to Implement** | 3 person-weeks |
| **Verification Method** | Testing and inspection — manual testing on Android emulator/device, API integration tests, and code review |

---

### CR-4: Configure backend CORS and API to support mobile client

| Attribute | Description |
|-----------|-------------|
| **Associated Feature** | Feature 1 — Mobile Client App |
| **Description** | The existing backend Express.js server needs to be updated to accept API requests from the mobile client. This includes updating CORS configuration to allow requests from mobile origins, ensuring JWT token-based authentication works correctly with mobile HTTP clients (no cookies), and verifying that all API response formats are compatible with the Flutter HTTP/Dio client. |
| **Maintenance Type** | Adaptive |
| **Priority** | High |
| **Severity** | Major |
| **Time to Implement** | 0.5 person-weeks |
| **Verification Method** | Testing — verify mobile client can successfully call all endpoints; automated API tests from a non-browser client |

---

### CR-5: Implement job recommendation display on job detail page

| Attribute | Description |
|-----------|-------------|
| **Associated Feature** | Feature 3 — Job Recommendation System |
| **Description** | When an applicant views a job detail page, the system should display a "Similar Jobs" section below the job description. This section calls the `/recommendations/similar/:jobId` endpoint and renders up to 5 recommended jobs based on matching skills and job type. The section must appear on both web (`/dashboard/applicant/jobs/[id]`) and mobile (`job_detail_screen.dart`) platforms. |
| **Maintenance Type** | Perfective |
| **Priority** | Medium |
| **Severity** | Minor |
| **Time to Implement** | 1 person-week |
| **Verification Method** | Testing — verify recommendations appear correctly; unit test for recommendation hook/provider |

---

### CR-6: Improve applicant search with relevance scoring and result sorting

| Attribute | Description |
|-----------|-------------|
| **Associated Feature** | Feature 2 — Applicant Search & Invitation System |
| **Description** | The current `/search/applicants` endpoint returns results sorted only by `createdAt`. Recruiters need the ability to sort results by relevance (number of matching skills), by name, or by experience. A `sortBy` query parameter should be added to support `relevance`, `name`, and `newest` options. When sorted by relevance, applicants with more matching skills should appear first. |
| **Maintenance Type** | Perfective |
| **Priority** | Medium |
| **Severity** | Minor |
| **Time to Implement** | 1 person-week |
| **Verification Method** | Testing — verify sort order with different `sortBy` values; unit tests for sorting logic |

---

### CR-7: Refactor route handlers to extract business logic into service layer

| Attribute | Description |
|-----------|-------------|
| **Associated Feature** | All Features (General) |
| **Description** | Currently, all business logic (database queries, validation, scoring) is implemented directly inside Express route handlers. This makes unit testing difficult and increases coupling. Business logic should be extracted into separate service files (e.g., `search.service.ts`, `invitation.service.ts`, `recommendation.service.ts`) so that route handlers only handle HTTP request/response concerns. This refactoring does not change any external behavior but improves testability and maintainability. |
| **Maintenance Type** | Preventive |
| **Priority** | Low |
| **Severity** | Minor |
| **Time to Implement** | 1.5 person-weeks |
| **Verification Method** | Inspection and testing — code review to verify separation; all existing tests must still pass after refactoring |

---

### CR-8: Add comprehensive input validation for invitation and recommendation endpoints

| Attribute | Description |
|-----------|-------------|
| **Associated Feature** | Feature 2 & Feature 3 |
| **Description** | The recommendation endpoints (`/recommendations/` and `/recommendations/similar/:jobId`) currently have no input validation middleware. The `jobId` parameter is not validated as a proper CUID before being used in a database query, which could lead to unhandled Prisma errors. Similarly, the search applicant endpoint does not validate that `page` and `limit` are valid numbers (non-NaN). Zod validation schemas should be added to these endpoints, consistent with the pattern already used in `invitations.routes.ts`. |
| **Maintenance Type** | Preventive |
| **Priority** | Medium |
| **Severity** | Major |
| **Time to Implement** | 0.5 person-weeks |
| **Verification Method** | Testing — unit tests with invalid inputs (empty strings, SQL injection attempts, NaN values) to verify proper error responses |

---

## Summary Table

| CR | Associated Feature | Type | Priority | Severity |
|----|-------------------|------|----------|----------|
| CR-1 | Feature 2 — Search & Invitation | Corrective | High | Critical |
| CR-2 | Feature 2 — Search & Invitation | Corrective | Medium | Major |
| CR-3 | Feature 1 — Mobile Client App | Adaptive | High | Critical |
| CR-4 | Feature 1 — Mobile Client App | Adaptive | High | Major |
| CR-5 | Feature 3 — Job Recommendation | Perfective | Medium | Minor |
| CR-6 | Feature 2 — Search & Invitation | Perfective | Medium | Minor |
| CR-7 | All Features | Preventive | Low | Minor |
| CR-8 | Feature 2 & Feature 3 | Preventive | Medium | Major |
