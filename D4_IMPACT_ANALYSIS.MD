# D4: Impact Analysis

### Requirements
- R1: Special Character Handling in Job Search
- R2: Fix Publish Announcement Frontend Payload Mismatch
- R3: Flutter Mobile Application — Core Features
- R4: Flutter Mobile Application — Placeholder Screens
- R5: Applicant Search & Invitation System
- R6: Similar Jobs Section on Job Detail Page
- R7: Backend Test Coverage Expansion
- R8: CI/CD Pipeline & SonarQube Quality Gate
### Design
- D1: Web Frontend (Next.js)
- D2: Backend (Express — includes all REST API routes)
- D3: Chatbot Service
- D4: Identity Verification Service
- D5: Internal Conference Service
- D6: Database (PostgreSQL)
- D7: Mobile Frontend (Flutter)
### Code Modules
- C1: Auth Module (`auth.routes.ts` + `auth.middleware.ts`)
- C2: Users Module (`users.routes.ts`)
- C3: Jobs Module (`jobs.routes.ts`)
- C4: Applications Module (`applications.routes.ts`)
- C5: Search Module (`search.routes.ts`)
- C6: Bookmarks Module (`bookmarks.routes.ts`)
- C7: Interviews Module (`interviews.routes.ts`)
- C8: Payments Module (`payments.routes.ts`)
- C9: Chat Module (`chat.routes.ts`)
- C10: Conference Module (`conference.routes.ts`)
- C11: Verifications Module (`verifications.routes.ts`)
- C12: Reports Module (`reports.routes.ts`)
- C13: Recommendations Module (`recommendations.routes.ts`)
- C14: Invitations Module (`invitations.routes.ts`)
- C15: Web Application Code (Next.js frontend)
- C16: Mobile Application Code (Flutter)

### Tests
- T1: Auth Route Tests (`auth.routes.test.ts`)
- T2: Jobs Route Tests (`jobs.routes.test.ts`)
- T3: Search Route Tests (`search.routes.test.ts`)
- T4: Applications Route Tests (`applications.routes.test.ts`)
- T5: Integration Route Tests (`additional-routes.test.ts` — covers Bookmarks, Reports, Verifications, Recommendations, Payments, Conference, Users, Interviews, Chat)
- T6: Library Tests (`jwt.test.ts`, `password.test.ts`, `response.test.ts`)
- T7: Middleware Tests (`auth.middleware.test.ts`, `error.middleware.test.ts`, `validate.middleware.test.ts`)
- T8: Web Frontend Tests (hooks: `useAuth`, `useApplications`, `useBookmarks`, `useChat`, `useJobs`; components; context; lib)
- T9: Mobile Tests (`application_model_test.dart`, `invitation_model_test.dart`, `job_model_test.dart`, `user_model_test.dart`, `widget_test.dart`)

---

## Traceability Graph (Full)

