# Software Design Specification — iLogin (auth-ts)

**Version:** 1.0  
**Date:** 2026-06-11  
**Stack:** Express 5 · TypeScript · PostgreSQL · Drizzle ORM  

---

## 1. Project Overview

iLogin is a self-hosted identity platform (IdP) — an alternative to Okta, Auth0, and Clerk. It provides:

- **Authentication** — register, login, logout, password reset, email verification
- **OIDC Provider** — OAuth2/OIDC consent flow, token exchange, revocation, introspection
- **Developer Dashboard** — application (client) registration and management
- **User Management** — admin-level CRUD over user accounts

The backend exposes two base paths:
- `/api/auth` — identity operations for end users
- `/api/users` — user management for administrators
- `/o` — OIDC/OAuth2 protocol endpoints

---

## 2. Architecture

```
src/
├── index.ts                    # Server entry — starts HTTP server
├── app/
│   ├── index.ts                # Express app factory — mounts routers + middleware
│   ├── common/
│   │   ├── constants.ts        # Shared enums and values
│   │   ├── config/
│   │   │   └── nodemailer.ts   # Email transport config
│   │   ├── utils/
│   │   │   ├── api-error.ts    # Typed error classes
│   │   │   ├── api-response.ts # Standardised JSON response helpers
│   │   │   ├── certs.ts        # RSA key pair (JWT signing)
│   │   │   ├── error.middleware.ts  # Global error handler
│   │   │   ├── imagekit.ts     # ImageKit file upload util
│   │   │   ├── jwt.ts          # Token generation/verification
│   │   │   └── multer.ts       # Multipart file parser
│   │   └── zod/
│   │       ├── env.ts          # Environment variable validation
│   │       └── zod.middleware.ts # Request validation middleware
│   └── module/
│       ├── auth/               # Authentication module
│       ├── oidc/               # OIDC/OAuth2 module
│       └── users/              # User management module
└── db/
    ├── index.ts                # Drizzle client
    └── schema.ts               # Table definitions
```

### Layer Responsibilities

| Layer | File pattern | Responsibility |
|---|---|---|
| Router | `*.route.ts` | Route declarations, middleware chain |
| Controller | `*.controller.ts` | Read request, call service, write response |
| Service | `*.service.ts` | Business logic, permission checks |
| Utils | `*.utils.ts` | Direct DB queries, no business logic |
| Schema | `*.schema.ts` | Zod validation schemas |
| Types | `*.types.ts` | Shared TypeScript types |

---

## 3. Technology Stack

| Concern | Choice |
|---|---|
| Runtime | Node.js (ESM) |
| Framework | Express 5 |
| Language | TypeScript (`strict`, `exactOptionalPropertyTypes: true`) |
| Database | PostgreSQL |
| ORM | Drizzle ORM |
| Validation | Zod |
| Auth tokens | jsonwebtoken (RS256 / HS256) |
| Password hashing | bcryptjs |
| Token hashing | SHA-256 (Node `crypto`) |
| File uploads | Multer + ImageKit |
| Email | Nodemailer (SMTP) |

---

## 4. Database Schema

### 4.1 `users`

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` PK | Auto-generated |
| `name` | `varchar(255)` | Required |
| `email` | `varchar(255)` | Required, unique |
| `role` | `user_role` enum | Default `user` |
| `password` | `text` | bcryptjs hash |
| `is_verified` | `boolean` | Default `false` |
| `verification_token` | `text` | SHA-256 hash of JWT |
| `refresh_token` | `text` | SHA-256 hash of latest refresh JWT |
| `reset_token` | `text` | SHA-256 hash of reset JWT |
| `avatar` | `text` | ImageKit URL |
| `created_at` | `timestamp` | Auto |
| `updated_at` | `timestamp` | Auto-updated on every write |

**Role enum:** `super_admin` · `admin` · `user`

### 4.2 `applications`

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` PK | Auto-generated |
| `user_id` | `uuid` FK → `users.id` | Owner of the application |
| `name` | `varchar(255)` | Display name |
| `url` | `text` | Unique application URL |
| `redirect_uri` | `text` | OAuth2 callback URL |
| `client_id` | `text` | 32-char random hex, public |
| `client_secret` | `text` | SHA-256 hash of 64-char random hex |
| `created_at` | `timestamp` | Auto |
| `updated_at` | `timestamp` | Auto-updated on every write |

