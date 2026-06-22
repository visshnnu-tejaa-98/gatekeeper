# Gatekeeper (iLogin)

A self-hosted identity platform — an open alternative to Okta, Auth0, and Clerk. Provides authentication, an OAuth2 / OpenID Connect provider, a developer dashboard for managing OAuth clients, and admin-level user management.

This monorepo contains two projects:

| Project | Stack | Purpose |
| --- | --- | --- |
| [`auth-ts`](./auth-ts) | Node.js · Express 5 · TypeScript · PostgreSQL · Drizzle ORM | Identity & OIDC provider backend |
| [`oidc-auth`](./oidc-auth) | TanStack Start · React 19 · TanStack Router/Query · TailwindCSS v4 | Login, consent screen, and developer/admin dashboard |

For the full design, see [`sds.md`](./sds.md). For the product vision and roadmap, see [`prd.md`](./prd.md).

---

## Architecture

```
                                 +-----------------------------+
   Browser  ────────────────►    |  oidc-auth (React frontend) |
                                 |  · Login / Signup           |
                                 |  · Email verification       |
                                 |  · Consent screen           |
                                 |  · Developer dashboard      |
                                 |  · User / app management UI |
                                 +--------------+--------------+
                                                │ HTTPS
                                                ▼
                                 +-----------------------------+
   RP backend / SPA   ──────►    |  auth-ts (Express API)      |
                                 |  /api/auth   · identity     |
                                 |  /o          · OIDC/OAuth2  |
                                 |  /api/users  · admin CRUD   |
                                 +--------------+--------------+
                                                │
                                                ▼
                                       PostgreSQL (Drizzle)
```

---

## Implemented Features

### Authentication — `/api/auth`
- Email + password signup and login (bcryptjs hashed)
- Logout with JWT revocation via `jti` (stateless tokens, DB-backed revocation list)
- Refresh-token rotation with SHA-256 hashed storage
- Email verification (request + verify endpoints) via signed JWT
- Forgot password and reset password via signed reset JWT
- Authenticated profile read
- Avatar upload via Multer → ImageKit
- Role-based middleware: `restrictToAuthenticatedUser`, `restrictTo(...roles)`
- Global `authenticate()` middleware that decodes the bearer token, checks the revocation list, and attaches `req.user`

### OIDC / OAuth2 Provider — `/o`
- Discovery document at `/.well-known/openid-configuration`
- JWKS endpoint at `/o/jwks.json` (RSA public key)
- **PKCE flow** for SPAs and mobile: `/o/authorize` → `/o/consent` → `/o/token` with `code_verifier` ↔ `code_challenge` (SHA-256) verification
- **Shortcode flow** for backend RPs: login with `?client_id=…` → `/o/consent` → `/o/access-token?short_code=…&client_secret=…`
- Consent screen wiring via short-lived consent JWT (5 min) bound to `client_id`
- Token introspection (RFC 7662) at `/o/introspect`
- Token revocation (RFC 7009) at `/o/revoke` (access tokens and refresh tokens)
- Authenticated `/o/userInfo` and `/o/token` claims read

### Developer Dashboard (OAuth client management) — `/o`
- `POST /o/register-client` — register an application (admin only)
- `GET /o/applications` — list (admin sees own, super_admin sees all)
- `GET /o/application/:id`
- `PATCH /o/applications/:id` — update name / redirect URI
- `POST /o/rotate-secret/:id` — rotate `client_secret`
- `DELETE /o/delete-client/:id` — super_admin only
- Plain `client_secret` is returned **only once** at creation/rotation; only the SHA-256 hash is persisted

### User Management — `/api/users`
- `GET /api/users` — list all users (super_admin)
- `GET /api/users/:id` — own profile or any (super_admin)
- `PATCH /api/users/:id` — profile updates; only super_admin can change `role`
- `DELETE /api/users/:id` — super_admin only
- `POST /api/users/:id/revoke-sessions` — invalidate a user's tokens
- Never returns `password`, `refreshToken`, `resetToken`, or `verificationToken`

### Frontend (`oidc-auth`)
- File-based routes via TanStack Router: `login`, `signup`, `forgot-password`, `reset-password`, `verify-email`, `authorize` (PKCE entry), `docs`, marketing pages
- Authenticated dashboard at `/dashboard` with sub-pages for `applications` (list / detail / new), `users`, `profile`, `tokens`, `sessions`, `settings`
- Server-side data flow with TanStack Query + Axios services in `src/services/`
- TailwindCSS v4 + shadcn/ui components

---

## Roles & Access

| Role | Capabilities |
| --- | --- |
| `user` | Default. Read/update own profile, complete OIDC consent flows |
| `admin` | Register and manage their own OAuth applications |
| `super_admin` | Full access across all users and applications |

See the full matrix in [`sds.md` § 12](./sds.md).

---

## Database Schema (Drizzle)

Tables defined in [`auth-ts/src/db/schema.ts`](./auth-ts/src/db/schema.ts):

- `users` — accounts, hashed password, hashed verification/refresh/reset tokens, role enum (`super_admin` / `admin` / `user`)
- `applications` — registered OAuth clients (owner, name, url, redirect URI, `client_id`, hashed `client_secret`)
- `shortcodes` — single 6-char code per `(user_id, client_id)` pair for the non-PKCE flow (upserted on re-consent)
- `revoked_tokens` — `(jti, exp)` rows so logout / revoke can invalidate unexpired JWTs
- `authorization_codes` — 64-char PKCE codes with `code_challenge`, `algorithm`, `used`, and a 5-minute `expires_at`; expired/used rows are cleaned on every server startup

Migrations live in [`auth-ts/drizzle/`](./auth-ts/drizzle).

---

## Getting Started

