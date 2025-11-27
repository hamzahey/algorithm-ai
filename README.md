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

### Additional tips

- Keep `.env` files out of version control; use Railway's environment variables instead.
- When you change the Prisma schema, re-run `pnpm prisma migrate dev` locally and commit the generated migration under `server/prisma/migrations`.
- Always run `pnpm prisma generate` after schema changes to update TypeScript types.
- Monitor Railway logs for both services to troubleshoot cross-service requests and auth flows.
- Use the `/health` endpoint to verify database connectivity during deployments.