### 4.3 `shortcodes`

Temporary single-use codes that bridge the consent flow to the token exchange.

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` PK | Auto-generated |
| `user_id` | `uuid` FK → `users.id` | |
| `shortcode` | `varchar(6)` | 6-char random hex |
| `client_id` | `text` | Owning application |

One row per `(user_id, client_id)` pair — updated in place on re-consent.

### 4.4 `revoked_tokens`

Used to implement access token revocation without a stateful session store.

| Column | Type | Notes |
|---|---|---|
| `jti` | `text` PK | JWT ID claim from access token |
| `exp` | `timestamp` | Token expiry — for future cleanup jobs |

---

## 5. Environment Variables

All variables are validated at startup via Zod. The server exits immediately if any are missing.

| Variable | Description |
|---|---|
| `PORT` | HTTP listen port (default `9000`) |
| `NODE_ENV` | `development` / `production` / `test` |
| `POSTGRES_URI` | PostgreSQL connection string |
| `BASE_URL` | Public server URL (e.g. `https://auth.example.com`) |
| `CLIENT_URL` | Frontend app URL |
| `ISSUER_URL` | OIDC issuer string |
| `JWT_ACCESS_TOKEN_SECRET` | HS256 secret for access tokens |
| `JWT_ACCESS_TOKEN_EXPIRES` | Access token TTL (e.g. `15m`) |
| `JWT_REFRESH_TOKEN_SECRET` | HS256 secret for refresh tokens |
| `JWT_REFRESH_TOKEN_EXPIRES` | Refresh token TTL (e.g. `7d`) |
| `JWT_VERIFY_TOKEN_SECRET` | HS256 secret for email verification tokens |
| `JWT_VERIFY_TOKEN_EXPIRES` | Verification token TTL (e.g. `5m`) |
| `JWT_RESET_TOKEN_SECRET` | HS256 secret for password reset tokens |
| `JWT_RESET_TOKEN_EXPIRES` | Reset token TTL (e.g. `15m`) |
| `JWT_CONSENT_TOKEN_SECRET` | HS256 secret for OIDC consent tokens |
| `JWT_CONSENT_TOKEN_EXPIRES` | Consent token TTL (e.g. `5m`) |
| `NODEMAILER_SMTP_HOST` | SMTP hostname |
| `NODEMAILER_PORT` | SMTP port |
| `NODEMAILER_EMAIL_USER` | Sender email address |
| `NODEMAILER_EMAIL_PASSWORD` | SMTP password |
| `IMAGEKIT_PUBLIC_KEY` | ImageKit public key |
| `IMAGEKIT_PRIVATE_KEY` | ImageKit private key |

---

## 6. Authentication & Security Model

### 6.1 Global Middleware Chain

Every request passes through `authenticate()` before reaching any route handler.

```
Request
  └── authenticate()           # Reads Authorization: Bearer <token>
        ├── No header → next() # Unauthenticated, public routes still work
        ├── Invalid format → 401
        ├── verifyAccessToken() → decodes JWT
        ├── isTokenRevoked(jti) → DB check → 401 if found
        └── Sets req.user → next()
```

### 6.2 Route-Level Guards

| Middleware | Purpose |
|---|---|
| `restrictToAuthenticatedUser()` | Requires `req.user` to be set (any authenticated user) |
| `restrictTo(...roles)` | Requires `req.user.role` to be in the allowed list |

### 6.3 Roles

| Role | Description |
|---|---|
| `user` | Default. Can only access own data |
| `admin` | Can register/manage own applications |
| `super_admin` | Full access across all users and applications |

### 6.4 Token Architecture

| Token | Algorithm | Storage | Purpose |
|---|---|---|---|
| Access token | HS256 JWT | Client memory | API authentication. Contains `jti` (UUID) for revocation |
| Refresh token | HS256 JWT | DB (SHA-256 hashed) | Issue new access tokens without re-login |
| Email verification token | HS256 JWT | DB (SHA-256 hashed) | Verify email ownership |
| Password reset token | HS256 JWT | DB (SHA-256 hashed) | Authorise password change |
| Consent token | HS256 JWT | Client (short-lived) | Binds a login session to an OIDC consent request |