### Prerequisites
- Node.js (ESM-capable, v20+ recommended)
- PostgreSQL 17 (a `docker-compose.yml` is provided in `auth-ts/`)
- SMTP credentials for email (Nodemailer) and ImageKit credentials for avatar uploads

### 1. Start PostgreSQL

```bash
cd auth-ts
docker compose up -d
```

### 2. Run the backend (`auth-ts`)

```bash
cd auth-ts
npm install
cp .env.example .env   # then fill in the values listed below
npm run db:push        # apply Drizzle schema to the database
npm run dev            # tsc-watch + node dist/index
```

Default port: `9000`. Health check: `GET /health`.

Required environment variables (validated by Zod at startup — see [`sds.md` § 5](./sds.md)):

```
PORT, NODE_ENV, POSTGRES_URI, BASE_URL, CLIENT_URL, ISSUER_URL,
JWT_ACCESS_TOKEN_SECRET,  JWT_ACCESS_TOKEN_EXPIRES,
JWT_REFRESH_TOKEN_SECRET, JWT_REFRESH_TOKEN_EXPIRES,
JWT_VERIFY_TOKEN_SECRET,  JWT_VERIFY_TOKEN_EXPIRES,
JWT_RESET_TOKEN_SECRET,   JWT_RESET_TOKEN_EXPIRES,
JWT_CONSENT_TOKEN_SECRET, JWT_CONSENT_TOKEN_EXPIRES,
NODEMAILER_SMTP_HOST, NODEMAILER_PORT,
NODEMAILER_EMAIL_USER, NODEMAILER_EMAIL_PASSWORD,
IMAGEKIT_PUBLIC_KEY, IMAGEKIT_PRIVATE_KEY
```

An RSA keypair is needed to sign JWKS-published tokens. Generate it with:

```bash
cd auth-ts
./key-gen.sh
```

Drizzle scripts:

```bash
npm run db:generate   # generate a new migration from schema.ts
npm run db:migrate    # apply pending migrations
npm run db:push       # push schema directly (dev only)
npm run db:studio     # open Drizzle Studio
```

### 3. Run the frontend (`oidc-auth`)

```bash
cd oidc-auth
npm install
npm run dev            # vite dev on port 3000
```

Other scripts: `npm run build`, `npm run preview`, `npm run test` (Vitest), `npm run lint`, `npm run format`.

---

## OAuth2 Flows

### Non-PKCE (backend RPs that can hold a `client_secret`)

```
1.  User -> RP -> redirect to gatekeeper frontend
2.  POST /api/auth/login?client_id=<id>          -> { consentToken, applicationName, scopes }
3.  Show consent UI -> POST /o/consent           -> { redirectUriWithShortcode }
4.  Browser -> RP callback ?code=<shortcode>
5.  RP backend: GET /o/access-token?short_code=...&client_secret=...   -> { accessToken }
```

### PKCE (SPAs and mobile apps — no client secret)

```
1.  SPA generates code_verifier + code_challenge = SHA-256(verifier)
2.  GET /o/authorize?client_id=...&code_challange=...&algorithm=SHA-256   -> redirected to frontend
3.  POST /api/auth/login?client_id=...           -> { consentToken }
4.  POST /o/consent (with code_challange)        -> { redirectUriWithShortcode } (64-char code)
5.  POST /o/token { code, client_id, code_verifier, algorithm }   -> { accessToken, refreshToken }
```

Scopes are fixed for the MVP: `["openid", "email", "profile"]`.

---

## Security Notes

- Tokens are never stored in plain text — only SHA-256 hashes hit the database. Plain tokens (and `client_secret`) are returned once at issue time and are not recoverable.
- Access tokens carry a UUID `jti`; logout and `/o/revoke` add `(jti, exp)` to `revoked_tokens`, and every request is checked against this list in `authenticate()`.
- Refresh tokens rotate on every use; the old hash is replaced.
- PKCE codes are 64 chars, single-use, and expire after 5 minutes. Expired/used codes are cleaned on server startup.
- All request payloads, params, query strings, and uploads are validated by Zod via a unified `validate(schema)` middleware. Environment variables are also validated at startup; the server exits on missing config.

---

## Planned / Not Yet Implemented

From [`prd.md`](./prd.md) and [`sds.md` § 13](./sds.md):

- **Session management** — `sessions` table, device tracking, list/revoke sessions
- **RBAC** — granular `roles`, `permissions`, `role_permissions`, `user_roles`
- **Organizations** — multi-tenant orgs with member invites and org-scoped roles
- **Audit logs** — write-side hooks recording login, password change, role assignment, token issue, consent grant
- **Social login** and **MFA**

---

## Project Layout

```
gatekeeper/
├── auth-ts/             # Express API — identity + OIDC provider
│   ├── src/
│   │   ├── app/
│   │   │   ├── common/        # shared config, utils, zod, error handling
│   │   │   └── module/
│   │   │       ├── auth/      # /api/auth — register, login, refresh, verify, reset
│   │   │       ├── oidc/      # /o       — authorize, consent, token, revoke, introspect, clients
│   │   │       └── users/     # /api/users — admin CRUD
│   │   ├── db/                # Drizzle schema + client
│   │   └── index.ts           # startup: cleanExpiredAuthCodes() + HTTP server
│   ├── drizzle/               # generated SQL migrations
│   ├── certs/                 # RSA keypair (gitignored)
│   └── docker-compose.yml     # Postgres 17
│
├── oidc-auth/           # TanStack Start frontend
│   └── src/
│       ├── routes/            # file-based routes (login, signup, authorize, dashboard/*)
│       ├── components/        # shell + ui components
│       ├── services/          # axios + tanstack-query layers per module
│       └── router.tsx
│
├── sds.md               # Software Design Specification
└── prd.md               # Product Requirements Document
```