```mermaid
graph LR

subgraph Requirements
R1[R1: Special Char Search Fix]
R2[R2: Publish Announcement Fix]
R3[R3: Mobile App - Core]
R4[R4: Mobile App - Placeholders]
R5[R5: Applicant Search & Invitation]
R6[R6: Similar Jobs]
R7[R7: Backend Test Coverage]
R8[R8: CI/CD & Quality Gate]
end

subgraph Design
D1[D1: Web Frontend]
D2[D2: Backend]
D3[D3: Chatbot Service]
D4[D4: Identity Verification]
D5[D5: Conference Service]
D6[D6: Database]
D7[D7: Mobile Frontend]
end

subgraph Code
C1[C1: Auth]
C2[C2: Users]
C3[C3: Jobs]
C4[C4: Applications]
C5[C5: Search]
C6[C6: Bookmarks]
C7[C7: Interviews]
C8[C8: Payments]
C9[C9: Chat]
C10[C10: Conference]
C11[C11: Verifications]
C12[C12: Reports]
C13[C13: Recommendations]
C14[C14: Invitations]
C15[C15: Web App Code]
C16[C16: Mobile App Code]
end

subgraph Tests
T1[T1: Auth Tests]
T2[T2: Jobs Tests]
T3[T3: Search Tests]
T4[T4: Applications Tests]
T5[T5: Backend Integration Tests]
T6[T6: Library Tests]
T7[T7: Middleware Tests]
T8[T8: Web Frontend Tests]
T9[T9: Mobile Tests]
end

%% R → D
R1 -.-> D1
R1 -.-> D2
R1 -.-> D7
R2 -.-> D1
R3 -.-> D2
R3 -.-> D6
R3 -.-> D7
R4 -.-> D3
R4 -.-> D5
R4 -.-> D7
R5 -.-> D1
R5 -.-> D2
R5 -.-> D6
R5 -.-> D7
R6 -.-> D1
R7 -.-> D2
R8 -.-> D2
R8 -.-> D7

%% D → D
D1 --> D2
D7 --> D2
D2 --> D3
D2 --> D4
D2 --> D5
D2 --> D6

%% D → C
D1 -.-> C15
D7 -.-> C16
D2 -.-> C1
D2 -.-> C2
D2 -.-> C3
D2 -.-> C4
D2 -.-> C5
D2 -.-> C6
D2 -.-> C7
D2 -.-> C8
D2 -.-> C9
D2 -.-> C10
D2 -.-> C11
D2 -.-> C12
D2 -.-> C13
D2 -.-> C14
D3 -.-> C9
D4 -.-> C11
D5 -.-> C10
D6 -.-> C1
D6 -.-> C2
D6 -.-> C3
D6 -.-> C4
D6 -.-> C5
D6 -.-> C6
D6 -.-> C7
D6 -.-> C8
D6 -.-> C9
D6 -.-> C10
D6 -.-> C11
D6 -.-> C12
D6 -.-> C13
D6 -.-> C14

%% C → C (Auth module = auth.routes.ts + auth.middleware.ts)
%% All modules depend on C1 via authenticateToken middleware
%% Additional edges from Prisma model ownership
C2 --> C1
C3 --> C1
C4 --> C1
C4 --> C3
C5 --> C1
C5 --> C2
C5 --> C3
C6 --> C1
C6 --> C3
C7 --> C1
C7 --> C4
C8 --> C1
C8 --> C2
C8 --> C4
C9 --> C1
C10 --> C1
C10 --> C7
C11 --> C1
C11 --> C2
C12 --> C1
C12 --> C2
C12 --> C3
C12 --> C4
C12 --> C8
C13 --> C1
C13 --> C2
C13 --> C3
C13 --> C4
C14 --> C1
C14 --> C2
C14 --> C3
C14 --> C4

%% C → T
C1 -.-> T1
C1 -.-> T6
C1 -.-> T7
C2 -.-> T5
C3 -.-> T2
C4 -.-> T4
C5 -.-> T3
C6 -.-> T5
C7 -.-> T5
C8 -.-> T5
C9 -.-> T5
C10 -.-> T5
C11 -.-> T5
C12 -.-> T5
C13 -.-> T5
C14 -.-> T4
C15 -.-> T8
C16 -.-> T9
```

---

## Traceability Graphs (Affected by each change)

### R1: Special Character Handling in Job Search

```mermaid
graph LR

subgraph Requirements
R1[R1: Special Char Search Fix]
end

subgraph Design
D1[D1: Web Frontend]
D2[D2: Backend]
D6[D6: Database]
D7[D7: Mobile Frontend]
end

subgraph Code
C1[C1: Auth]
C2[C2: Users]
C3[C3: Jobs]
C5[C5: Search]
C15[C15: Web App Code]
C16[C16: Mobile App Code]
end

subgraph Tests
T3[T3: Search Tests]
T8[T8: Web Frontend Tests]
T9[T9: Mobile Tests]
end

R1 -.-> D1
R1 -.-> D2
R1 -.-> D7

D1 --> D2
D7 --> D2
D2 --> D6

D2 -.-> C5
D6 -.-> C5
D1 -.-> C15
D7 -.-> C16

C5 --> C1
C5 --> C3
C5 --> C2

C5 -.-> T3
C15 -.-> T8
C16 -.-> T9
```

---

### R2: Fix Publish Announcement Frontend Payload Mismatch

```mermaid
graph LR

subgraph Requirements
R2[R2: Publish Announcement Fix]
end

subgraph Design
D1[D1: Web Frontend]
D2[D2: Backend]
end

subgraph Code
C15[C15: Web App Code]
end

subgraph Tests
T8[T8: Web Frontend Tests]
end

R2 -.-> D1

D1 --> D2

D1 -.-> C15

C15 -.-> T8
```

---

### R3: Flutter Mobile Application — Core Features