**Access token payload (`AccessTokenPayload`):**
```json
{
  "iss": "https://auth.example.com",
  "sub": "<user-uuid>",
  "email": "user@example.com",
  "email_verified": true,
  "name": "Jane Doe",
  "picture": "https://cdn.imagekit.io/...",
  "role": "user",
  "jti": "<uuid-v4>",
  "iat": 1234567890,
  "exp": 1234568790
}
```

**Token storage rules:**
- Tokens are never stored in plain text in the database.
- Only SHA-256 hashes are stored.
- The plain token is returned to the client once and never re-derivable from the DB.
- Client secrets follow the same rule — plain secret returned only at creation/rotation time.

### 6.5 Token Revocation

On logout, the `jti` + `exp` of the current access token are inserted into `revoked_tokens`. Every subsequent request using that token is rejected at the `authenticate()` middleware layer, even if the JWT itself has not expired yet.

---

## 7. Request Validation

All route validation uses a unified Zod middleware:

```typescript
validate(schema)
// schema shape: { body?, params?, query?, file? }
```

The middleware builds `{ body, params, query, file }` from the request, runs `safeParseAsync`, and writes validated + stripped values back onto the request object. A failed parse throws `ValidationError (400)` with field-level error details.

---

## 8. API Reference

### 8.1 Auth Module — `/api/auth`

---

#### `POST /api/auth/register`

Register a new user account.

**Access:** Public

**Query params:**
| Param | Required | Description |
|---|---|---|
| `client_id` | No | If provided, initiates an OIDC consent flow instead of direct login |

**Request body:**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "minimum8chars",
  "role": "user"
}
```

**Validation:**
- `name`: string, 2–50 chars
- `email`: valid email, lowercased
- `password`: string, 8–100 chars
- `role`: one of `user` | `admin` | `super_admin`, defaults to `user`

**Response (no `client_id`) — 201:**
```json
{
  "success": true,
  "message": "User created successfully",
  "data": { "id": "<uuid>", "accessToken": "<jwt>" }
}
```

**Response (with `client_id`) — 201:**
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "consentToken": "<jwt>",
    "applicationName": "My App",
    "scopes": ["openid", "email", "profile"]
  }
}
```

**Errors:** `409 Conflict` if email already exists.

---

#### `POST /api/auth/login`

Authenticate an existing user.

**Access:** Public

**Query params:**
| Param | Required | Description |
|---|---|---|
| `client_id` | No | If provided, initiates OIDC consent flow |

**Request body:**
```json
{
  "email": "jane@example.com",
  "password": "minimum8chars"
}
```

**Response (no `client_id`) — 201:**
```json
{
  "data": { "id": "<uuid>", "accessToken": "<jwt>" }
}
```

**Response (with `client_id`) — 201:**
```json
{
  "data": {
    "consentToken": "<jwt>",
    "applicationName": "My App",
    "scopes": ["openid", "email", "profile"]
  }
}
```

**Errors:** `401 Unauthorized` on invalid credentials.

---

#### `POST /api/auth/logout`

Revoke the current access token and clear the refresh token.

**Access:** Authenticated (`restrictToAuthenticatedUser`)

**Headers:** `Authorization: Bearer <access_token>`

**Response — 200:**
```json
{ "success": true, "message": "User logout successfully" }
```

**Side effects:**
- Inserts `(jti, exp)` into `revoked_tokens`
- Sets `refresh_token = null` in DB

---

#### `POST /api/auth/refresh`

Issue a new access token and refresh token using a valid refresh token.

**Access:** Public

**Request body:**
```json
{ "refreshToken": "<refresh_jwt>" }
```

**Response — 200:**
```json
{
  "data": {
    "accessToken": "<new_access_jwt>",
    "refreshToken": "<new_refresh_jwt>"
  }
}
```

**Errors:** `401` if token is invalid or not found in DB (hashed lookup).

**Security:** Implements refresh token rotation — old token is replaced on every use.

---

#### `POST /api/auth/verify`

Verify a user's email address using the verification token.

**Access:** Public

