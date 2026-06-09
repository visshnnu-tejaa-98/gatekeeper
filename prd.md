Product Vision
Product Name (Working)
iLogin (Tentative - Need to change later)
Problem Statement
Developers need a simple, self-hosted identity platform that provides:
Authentication
Authorization
OAuth2
OpenID Connect
User Management
Multi-tenancy
Social Login
SSO
Consent Management
without the complexity and cost of enterprise providers like:
Okta
Auth0
Clerk

Product Goals
Primary Goal
Provide a complete Identity Provider platform that allows developers to:
Create Applications
Configure OAuth Clients
Manage Users
Implement SSO
Integrate Social Login
Issue Access Tokens
Issue ID Tokens
Secondary Goal
Become a developer-friendly alternative to Clerk.

User Personas
Developer
Needs:
Login
Signup
OAuth Login
OIDC Login
MFA (later)

Organization Admin
Needs:
Invite users
Manage permissions
View audit logs
Configure SSO

End User
Needs:
Register
Login
Reset password
Manage profile
Manage sessions

MVP Scope

Module 1: Authentication
Features
Email Signup
Email Login
Password Hashing
Password Reset
Email Verification
Session Management
APIs
POST /auth/register
POST /auth/login
POST /auth/logout
POST /auth/forgot-password
POST /auth/reset-password
POST /auth/verify-email

Module 2: OIDC Provider
Discovery Endpoint
GET /.well-known/openid-configuration
Required Endpoints
GET /authorize
POST /token
GET /userinfo
GET /.well-known/jwks.json
POST /introspect
POST /revoke
Flows
Authorization Code Flow
PKCE
Refresh Tokens
Client Credentials

Module 3: Developer Dashboard
Like Clerk Dashboard.
Features
Create Application
Manage Redirect URIs
Generate Client ID
Generate Client Secret
Rotate Secrets
APIs
POST /applications
GET /applications
PATCH /applications/:id
DELETE /applications/:id

Module 4: User Management
Features
User Listing
User Search
Block User
Delete User
Email Verification Status
APIs
GET /users
GET /users/:id
PATCH /users/:id
DELETE /users/:id

Module 5: Consent Screen
Exactly what you asked about earlier.
Scenario
Application requests:
email
profile
openid
User sees:
My Todo App wants access to:

✓ Name
✓ Email
✓ Profile Photo

[Continue]
[Cancel]
APIs
GET /consent
POST /consent
Store:
user_consents
table.

Module 6: Session Management
Features
Active Sessions
Revoke Session
Device Tracking
Dashboard:
Chrome MacOS
Firefox Linux
Safari iPhone

Module 7: Roles & Permissions
RBAC
Tables:
roles
permissions
role_permissions
user_roles
Examples:
admin
developer
viewer

Module 8: Organizations
Like Clerk Organizations.
Features
Create Organization
Invite Members
Remove Members
Organization Roles
Tables
organizations
organization_members
organization_roles

Module 9: Audit Logs
Track:
User Login
Password Change
Role Assignment
Token Issued
Consent Granted