```mermaid
graph LR

subgraph Requirements
R3[R3: Mobile App - Core]
end

subgraph Design
D2[D2: Backend]
D6[D6: Database]
D7[D7: Mobile Frontend]
end

subgraph Code
C1[C1: Auth]
C2[C2: Users]
C3[C3: Jobs]
C4[C4: Applications]
C5[C5: Search]
C6[C6: Bookmarks]
C7[C7: Interviews]
C8[C8: Payments]
C11[C11: Verifications]
C12[C12: Reports]
C13[C13: Recommendations]
C14[C14: Invitations]
C16[C16: Mobile App Code]
end

subgraph Tests
T1[T1: Auth Tests]
T2[T2: Jobs Tests]
T3[T3: Search Tests]
T4[T4: Applications Tests]
T5[T5: Additional Route Tests]
T9[T9: Mobile Tests]
end

R3 -.-> D2
R3 -.-> D6
R3 -.-> D7

D7 --> D2
D2 --> D6

D2 -.-> C1
D2 -.-> C2
D2 -.-> C3
D2 -.-> C4
D2 -.-> C5
D2 -.-> C6
D2 -.-> C7
D2 -.-> C8
D2 -.-> C11
D2 -.-> C12
D2 -.-> C13
D2 -.-> C14
D6 -.-> C1
D6 -.-> C2
D6 -.-> C3
D6 -.-> C4
D6 -.-> C5
D6 -.-> C6
D6 -.-> C7
D6 -.-> C8
D6 -.-> C11
D6 -.-> C12
D6 -.-> C13
D6 -.-> C14
D7 -.-> C16

C2 --> C1
C3 --> C1
C4 --> C1
C4 --> C3
C5 --> C1
C5 --> C2
C5 --> C3
C6 --> C1
C6 --> C3
C7 --> C1
C7 --> C4
C8 --> C1
C8 --> C2
C8 --> C4
C11 --> C1
C11 --> C2
C12 --> C1
C12 --> C2
C12 --> C3
C12 --> C4
C12 --> C8
C13 --> C1
C13 --> C2
C13 --> C3
C13 --> C4
C14 --> C1
C14 --> C2
C14 --> C3
C14 --> C4

C1 -.-> T1
C3 -.-> T2
C5 -.-> T3
C4 -.-> T4
C2 -.-> T5
C6 -.-> T5
C7 -.-> T5
C8 -.-> T5
C11 -.-> T5
C12 -.-> T5
C13 -.-> T5
C16 -.-> T9
```

---

### R4: Flutter Mobile Application — Placeholder Screens

```mermaid
graph LR

subgraph Requirements
R4[R4: Mobile App - Placeholders]
end

subgraph Design
D3[D3: Chatbot Service]
D5[D5: Conference Service]
D7[D7: Mobile Frontend]
end

subgraph Code
C1[C1: Auth]
C7[C7: Interviews]
C9[C9: Chat]
C10[C10: Conference]
C16[C16: Mobile App Code]
end

subgraph Tests
T5[T5: Additional Route Tests]
T9[T9: Mobile Tests]
end

R4 -.-> D3
R4 -.-> D5
R4 -.-> D7

D3 -.-> C9
D5 -.-> C10
D7 -.-> C16

C9 --> C1
C10 --> C1
C10 --> C7
C7 --> C1

C9 -.-> T5
C10 -.-> T5
C16 -.-> T9
```

---

### R5: Applicant Search & Invitation System

```mermaid
graph LR

subgraph Requirements
R5[R5: Applicant Search & Invitation]
end

subgraph Design
D1[D1: Web Frontend]
D2[D2: Backend]
D6[D6: Database]
D7[D7: Mobile Frontend]
end

subgraph Code
C1[C1: Auth]
C2[C2: Users]
C3[C3: Jobs]
C4[C4: Applications]
C5[C5: Search]
C14[C14: Invitations]
C15[C15: Web App Code]
C16[C16: Mobile App Code]
end

subgraph Tests
T3[T3: Search Tests]
T4[T4: Applications Tests]
T8[T8: Web Frontend Tests]
T9[T9: Mobile Tests]
end

R5 -.-> D1
R5 -.-> D2
R5 -.-> D6
R5 -.-> D7

D1 --> D2
D7 --> D2
D2 --> D6

D2 -.-> C5
D2 -.-> C14
D6 -.-> C5
D6 -.-> C14
D1 -.-> C15
D7 -.-> C16

C5 --> C1
C5 --> C2
C5 --> C3
C14 --> C1
C14 --> C2
C14 --> C3
C14 --> C4

C5 -.-> T3
C4 -.-> T4
C15 -.-> T8
C16 -.-> T9
```

---

### R6: Similar Jobs Section on Job Detail Page

```mermaid
graph LR

subgraph Requirements
R6[R6: Similar Jobs]
end

subgraph Design
D1[D1: Web Frontend]
D2[D2: Backend]
end

subgraph Code
C13[C13: Recommendations]
C15[C15: Web App Code]
end

subgraph Tests
T8[T8: Web Frontend Tests]
end

R6 -.-> D1

D1 --> D2

D2 -.-> C13
D1 -.-> C15

C15 -.-> T8
```