**Request body:**
```json
{ "token": "<email_verification_jwt>" }
```

**Response — 201:**
```json
{
  "data": { "id": "<uuid>", "email": "...", "isVerified": true }
}
```

**Errors:** `400` if token is expired or does not match the stored hash.

---

#### `GET /api/auth/verify-email-request`

Send a new verification email to the authenticated user.

**Access:** Authenticated

**Headers:** `Authorization: Bearer <access_token>`

**Response — 200:**
```json
{ "message": "Email Sent to jane@example.com successfully", "data": {} }
```

> In `development` mode only, the response also includes `emailVerificationToken` for local testing.

---

#### `POST /api/auth/forgot-password`

Send a password reset email.

**Access:** Public

**Request body:**
```json
{ "email": "jane@example.com" }
```

**Response — 200:**
```json
{ "message": "Email sent", "data": {} }
```

> In `development` mode only, `resetToken` is included in the response.

**Errors:** `404` if email not found.

---

#### `POST /api/auth/reset-password`

Reset a user's password using the reset token.

**Access:** Public

**Query params:**
| Param | Required | Description |
|---|---|---|
| `token` | Yes | Reset JWT from the email link |

**Request body:**
```json
{ "password": "newpassword123" }
```

**Response — 200:**
```json
{ "data": { "id": "<uuid>" } }
```

**Errors:** `400` if token is expired or tampered.

---

#### `GET /api/auth/profile`

Get the authenticated user's profile.

**Access:** Authenticated

**Response — 200:**
```json
{
  "data": {
    "user": {
      "id": "<uuid>", "name": "Jane Doe", "email": "jane@example.com",
      "isEmailVerified": true, "avatar": "https://...", "role": "user"
    }
  }
}
```

---

#### `POST /api/auth/upload`

Upload a user avatar image.

**Access:** Authenticated

**Content-Type:** `multipart/form-data`

**Form field:** `avatar` — image file (PNG / JPEG, max 5 MB)

**Response — 200:**
```json
{ "data": { "id": "<uuid>", "avatarUrl": "https://cdn.imagekit.io/..." } }
```

---

### 8.2 OIDC Module — `/o`

---

#### `GET /o/jwks.json`

Returns the public JSON Web Key Set for verifying access tokens.

**Access:** Public

**Response — 200:**
```json
{ "keys": [{ "kty": "RSA", "n": "...", "e": "AQAB", ... }] }
```

---

#### `GET /.well-known/openid-configuration`

OIDC service discovery document.

**Access:** Public

**Response — 200:**
```json
{
  "issuer": "https://auth.example.com",
  "authorization_endpoint": "https://auth.example.com/o/authorize",
  "token_endpoint": "https://auth.example.com/o/token",
  "userinfo_endpoint": "https://auth.example.com/o/userinfo",
  "jwks_uri": "https://auth.example.com/o/jwks.json"
}
```

---

#### `GET /o/authorize`

OIDC authorization endpoint. Currently redirects to the frontend client URL.

**Access:** Public

> Full PKCE + authorization code flow is pending (Module 2).

---

#### `POST /o/consent`

Exchange a consent token for a shortcode and redirect URI.

**Access:** Public (token carries identity)

**Request body:**
```json
{
  "consent_token": "<consent_jwt>",
  "client_id": "abc123"
}
```

**Validation:**
- `consent_token`: non-empty string
- `client_id`: non-empty string

**Response — 200:**
```json
{
  "data": {
    "redirectUriWithShortcode": "https://app.example.com/callback?shortcode=a1b2c3"
  }
}
```

**Business rules:**
1. Decodes and verifies `consent_token` (5-min TTL, secret-signed)
2. Confirms `token.type === "consent"` and `token.clientId === client_id`
3. Generates a 6-char random shortcode
4. Upserts `shortcodes` table (one row per user+client pair)
5. Returns `redirectUri?shortcode=<code>`

**Errors:** `400` if token type is wrong or `client_id` does not match token.

---

#### `GET /o/access-token`

Exchange a shortcode for an access token (back-channel, called by the relying party server).

**Access:** Public (credentials in query)

**Query params:**
| Param | Required | Description |
|---|---|---|
| `short_code` | Yes | Shortcode from the consent redirect |
| `client_secret` | Yes | Plain client secret of the application |

