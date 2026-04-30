# D3 Change Request Analysis

**Project:** Job Center Management System  

---

## Change Request Distribution

| Type of Change | Number of Change Requests |
|----------------|--------------------------|
| Corrective     | 2                        |
| Adaptive       | 2                        |
| Perfective     | 2                        |
| Preventive     | 2                        |
| **Total**      | **8**                    |

---

## Change Requests

---

### CR-01 — Fix expiresAt Type Mismatch

| Attribute              | Description |
|------------------------|-------------|
| **CR ID**              | CR-01 |
| **Associated Feature** | Job Creation / Backend API |
| **Description**        | Fixed a type mismatch issue for the expiresAt field during job creation. Previously, the field was validated as a string (datetime format) and passed directly to the database layer. Since the database (Prisma) expects a Date object, the value is now converted to a Date before being persisted. |
| **Maintenance Type**   | Corrective |
| **Priority**           | High |
| **Severity**           | High |
| **Time to Implement**  | 0.1 person-weeks |
| **Verification Method** | Testing and Inspection |

---

### CR-02 — Fix CORS Configuration

| Attribute              | Description |
|------------------------|-------------|
| **CR ID**              | CR-02 |
| **Associated Feature** | CORS Configuration |
| **Description**        | Fixed CORS configuration to dynamically allow requests from FRONTEND_URL and localhost origins instead of using hardcoded values. This improves flexibility across different environments (development and production) and prevents cross-origin request issues. |
| **Maintenance Type**   | Corrective |
| **Priority**           | High |
| **Severity**           | High |
| **Time to Implement**  | 0.1 person-week |
| **Verification Method** | Testing and Inspection |

---

### CR-03 — Flutter Mobile Application 

| Attribute              | Description |
|------------------------|-------------|
| **CR ID**              | CR-03 |
| **Associated Feature** | Mobile Client App |
| **Description**        | Built a Flutter mobile app from scratch supporting all three roles. Applicant can browse and search jobs, apply, bookmark, track applications, view interviews, and manage invitations. Recruiter can post and manage jobs, review applicants, manage interviews, and search applicants. Admin has access to dashboard, users, jobs, payments, and reports. The app uses role-based navigation, state management, and secure token storage. |
| **Maintenance Type**   | Adaptive |
| **Priority**           | High |
| **Severity**           | High |
| **Time to Implement**  | 0.6 person-weeks |
| **Verification Method** | Testing and Inspection |

---

### CR-04 — Add render.yaml for render cloud deployment

| Attribute              | Description |
|------------------------|-------------|
| **CR ID**              | CR-04 |
| **Associated Feature** | Deployment & DevOps Configuration |
| **Description**        | Added a render.yaml configuration file to enable automated deployment on Render cloud platform. The file defines services, environment variables, build commands, and start commands for the application. This improves deployment consistency, reduces manual setup, and supports scalable cloud hosting. |
| **Maintenance Type**   | Adaptive |
| **Priority**           | Medium |
| **Severity**           | Low |
| **Time to Implement**  | 0.1 person-weeks |
| **Verification Method** | Deployment testing on Render and configuration inspection |

---

### CR-05 — Add Applicant Search & Invitation System

| Attribute              | Description |
|------------------------|-------------|
| **CR ID**              | CR-05 |
| **Associated Feature** | Applicant Search & Invitation System |
| **Description**        | Added invitation system on web and mobile. Web includes recruiter search with invite modal, sent/received invitation pages, and hooks for both roles. Mobile includes recruiter search, and invitation tabs for both recruiter and applicant with Accept/Decline flow. |
| **Maintenance Type**   | Perfective |
| **Priority**           | High |
| **Severity**           | High |
| **Time to Implement**  | 0.4 person-weeks |
| **Verification Method** | Testing and Inspection |

---

### CR-06 — Add Similar Jobs Recommendation Feature

| Attribute              | Description |
|------------------------|-------------|
| **CR ID**              | CR-06 |
| **Associated Feature** | Job Recommendation |
| **Description**        | Added a similar jobs feature on the job detail page. It fetches related jobs and displays them as job cards in a two-column grid below the main job content. The section only appears when similar jobs are available. |
| **Maintenance Type**   | Perfective |
| **Priority**           | Medium |
| **Severity**           | Low |
| **Time to Implement**  | 0.3 person-week |
| **Verification Method** | Testing and Inspection |

---

### CR-07 — Add SonarQube Code Coverage Analysis

| Attribute              | Description |
|------------------------|-------------|
| **CR ID**              | CR-07 |
| **Associated Feature** | Code Quality & Testing |
| **Description**        | Integrated SonarQube for code coverage analysis to monitor and evaluate test coverage across the application. This helps identify untested or low-quality code areas and prevents potential defects by enforcing better code quality and coverage standards. |
| **Maintenance Type**   | Preventive |
| **Priority**           | Medium |
| **Severity**           | Low |
| **Time to Implement**  | 0.4 person-week |
| **Verification Method** | Testing and Inspection |

---

### CR-08 — Add Backend tests module

| Attribute              | Description |
|------------------------|-------------|
| **CR ID**              | CR-08 |
| **Associated Feature** | Backend Testing Module |
| **Description**        | Added a backend testing module to support structured testing of core application logic and services. This improves code reliability, helps detect defects early, and ensures that backend functionalities behave as expected under different scenarios. |
| **Maintenance Type**   | Preventive |
| **Priority**           | High |
| **Severity**           | High |
| **Time to Implement**  | 0.4 person-week |
| **Verification Method** | Testing and Inspection |