---

### R7: Backend Test Coverage Expansion

```mermaid
graph LR

subgraph Requirements
R7[R7: Backend Test Coverage]
end

subgraph Design
D2[D2: Backend]
end

subgraph Code
C1[C1: Auth]
C2[C2: Users]
C3[C3: Jobs]
C4[C4: Applications]
C5[C5: Search]
C6[C6: Bookmarks]
C7[C7: Interviews]
C8[C8: Payments]
C9[C9: Chat]
C10[C10: Conference]
C11[C11: Verifications]
C12[C12: Reports]
C13[C13: Recommendations]
C14[C14: Invitations]
end

subgraph Tests
T1[T1: Auth Tests]
T2[T2: Jobs Tests]
T3[T3: Search Tests]
T4[T4: Applications Tests]
T5[T5: Additional Route Tests]
T6[T6: Library Tests]
T7[T7: Middleware Tests]
end

R7 -.-> D2

D2 -.-> C1
D2 -.-> C2
D2 -.-> C3
D2 -.-> C4
D2 -.-> C5
D2 -.-> C6
D2 -.-> C7
D2 -.-> C8
D2 -.-> C9
D2 -.-> C10
D2 -.-> C11
D2 -.-> C12
D2 -.-> C13
D2 -.-> C14

C1 -.-> T1
C1 -.-> T6
C1 -.-> T7
C2 --> C1
C2 -.-> T5
C3 --> C1
C3 -.-> T2
C4 --> C1
C4 --> C3
C4 -.-> T4
C5 --> C1
C5 --> C2
C5 --> C3
C5 -.-> T3
C6 --> C1
C6 --> C3
C6 -.-> T5
C7 --> C1
C7 --> C4
C7 -.-> T5
C8 --> C1
C8 --> C2
C8 --> C4
C8 -.-> T5
C9 --> C1
C9 -.-> T5
C10 --> C1
C10 --> C7
C10 -.-> T5
C11 --> C1
C11 --> C2
C11 -.-> T5
C12 --> C1
C12 --> C2
C12 --> C3
C12 --> C4
C12 --> C8
C12 -.-> T5
C13 --> C1
C13 --> C2
C13 --> C3
C13 --> C4
C13 -.-> T5
C14 --> C1
C14 --> C2
C14 --> C3
C14 --> C4
C14 -.-> T4
```
---

### R8: CI/CD & Quality Gate

```mermaid
graph LR

subgraph Requirements
R8[R8: CI/CD & Quality Gate]
end

subgraph Design
D2[D2: Backend]
D7[D7: Mobile Frontend]
end

subgraph Code
C1[C1: Auth]
C2[C2: Users]
C3[C3: Jobs]
C4[C4: Applications]
C5[C5: Search]
C6[C6: Bookmarks]
C7[C7: Interviews]
C8[C8: Payments]
C9[C9: Chat]
C10[C10: Conference]
C11[C11: Verifications]
C12[C12: Reports]
C13[C13: Recommendations]
C14[C14: Invitations]
C15[C15: Web App Code]
C16[C16: Mobile App Code]
end

subgraph Tests
T1[T1: Auth Tests]
T2[T2: Jobs Tests]
T3[T3: Search Tests]
T4[T4: Applications Tests]
T5[T5: Additional Route Tests]
T6[T6: Library Tests]
T7[T7: Middleware Tests]
T8[T8: Web Frontend Tests]
T9[T9: Mobile Tests]
end

R8 -.-> D2
R8 -.-> D7

D2 -.-> C1
D2 -.-> C2
D2 -.-> C3
D2 -.-> C4
D2 -.-> C5
D2 -.-> C6
D2 -.-> C7
D2 -.-> C8
D2 -.-> C9
D2 -.-> C10
D2 -.-> C11
D2 -.-> C12
D2 -.-> C13
D2 -.-> C14
D7 -.-> C16

C1 -.-> T1
C1 -.-> T6
C1 -.-> T7
C2 --> C1
C2 -.-> T5
C3 --> C1
C3 -.-> T2
C4 --> C1
C4 --> C3
C4 -.-> T4
C5 --> C1
C5 --> C2
C5 --> C3
C5 -.-> T3
C6 --> C1
C6 --> C3
C6 -.-> T5
C7 --> C1
C7 --> C4
C7 -.-> T5
C8 --> C1
C8 --> C2
C8 --> C4
C8 -.-> T5
C9 --> C1
C9 -.-> T5
C10 --> C1
C10 --> C7
C10 -.-> T5
C11 --> C1
C11 --> C2
C11 -.-> T5
C12 --> C1
C12 --> C2
C12 --> C3
C12 --> C4
C12 --> C8
C12 -.-> T5
C13 --> C1
C13 --> C2
C13 --> C3
C13 --> C4
C13 -.-> T5
C14 --> C1
C14 --> C2
C14 --> C3
C14 --> C4
C14 -.-> T4
C15 -.-> T8
C16 -.-> T9
```