**Response — 200:**
```json
{ "data": { "id": "<user-uuid>", "accessToken": "<jwt>" } }
```

**Business rules:**
1. Hashes `client_secret` (SHA-256), joins `shortcodes` + `applications` on `clientId`, verifies the stored hash matches
2. Loads full user record
3. Generates access token with standard claims
4. Generates and stores new hashed refresh token
5. Returns access token

---

#### `POST /o/revoke`

Revoke an access or refresh token (RFC 7009).

**Access:** Public (requires client credentials)

**Request body:**
```json
{
  "token": "<token_to_revoke>",
  "token_type_hint": "access_token",
  "client_id": "abc123",
  "client_secret": "<plain_secret>"
}
```

**Validation:** `token_type_hint` is optional; accepted values: `access_token` | `refresh_token`.

**Business rules:**
- Verifies client credentials (hashed secret match) before accepting any revocation
- If `access_token`: decodes JWT, inserts `jti` into `revoked_tokens`
- If `refresh_token` (or no hint): SHA-256 hashes token, nulls it in `users.refresh_token`; falls back to access token revocation if no match found

**Response — 200:**
```json
{ "message": "Token revoked successfully" }
```

---

#### `POST /o/introspect`

Inspect the validity of a token (RFC 7662).

**Access:** Public (requires client credentials)

**Request body:**
```json
{
  "token": "<access_token>",
  "client_id": "abc123",
  "client_secret": "<plain_secret>"
}
```

**Response (active) — 200:**
```json
{
  "data": {
    "active": true,
    "sub": "<uuid>", "email": "jane@example.com",
    "name": "Jane Doe", "picture": "...", "role": "user",
    "iss": "https://auth.example.com",
    "exp": 1234568790, "iat": 1234567890, "jti": "<uuid>"
  }
}
```

**Response (inactive) — 200:**
```json
{ "data": { "active": false } }
```

**Business rules:** Returns `active: false` for expired, tampered, or revoked tokens — never an error response, per RFC 7662.

---

#### `GET /o/userInfo`

Returns the authenticated user's profile claims.

**Access:** Authenticated

**Response — 200:**
```json
{ "data": { "user": { ... } } }
```

---

#### `GET /o/token`

Returns the current session's decoded token claims.

**Access:** Authenticated

**Response — 200:**
```json
{ "data": { "sub": "...", "email": "...", "role": "...", ... } }
```

---

#### `POST /o/register-client`

Register a new OAuth2 application.

**Access:** Authenticated, `admin` role required

**Request body:**
```json
{
  "applicationDisplayName": "My App",
  "applicationUrl": "https://myapp.com",
  "redirectUri": "https://myapp.com/callback"
}
```

**Response — 201:**
```json
{
  "data": {
    "id": "<uuid>",
    "applicationDisplayName": "My App",
    "applicationURL": "https://myapp.com",
    "redirectURI": "https://myapp.com/callback",
    "clientId": "<32-char-hex>",
    "clientSecret": "<64-char-hex-PLAIN>"
  }
}
```

> The plain `clientSecret` is returned **once only**. Store it securely — it cannot be recovered. Only the SHA-256 hash is stored in the database.

**Errors:** `400` if an application with the same URL already exists for the user; `400` if email is not verified.

---

#### `GET /o/applications`

List all applications visible to the current user.

**Access:** Authenticated, `admin` or `super_admin`

**Response — 200:**
```json
{
  "data": [
    { "id": "...", "name": "...", "url": "...", "redirectUri": "...", "clientId": "..." }
  ]
}
```

**Business rules:** `super_admin` sees all applications; `admin` sees only their own.

---

#### `GET /o/application/:id`

Get details of a single application.

**Access:** Authenticated, `admin` or `super_admin`

**Response — 200:**
```json
{
  "data": {
    "id": "...", "name": "...", "url": "...",
    "redirectUri": "...", "clientId": "...",
    "createdAt": "...", "updatedAt": "..."
  }
}
```

**Business rules:** `super_admin` can view any application; `admin` can only view their own.

---

#### `PATCH /o/applications/:id`

Update an application's name or redirect URI.

