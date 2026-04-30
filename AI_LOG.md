# AI Development Log

**Project:** Chongyai Job Center (ITCS383)
**AI Tool:** Claude Sonnet 4.6 (Claude Code)
**Period:** April 2026

---

## Session 1 — Feature 1: Applicant Search & Invitation System

### Request
> "Feature request 1: Applicant Search & Invitation System — Allows recruitment units to search for applicants using filters such as skills, education, experience, and job preference. Recruitment units can view applicant profiles and send job invitations. Applicants can accept or reject the invitation. If accepted, the process continues to interview and the normal recruitment flow."

### AI Actions

**1. Codebase Exploration**
- Spawned an Explore agent to understand the full project structure before writing any code
- Key findings: Express.js backend with Prisma ORM, Next.js 14 frontend, PostgreSQL database, JWT authentication with 3 roles (APPLICANT, RECRUITER, ADMIN)

**2. Database Layer**
- Added `InvitationStatus` enum (`PENDING`, `ACCEPTED`, `REJECTED`) to `schema.prisma`
- Added `Invitation` model with relations to `User` (recruiter + applicant) and `Job`
- Added unique constraint `@@unique([recruiterId, applicantId, jobId])` to prevent duplicate invitations
- Added relation fields `sentInvitations` and `receivedInvitations` on `User` model
- Added `invitations` relation on `Job` model
- Ran `prisma migrate dev --name add_invitation_model` — migration applied successfully

**3. Backend Routes**

Created `implementations/backend/src/routes/invitations.routes.ts`:
- `POST /api/invitations` — Send invitation (RECRUITER only). Validates job ownership, applicant existence, and prevents duplicates.
- `GET /api/invitations/sent` — Recruiter's sent invitations with pagination and status filter
- `GET /api/invitations/received` — Applicant's received invitations with pagination and status filter
- `PUT /api/invitations/:id/respond` — Accept or reject (APPLICANT only). On acceptance, automatically creates an `Application` record with status `REVIEWING`

Added `GET /api/search/applicants` to `search.routes.ts` (RECRUITER/ADMIN only):
- Filters: `q` (name/email), `skills`, `location`, `education`, `experience`
- Only returns applicants with `isPaid: true`
- Registered `/api/invitations` route in `app.ts`

**4. Frontend**

Added `InvitationStatus` type and `Invitation` interface to `types/index.ts`

Created `hooks/useInvitations.ts`:
- `useSentInvitations()` — fetch/send invitations for recruiters
- `useReceivedInvitations()` — fetch/respond to invitations for applicants

Created 3 new pages:
- `dashboard/recruiter/search/page.tsx` — Search form with 5 filters, paginated results, expandable cards, and inline "Invite" modal with job selector
- `dashboard/recruiter/invitations/page.tsx` — Sent invitations list with PENDING/ACCEPTED/REJECTED badges
- `dashboard/applicant/invitations/page.tsx` — Received invitations with Accept/Decline buttons and job details

Updated `Sidebar.tsx`:
- Recruiter nav: added "Search Applicants" and "Sent Invitations"
- Applicant nav: added "Invitations"

### Design Decisions
- On invitation acceptance, create Application automatically with `REVIEWING` status (skipping `APPLIED`) to indicate recruiter-initiated flow
- Only paid applicants appear in search results (matches existing system policy)
- Used `origin: true` approach initially for CORS debugging, then refined

---

## Session 2 — Feature 2: Job Recommendation System

### Request
> "Feature request 2: Job Recommendation System — When an applicant clicks on a job, the system will show other jobs that are similar based on job type, skills, or location."

### AI Actions

**1. Discovery**
- Checked `recommendations.routes.ts` — found `GET /recommendations/similar/:jobId` already existed
- Endpoint scores jobs by: number of matching skills + 1 bonus point if same job type
- Returns top 5 results, no auth required

**2. Frontend Only Changes**

Added `useSimilarJobs(jobId)` hook to `hooks/useJobs.ts`:
- Calls `GET /recommendations/similar/:jobId`
- Runs on mount when `jobId` is available

Updated `dashboard/applicant/jobs/[id]/page.tsx`:
- Added `useSimilarJobs` import alongside existing `useJob`
- Added "Similar Jobs" section below the job detail content
- Renders a 2-column grid of `JobCard` components
- Section hidden entirely when no similar jobs found

### Design Decisions
- No backend changes needed — reused existing endpoint
- Section only renders when `similarJobs.length > 0` to avoid empty sections
- Used existing `JobCard` component for consistent UI

---

## Session 3 — GitHub Actions CI Improvements

### Request
> "There must be GitHub Actions that run automated builds and tests."

### AI Actions

Rewrote `.github/workflows/ci.yml` from a single sequential job to 3 parallel jobs:

**Before:**
- 1 job running all steps sequentially
- No `CI=true` env (Jest could hang in watch mode)
- No env vars for backend tests
- SonarCloud ran regardless of test results
- `fetch-depth: 0` on every step

**After:**
- `frontend` job: install → lint → build → test (parallel with backend)
- `backend` job: install → build → test with coverage, with `JWT_SECRET` and `DATABASE_URL` env vars
- `sonarcloud` job: runs only after both jobs pass (`needs: [frontend, backend]`), downloads coverage artifact
- Added `CI=true` and `--ci` flags to prevent Jest watch mode
- Added `--include=dev` to backend install to ensure TypeScript types are available during build

---

## Session 4 — Cloud Deployment on Render

### Request
> "The backend must be successfully deployed on the cloud."

### AI Actions

**1. render.yaml**
- Created `render.yaml` at repo root defining web service + free PostgreSQL
- Build command: `npm ci && npx prisma generate && npm run build`
- Start command: `npx prisma migrate deploy && npm start`
- `JWT_SECRET` set to auto-generate, `DATABASE_URL` wired from DB service

**2. Deployment Issues Fixed (in order)**

| Error | Cause | Fix |
|---|---|---|
| `DATABASE_URL not found` during build | Prisma generate runs at build time but env var not set | User added `DATABASE_URL` manually in Render dashboard |
| `Exited with status 1` — TS7016 cannot find declaration file for `express` | `NODE_ENV=production` caused `npm ci` to skip devDependencies including `@types/express` | Changed build command to `npm ci --include=dev` |
| `ERR_ERL_UNEXPECTED_X_FORWARDED_FOR` — 500 on all requests | Render sits behind a proxy but `express-rate-limit` requires `trust proxy` to be set | Added `app.set('trust proxy', 1)` to `app.ts` |
| CORS error — `Response headers (0)` | `FRONTEND_URL` in Render was missing `https://` prefix | User corrected value; then CORS logic updated to `origin: true` for reliability |
| 500 Internal Server Error on login | `JWT_SECRET` not set in Render environment | User added `JWT_SECRET`, `JWT_EXPIRES_IN`, `NODE_ENV`, `PORT` to Render dashboard |

**3. Database Migration to Clever Cloud**
- User chose to use Clever Cloud PostgreSQL (free DEV plan) instead of Render PostgreSQL
- Exported local database: `PGPASSWORD=password pg_dump -U jobcenter -d jobcenter_db ...`
- Imported to Clever Cloud using `psql "postgresql://..."` connection string
- Updated `DATABASE_URL` in Render to point to Clever Cloud PostgreSQL
- `prisma migrate deploy` confirmed "No pending migrations to apply" — schema matched

**4. Additional Fixes**
- Cookie re-set bug: on browser restart, `auth-token` cookie was cleared but token remained in `localStorage`. Middleware checked cookie → not found → redirected to login. Fixed by calling `persistToken(storedToken)` during `AuthContext` initialization to re-set the cookie.
- Added `backup.sql` and `.env.production` to `.gitignore` to prevent sensitive files from being committed

---

## Summary of All Files Changed

### New Files
| File | Purpose |
|---|---|
| `backend/src/routes/invitations.routes.ts` | Invitation CRUD API |
| `backend/src/prisma/migrations/20260417203215_add_invitation_model/migration.sql` | DB migration for Invitation table |
| `frontend/src/hooks/useInvitations.ts` | React hooks for invitations |
| `frontend/src/app/dashboard/recruiter/search/page.tsx` | Recruiter applicant search page |
| `frontend/src/app/dashboard/recruiter/invitations/page.tsx` | Recruiter sent invitations page |
| `frontend/src/app/dashboard/applicant/invitations/page.tsx` | Applicant received invitations page |
| `render.yaml` | Render deployment configuration |
| `D3_CHANGE_REQUESTS.md` | Change request analysis document |
| `AI_LOG.md` | This file |

### Modified Files
| File | Change |
|---|---|
| `backend/src/prisma/schema.prisma` | Added `InvitationStatus` enum and `Invitation` model |
| `backend/src/routes/search.routes.ts` | Added `GET /search/applicants` endpoint |
| `backend/src/app.ts` | Registered invitations route, added `trust proxy`, fixed CORS |
| `frontend/src/types/index.ts` | Added `InvitationStatus` type and `Invitation` interface |
| `frontend/src/hooks/useJobs.ts` | Added `useSimilarJobs` hook |
| `frontend/src/app/dashboard/applicant/jobs/[id]/page.tsx` | Added Similar Jobs section |
| `frontend/src/components/layout/Sidebar.tsx` | Added new nav items for both roles |
| `frontend/src/context/AuthContext.tsx` | Re-set cookie on init to fix middleware redirect |
| `frontend/.gitignore` | Added `.env.production` to ignore list |
| `.github/workflows/ci.yml` | Redesigned CI with parallel jobs |