---
 
## Directed Graph of SLOs

Each node represents a backend code module (SLO). An edge `A → B` means module A depends on module B. Dependencies are derived from two sources:
1. **Middleware dependency** — C1 (Auth) is defined as comprising both `auth.routes.ts` and `auth.middleware.ts`. Every module that uses `authenticateToken` middleware depends on C1.
2. **Prisma model ownership** — If module A queries a Prisma model whose primary CRUD operations are owned by module B, then A depends on B.
 
- SLO1: Auth Module
- SLO2: Users Module
- SLO3: Jobs Module
- SLO4: Applications Module
- SLO5: Search Module
- SLO6: Bookmarks Module
- SLO7: Interviews Module
- SLO8: Payments Module
- SLO9: Chat Module
- SLO10: Conference Module
- SLO11: Verifications Module
- SLO12: Reports Module
- SLO13: Recommendations Module
- SLO14: Invitations Module


![Directed_graph.png](./images/Directed_graph.png)
 
---
 
## Connectivity Matrix

| | SLO1 | SLO2 | SLO3 | SLO4 | SLO5 | SLO6 | SLO7 | SLO8 | SLO9 | SLO10 | SLO11 | SLO12 | SLO13 | SLO14 |
|:---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **SLO1** | - | | | | | | | | | | | | | |
| **SLO2** | 1 | - | | | | | | | | | | | | |
| **SLO3** | 1 | | - | | | | | | | | | | | |
| **SLO4** | 1 | | 1 | - | | | | | | | | | | |
| **SLO5** | 1 | 1 | 1 | | - | | | | | | | | | |
| **SLO6** | 1 | | 1 | | | - | | | | | | | | |
| **SLO7** | 1 | | 2 | 1 | | | - | | | | | | | |
| **SLO8** | 1 | 1 | 2 | 1 | | | | - | | | | | | |
| **SLO9** | 1 | | | | | | | | - | | | | | |
| **SLO10** | 1 | | 3 | 2 | | | 1 | | | - | | | | |
| **SLO11** | 1 | 1 | | | | | | | | | - | | | |
| **SLO12** | 1 | 1 | 1 | 1 | | | | 1 | | | | - | | |
| **SLO13** | 1 | 1 | 1 | 1 | | | | | | | | | - | |
| **SLO14** | 1 | 1 | 1 | 1 | | | | | | | | | | - |

---

## Analysis

### Which change requests are easy to apply and why?

**CR-02 (Fix Publish Announcement Frontend Payload)** is the easiest. The traceability graph for R2 only affects D1 and C15. No backend or database changes are needed. C15 has no dependencies in the SLO graph, so there is no ripple effect.

**CR-06 (Similar Jobs Section)** is also easy. It only adds a frontend hook that calls an existing endpoint. C13 (Recommendations) is never modified, so no backend ripple effect occurs.

### Which change requests are difficult to apply and why?

**CR-03 (Flutter Mobile Application — Core Features)** is the most difficult. The traceability graph for R3 touches D2, D6, D7, and almost all code modules C1–C14, because a completely new mobile platform had to be built from scratch. The connectivity matrix shows the longest path is SLO10 → SLO3 at distance 3, meaning multi-level integration testing is required.

**CR-05 (Applicant Search & Invitation System)** is also difficult. It touches all four main containers and required a new Prisma model and migration. SLO14 depends directly on SLO2, SLO3, and SLO4. Accepting an invitation also auto-creates an Application, making SLO14 → SLO4 → SLO3 a chain that must be tested together across both web and mobile.

### To make the maintenance easier, what would you expect from the previous developers?

**Accurate C4 diagrams** — Several containers did not match the actual implementation. The Chatbot Service was labeled Python but was TypeScript, the Report Database was shown as separate but shared the same PostgreSQL instance, and the Payment Service appeared in the diagram but was never called by the backend.

**Higher baseline test coverage** — Only 4 out of 14 backend route modules had tests. C14 (Invitations) has no dedicated test file and shares T4, making it harder to isolate failures.

**Module dependency documentation** — There was no document explaining which route modules query the Prisma models of other modules. The team had to read every source file one by one and cross-reference them with the Prisma schema to build the SLO dependency graph.