**Access:** Authenticated, `admin` or `super_admin`

**Request body (at least one field required):**
```json
{
  "name": "New Name",
  "redirectUri": "https://myapp.com/new-callback"
}
```

**Response — 200:**
```json
{
  "data": { "id": "...", "name": "...", "url": "...", "redirectUri": "...", "clientId": "..." }
}
```

**Business rules:** `super_admin` can update any application; `admin` can only update their own.

---

#### `POST /o/rotate-secret/:id`

Rotate an application's client secret. Returns a new plain secret — store it immediately.

**Access:** Authenticated, `admin` or `super_admin`

**Response — 200:**
```json
{
  "data": {
    "id": "<uuid>",
    "clientId": "<32-char-hex>",
    "clientSecret": "<64-char-hex-PLAIN>"
  }
}
```

> The old secret is immediately invalidated. Any integration using the old secret will stop working.

**Business rules:** `super_admin` can rotate any application's secret; `admin` can only rotate their own.

---

#### `DELETE /o/delete-client/:id`

Permanently delete an application.

**Access:** Authenticated, `super_admin` only

**Response — 200:**
```json
{ "message": "Application with id <id> is deleted successfully" }
```

---

### 8.3 Users Module — `/api/users`

All routes require authentication (`restrictToAuthenticatedUser` is applied at the router level).

---

#### `GET /api/users`

List all user accounts.

**Access:** `super_admin` only

**Response — 200:**
```json
{
  "data": [
    {
      "id": "<uuid>", "name": "Jane Doe", "email": "jane@example.com",
      "role": "user", "avatar": null, "isVerified": true,
      "createdAt": "...", "updatedAt": "..."
    }
  ]
}
```

> Never exposes `password`, `refreshToken`, `resetToken`, or `verificationToken`.

---

#### `GET /api/users/:id`

Get a single user by ID.

**Access:** Authenticated

**Response — 200:**
```json
{
  "data": {
    "id": "...", "name": "...", "email": "...", "role": "...",
    "avatar": "...", "isVerified": true, "createdAt": "...", "updatedAt": "..."
  }
}
```

**Business rules:**
- `super_admin` can fetch any user
- `admin` and `user` can only fetch their own ID — otherwise `401`

---

#### `PATCH /api/users/:id`

Update a user's profile fields.

**Access:** Authenticated

**Request body (at least one field required):**
```json
{
  "name": "New Name",
  "email": "new@example.com",
  "role": "admin"
}
```

**Response — 200:**
```json
{
  "data": { "id": "...", "name": "...", "email": "...", "role": "...", ... }
}
```

**Business rules:**
- `super_admin` can update any user, including changing their `role`
- `admin` / `user` can only update their own profile
- `admin` / `user` attempting to change `role` → `401`

---

#### `DELETE /api/users/:id`

Permanently delete a user account.

**Access:** `super_admin` only

**Response — 200:**
```json
{ "message": "User <id> deleted successfully" }
```

**Errors:** `404` if user not found.

---

## 9. OIDC Consent Flow

The consent flow bridges a standard web login with an OAuth2 relying party integration.

```
1. User visits Relying Party (RP) → clicks "Login with iLogin"
2. RP redirects user to iLogin frontend

3. User logs in via POST /api/auth/login?client_id=<id>
   └── Server returns: { consentToken, applicationName, scopes }

4. Frontend shows consent screen:
   "Allow <applicationName> to access: openid, email, profile"
   [Allow] [Cancel]

5a. User clicks Allow → POST /o/consent
    Body: { consent_token, client_id }
    └── Server returns: { redirectUriWithShortcode: "https://app.com/cb?shortcode=abc123" }

5b. User clicks Cancel → frontend closes modal, no server call

6. Frontend redirects browser to redirectUriWithShortcode

7. RP backend receives shortcode → GET /o/access-token?short_code=abc123&client_secret=<secret>
   └── Server returns: { id, accessToken }

8. RP stores accessToken, user is logged in
```

**Scopes are fixed for MVP:** `["openid", "email", "profile"]` — every application gets all three.

---

## 10. Error Response Format

All errors are handled by the global `errorMiddleWare`.

