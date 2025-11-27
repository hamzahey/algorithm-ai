# JobHub Monorepo

JobHub is a Next.js + NestJS monorepo that powers the public job board experience (`client/`) and the API/accounting layer (`server/`). This document gathers the commands, environment variables, and deployment steps you need to take it from local development to a full Railway deployment.

## Live Deployment

The application is currently deployed on Railway:

- **Frontend**: [https://clever-reprieve-production-27a1.up.railway.app](https://clever-reprieve-production-27a1.up.railway.app)
- **Backend API**: [https://algorithm-ai-production-d3e1.up.railway.app](https://algorithm-ai-production-d3e1.up.railway.app)
- **Health Check**: [https://algorithm-ai-production-d3e1.up.railway.app/health](https://algorithm-ai-production-d3e1.up.railway.app/health)

## Health Check Endpoint

## Workspace layout

| Directory | Purpose |
| --- | --- |
| `client/` | Next.js 16 frontend (React 19) that consumes the API via `NEXT_PUBLIC_API_URL`. |
| `server/` | NestJS backend with Prisma/PostgreSQL and JWT streams. |

Each directory maintains its own `package.json` and lockfile, so most commands run inside the relevant folder.

## Prerequisites

- [pnpm](https://pnpm.io/) (v8+ preferred)
- Node.js 20+
- PostgreSQL (local or hosted) for the NestJS service
- Environment variables (see below)

## Environment configuration

Copy `env.example` into `.env.local` (for Next) and `.env` (for Nest), then fill in the real values. At minimum you should set:

| Variable | Where | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | `server/` | PostgreSQL DSN used by Prisma |
| `JWT_SECRET` | `server/` | Signing key for JSON Web Tokens |
| `CLIENT_URL` | `server/` | Allowed origin for CORS (Next.js URL) |
| `PORT` | `server/` | Optional override for NestJS (defaults to 8000) |
| `NEXT_PUBLIC_API_URL` | `client/` | Base API URL that the frontend uses |
| `ADMIN_EMAIL` | `server/` | Email of the seeded administrator |
| `ADMIN_PASSWORD` | `server/` | Password for the seeded administrator |
| `ADMIN_NAME` | `server/` | Optional display name for the seeded administrator |

This project includes an `AdminSeedService` that runs each time NestJS boots: when `ADMIN_EMAIL` and `ADMIN_PASSWORD` are configured, it will create (or promote) a user with `isAdmin = true`. Update those values in your `.env` before you run migrations or deploy so the seed can finish successfully.

## Local development

1. **Backend**
   ```bash
   cd server
   pnpm install
   cp ../env.example .env          # or import required envs from another file
   pnpm prisma migrate dev         # sets up the database
   npx prisma generate             # Necessary to avoid ts errors
   pnpm run start:dev              # runs NestJS with hot reload
   ```

2. **Frontend**
   ```bash
   cd client
   pnpm install
   NEXT_PUBLIC_API_URL=http://localhost:8000 pnpm run dev
   ```

   The client expects the backend to be available at `NEXT_PUBLIC_API_URL`, so keep both services running during development.

## Running tests

- `pnpm --filter client lint`
- `pnpm --filter server test`
- `pnpm --filter server test:e2e`

## Production builds

```
cd server
pnpm install
pnpm run build

cd ../client
pnpm install
pnpm run build
```

During Docker/CI builds you can re-use those commands to render production assets.

## Deploying to Railway

Railway can host both services together. Create a single Railway project and add two services:

1. **PostgreSQL plugin**
   - Add Railway's PostgreSQL plugin to the project and copy the generated `DATABASE_URL`.
2. **Server service (NestJS)**
   - Root directory: `server`
   - Install command: `cd server && pnpm install`
   - Build command: `cd server && pnpm run build`
   - Start command: `cd server && pnpm run start:prod`
   - Environment variables: `DATABASE_URL`, `JWT_SECRET`, `CLIENT_URL` (set it to the Railway URL that hosts the Next.js service), `PORT` (optional)
   - After the service is deployed, run `railway run --service <service-id> cd server && pnpm prisma migrate deploy` so Prisma runs migrations in production.
3. **Client service (Next.js)**
   - Root directory: `client`
   - Install command: `cd client && pnpm install`
   - Build command: `cd client && pnpm run build`
   - Start command: `cd client && pnpm run start`
   - Environment variables: `NEXT_PUBLIC_API_URL` (set to the backend service URL), optionally `NODE_ENV=production`

Railway exposes a URL per service. Point `NEXT_PUBLIC_API_URL` at the backend URL and allow CORS by setting `CLIENT_URL` on the Nest service. You can also add custom domains later once both services are stable.

## Health Check Endpoint

The backend exposes a diagnostic endpoint at `/health` that reports:

- **App status**: `healthy` or `unhealthy` based on database connectivity
- **Uptime**: Seconds since the server started
- **Database connection**: Whether Prisma can query the database
- **Environment status**: Node environment, port, and presence of required env vars (values are masked)

Example response:
```json
{
  "status": "healthy",
  "timestamp": "2025-01-27T12:00:00.000Z",
  "uptime": 3600,
  "database": {
    "connected": true
  },
  "environment": {
    "nodeEnv": "production",
    "port": "8000",
    "hasDatabaseUrl": true,
    "hasJwtSecret": true
  }
}
```

Use this endpoint to monitor service health in production and verify database connectivity during deployments.

## API Documentation

All API endpoints are prefixed with the base URL: `https://algorithm-ai-production-d3e1.up.railway.app`

### Authentication

All authenticated endpoints require a JWT token in the `Authorization` header:
```
Authorization: Bearer <token>
```

#### POST `/auth/register`
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "name": "John Doe",
  "password": "password123"
}
```

**Response:** `200 OK`
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "isAdmin": false,
    "createdAt": "2025-01-27T12:00:00.000Z",
    "updatedAt": "2025-01-27T12:00:00.000Z"
  },
  "accessToken": "jwt-token-here"
}
```

#### POST `/auth/login`
Authenticate and receive a JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:** `200 OK` (same format as register)

#### POST `/auth/signout`
Sign out the current user. Requires authentication.

**Response:** `200 OK`
```json
{
  "message": "Signed out user@example.com"
}
```

### Jobs (Authenticated)

All job management endpoints require authentication and return jobs owned by the authenticated user.

#### GET `/jobs`
Get all jobs created by the authenticated user.

**Response:** `200 OK`
```json
[
  {
    "id": "uuid",
    "title": "Software Engineer",
    "company": "Tech Corp",
    "description": "Job description...",
    "salary": "$100k-150k",
    "tags": ["javascript", "react"],
    "status": "ACTIVE",
    "approved": true,
    "createdAt": "2025-01-27T12:00:00.000Z",
    "updatedAt": "2025-01-27T12:00:00.000Z"
  }
]
```

#### GET `/jobs/:id`
Get a specific job by ID (must be owned by the authenticated user).

#### POST `/jobs`
Create a new job posting.

**Request Body:**
```json
{
  "title": "Software Engineer",
  "company": "Tech Corp",
  "description": "We are looking for...",
  "salary": "$100k-150k",
  "tags": ["javascript", "react", "nodejs"]
}
```

#### PATCH `/jobs/:id`
Update an existing job (must be owned by the authenticated user).

**Request Body:** (all fields optional)
```json
{
  "title": "Senior Software Engineer",
  "tags": ["javascript", "react", "typescript"]
}
```

#### DELETE `/jobs/:id`
Delete a job (must be owned by the authenticated user).

**Response:** `200 OK`
```json
{
  "message": "Job deleted"
}
```

### Public Job Discovery

#### GET `/jobs/search`
Search and filter public job listings. Only returns jobs with `approved: true`.

**Query Parameters:**
- `search` (optional): Search term for title, company, description, or salary
- `tags` (optional): Comma-separated list of tags to filter by
- `mode` (optional): `'and'` (default) or `'or'` - tag matching mode

**Example:** `/jobs/search?search=engineer&tags=javascript,react&mode=or`

**Response:** `200 OK` (array of job listings, same format as authenticated jobs endpoint)

### Admin Endpoints

All admin endpoints require authentication and `isAdmin: true` role.

#### GET `/admin/users`
Get all users with their job counts.

**Response:** `200 OK`
```json
[
  {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "isAdmin": false,
    "lastLoginAt": "2025-01-27T12:00:00.000Z",
    "createdAt": "2025-01-27T12:00:00.000Z",
    "updatedAt": "2025-01-27T12:00:00.000Z",
    "jobCount": 5
  }
]
```

#### GET `/admin/jobs`
Get all jobs for moderation.

**Query Parameters:**
- `approved` (optional): `'true'` or `'false'` to filter by approval status

**Response:** `200 OK` (array of jobs with user information)

#### PATCH `/admin/jobs/:id/approve`
Approve or reject a job posting.

**Request Body:**
```json
{
  "approved": true
}
```

**Response:** `200 OK`
```json
{
  "success": true
}
```

#### DELETE `/admin/jobs/:id`
Delete a job as an admin (bypasses ownership checks).

**Response:** `200 OK`
```json
{
  "success": true
}
```

### Error Responses

All endpoints may return error responses:

**400 Bad Request:**
```json
{
  "message": "Validation error message",
  "error": "Bad Request"
}
```

**401 Unauthorized:**
```json
{
  "message": "Invalid credentials",
  "error": "Unauthorized"
}
```

**403 Forbidden:**
```json
{
  "message": "Not authorized to modify this job",
  "error": "Forbidden"
}
```

**404 Not Found:**
```json
{
  "message": "Job not found",
  "error": "Not Found"
}
```

## Architecture Decisions and Reasoning

### Monorepo Structure

**Decision**: Separate `client/` and `server/` directories with independent `package.json` files.

**Reasoning**:
- Clear separation of concerns between frontend and backend
- Independent dependency management (Next.js vs NestJS ecosystems)
- Easier to deploy services separately on Railway
- Allows different teams to work on frontend/backend independently
- Each service can have its own build and deployment pipeline

### Technology Stack

**Frontend: Next.js 16 + React 19**
- **Reasoning**: Server-side rendering for better SEO, built-in routing, excellent developer experience
- **Trade-off**: Slightly more complex than pure client-side React, but provides better performance and SEO

**Backend: NestJS**
- **Reasoning**: TypeScript-first, modular architecture, built-in dependency injection, excellent for scalable APIs
- **Trade-off**: More boilerplate than Express, but provides better structure and maintainability

**Database: PostgreSQL + Prisma**
- **Reasoning**: 
  - PostgreSQL: Robust, ACID-compliant, excellent for relational data
  - Prisma: Type-safe database access, excellent migrations, auto-generated TypeScript types
- **Trade-off**: Prisma adds a layer of abstraction, but provides type safety and better developer experience

### Authentication Strategy

**Decision**: JWT tokens with Authorization headers (migrated from cookies).

**Initial Approach (Cookies)**:
- Used HTTP-only cookies for security
- Worked perfectly in local development (same origin)
- Failed in production due to cross-origin cookie blocking

**Final Approach (Authorization Headers)**:
- Store JWT in `localStorage` on frontend
- Send token in `Authorization: Bearer <token>` header
- Works reliably across different domains
- **Security consideration**: `localStorage` is accessible to JavaScript (unlike HTTP-only cookies), but XSS protection is handled via React's built-in escaping and proper input validation

**Reasoning for Migration**:
- Modern browsers increasingly block third-party cookies for privacy
- Authorization headers are standard practice for SPAs
- More explicit and easier to debug
- No dependency on browser cookie policies

### Job Approval System

**Decision**: Jobs require admin approval before appearing in public search (`approved: true`).

**Reasoning**:
- Prevents spam and inappropriate content
- Allows quality control before jobs are visible to job seekers
- Jobs are created with `approved: true` by default (can be changed via migration)
- Admin can approve/reject jobs via `/admin/jobs` endpoint

**Implementation**:
- `approved` field in Job model (boolean, default `true`)
- Public search (`/jobs/search`) only returns approved jobs
- User's own jobs (`/jobs`) show all jobs regardless of approval status
- Admin endpoints allow filtering and managing approval status

### Tag System

**Decision**: Tags stored as string arrays, case-insensitive matching.

**Reasoning**:
- Simple array storage in PostgreSQL
- Case-insensitive normalization ensures consistent matching
- Tags are normalized to lowercase on create/update
- Search supports both `AND` and `OR` tag matching modes

**Implementation**:
- Tags normalized to lowercase in `JobsService.normalizeTags()`
- Frontend displays tags as-is but sends lowercase to API
- Search queries are case-insensitive

### CORS Configuration

**Decision**: Allow all origins in production (`origin: true`).

**Reasoning**:
- Frontend and backend on different Railway domains
- Authorization headers don't require specific CORS origin restrictions
- Simplified deployment (no need to update CORS when frontend URL changes)
- **Security note**: With Authorization headers, CORS is less critical since tokens aren't automatically sent like cookies

**Alternative considered**: Whitelist specific origins, but requires updating environment variables when deploying to new domains.

### Health Check Endpoint

**Decision**: Expose `/health` endpoint for monitoring and diagnostics.

**Reasoning**:
- Essential for production monitoring
- Verifies database connectivity
- Reports environment configuration status
- Helps debug deployment issues
- Can be used by load balancers and monitoring tools

## Debug Notes

### Bug: Prisma TypeScript errors after adding `approved` field to Job model

**Problem**: After adding the `approved: Boolean` field to the Prisma schema and running migrations, TypeScript started throwing errors like:
```
Type '{ approved: boolean; } | undefined' is not assignable to type 'JobWhereInput | undefined'.
Object literal may only specify known properties, and 'approved' does not exist in type 'JobWhereInput'.
```

**Root cause**: The Prisma Client TypeScript types are generated from the schema. When you modify the schema, you must regenerate the client to update the types. The IDE/TypeScript compiler was still using the old generated types that didn't include the `approved` field.

**Debugging steps**:
1. Checked the Prisma schema (`server/prisma/schema.prisma`) - confirmed `approved` field was present
2. Verified migrations ran successfully - the database had the column
3. Checked generated Prisma client types in `node_modules/@prisma/client` - found they were outdated
4. Realized the client wasn't regenerated after schema changes

**Solution**: Ran `pnpm prisma generate` in the `server/` directory to regenerate the Prisma Client with updated TypeScript types. This refreshed all the `JobWhereInput`, `JobUpdateInput`, and related types to include the `approved` field.

**Prevention**: Always run `pnpm prisma generate` (or `pnpm prisma migrate dev` which does it automatically) after modifying the Prisma schema. In CI/CD pipelines, ensure Prisma generation runs as part of the build step.

### Bug: Authentication with cookies failed in cross-origin deployment

**Problem**: After deploying the frontend and backend to Railway on different domains, authentication stopped working. Users could log in successfully (200 OK response), but subsequent authenticated requests (like `/jobs`, `/auth/signout`) returned 401 Unauthorized errors. The browser console showed: "this attempt to set a cookie via cookie header was blocked due to user preferences."

**Initial implementation**: 
- Authentication used HTTP-only cookies to store JWT tokens
- Backend set cookies with `httpOnly: true`, `sameSite: 'lax'`, and `secure: true` in production
- JWT strategy extracted tokens from cookies using `cookieExtractor`
- Frontend relied on browser automatically sending cookies with `credentials: "include"`

**Why it worked locally**: 
- Both frontend (`http://localhost:3000`) and backend (`http://localhost:8000`) ran on localhost
- Same-origin requests allowed cookies to work seamlessly
- No cross-origin restrictions applied

**Why it failed in production**:
- Frontend deployed to: `clever-reprieve-production-27a1.up.railway.app`
- Backend deployed to: `algorithm-ai-production-d3e1.up.railway.app`
- Different domains = cross-origin requests
- Browser blocked third-party cookies (different domains)
- Even after updating to `sameSite: 'none'` and `secure: true`, modern browsers blocked the cookies due to privacy settings
- Cookies were set correctly (visible in response headers) but browser refused to store/send them

**Debugging steps**:
1. Verified login endpoint returned 200 OK with `Set-Cookie` header containing `SameSite=None; Secure`
2. Checked browser DevTools → Application → Cookies - cookie was not present
3. Confirmed CORS was configured correctly (`access-control-allow-credentials: true`)
4. Tested in different browsers - all blocked third-party cookies
5. Realized cookies are unreliable for cross-origin authentication in modern browsers

**Solution**: Migrated from cookie-based to Authorization header-based authentication:
1. **Backend**: Already supported Bearer tokens via `ExtractJwt.fromAuthHeaderAsBearerToken()` in JWT strategy (no changes needed)
2. **Frontend**: 
   - Store JWT token in `localStorage` after login/register
   - Send token in `Authorization: Bearer <token>` header for all API requests
   - Clear token from `localStorage` on signout
   - Removed dependency on cookies entirely

**Key changes**:
- Added token storage functions to `client/lib/session.ts` (`getAuthToken`, `setAuthToken`, `clearAuthToken`)
- Updated `client/lib/api.ts` `request()` function to include Authorization header
- Modified `register()` and `login()` to store tokens in localStorage
- Updated `signOut()` to clear tokens

**Why Authorization headers work better**:
- Headers work reliably across different domains (no browser restrictions)
- More explicit and easier to debug
- Standard practice for JWT authentication in SPAs
- No dependency on browser cookie policies

**Prevention**: For cross-origin deployments, prefer Authorization headers over cookies. If using cookies, ensure both services are on the same domain (e.g., `api.example.com` and `app.example.com` work better than completely different domains).

### Additional tips

- Keep `.env` files out of version control; use Railway's environment variables instead.
- When you change the Prisma schema, re-run `pnpm prisma migrate dev` locally and commit the generated migration under `server/prisma/migrations`.
- Always run `pnpm prisma generate` after schema changes to update TypeScript types.
- Monitor Railway logs for both services to troubleshoot cross-service requests and auth flows.
- Use the `/health` endpoint to verify database connectivity during deployments.