```json
{
  "message": "Human-readable error description",
  "details": {
    "code": "ERROR_CODE",
    "error": "Stack trace or detail (development only)"
  }
}
```

In `production`, `message` is replaced with `"Internal Server Error"` and `error` with `"An unexpected error occurred"` for any unhandled 5xx.

### Error Classes

| Class | Status | Code |
|---|---|---|
| `ValidationError` | 400 | `VALIDATION_ERROR` |
| `BadRequestError` | 400 | `BAD_REQUEST` |
| `UnauthorizedError` | 401 | `UNAUTHORIZED` |
| `ForbiddenError` | 403 | `FORBIDDEN` |
| `NotFoundError` | 404 | `NOT_FOUND` |
| `ConflictError` | 409 | `CONFLICT` |
| `InternalServerError` | 500 | `INTERNAL_SERVER_ERROR` |

---

## 11. Success Response Format

```json
{
  "success": true,
  "message": "Human-readable success description",
  "data": { ... }
}
```

| Method | Status |
|---|---|
| `ApiResponse.success()` | 200 |
| `ApiResponse.created()` | 201 |

---

## 12. Access Control Matrix

| Route | `user` | `admin` | `super_admin` |
|---|---|---|---|
| `POST /api/auth/register` | ✅ | ✅ | ✅ |
| `POST /api/auth/login` | ✅ | ✅ | ✅ |
| `POST /api/auth/logout` | ✅ | ✅ | ✅ |
| `POST /api/auth/refresh` | ✅ | ✅ | ✅ |
| `POST /api/auth/verify` | ✅ | ✅ | ✅ |
| `GET /api/auth/verify-email-request` | ✅ | ✅ | ✅ |
| `POST /api/auth/forgot-password` | ✅ | ✅ | ✅ |
| `POST /api/auth/reset-password` | ✅ | ✅ | ✅ |
| `GET /api/auth/profile` | ✅ | ✅ | ✅ |
| `POST /api/auth/upload` | ✅ | ✅ | ✅ |
| `GET /o/jwks.json` | ✅ | ✅ | ✅ |
| `GET /.well-known/openid-configuration` | ✅ | ✅ | ✅ |
| `POST /o/consent` | ✅ | ✅ | ✅ |
| `GET /o/access-token` | ✅ | ✅ | ✅ |
| `POST /o/revoke` | ✅ | ✅ | ✅ |
| `POST /o/introspect` | ✅ | ✅ | ✅ |
| `GET /o/userInfo` | ✅ | ✅ | ✅ |
| `GET /o/token` | ✅ | ✅ | ✅ |
| `POST /o/register-client` | ❌ | ✅ own | ✅ any |
| `GET /o/applications` | ❌ | ✅ own | ✅ all |
| `GET /o/application/:id` | ❌ | ✅ own | ✅ any |
| `PATCH /o/applications/:id` | ❌ | ✅ own | ✅ any |
| `POST /o/rotate-secret/:id` | ❌ | ✅ own | ✅ any |
| `DELETE /o/delete-client/:id` | ❌ | ❌ | ✅ any |
| `GET /api/users` | ❌ | ❌ | ✅ |
| `GET /api/users/:id` | ✅ own | ✅ own | ✅ any |
| `PATCH /api/users/:id` | ✅ own (no role) | ✅ own (no role) | ✅ any + role |
| `DELETE /api/users/:id` | ❌ | ❌ | ✅ any |

---

## 13. Pending / Planned (Not Yet Implemented)

| Module | Feature | Notes |
|---|---|---|
| Module 2 | `authorization_codes` DB table | Required for real OIDC flow |
| Module 2 | Rewrite `GET /o/authorize` | Full PKCE auth code flow |
| Module 2 | `POST /o/token` | Standard token endpoint |
| Module 2 | PKCE (`code_challenge` / `code_verifier`) | S256 method |
| Module 6 | Session management | `sessions` table, device tracking, `GET /sessions`, `POST /sessions/:id/revoke` |
| Module 7 | RBAC | `roles`, `permissions`, `role_permissions`, `user_roles` tables + APIs |
| Module 8 | Organizations | `organizations`, `organization_members`, `organization_roles` + APIs |
| Module 9 | Audit logs | `audit_logs` table + hooks on all write operations |
