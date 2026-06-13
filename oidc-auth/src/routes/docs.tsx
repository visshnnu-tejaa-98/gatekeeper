import * as React from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { MarketingLayout } from '@/components/shell/MarketingLayout'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { CopyButton } from '@/components/ui/CopyButton'
import {
  ArrowUpRight,
  Server,
  KeyRound,
  Users as UsersIcon,
  AppWindow,
  ChevronRight,
  Terminal,
  Sparkles,
  ShieldCheck,
  FileCode2,
  Zap,
  Lock,
} from 'lucide-react'

export const Route = createFileRoute('/docs')({ component: DocsPage })

const METHOD_TONE: Record<string, 'green' | 'blue' | 'orange' | 'red' | 'purple'> = {
  GET: 'green',
  POST: 'blue',
  PATCH: 'orange',
  DELETE: 'red',
  PUT: 'purple',
}

type EndpointAuth = 'Public' | 'Bearer' | 'Client creds' | 'admin' | 'super_admin' | 'self / super_admin' | 'admin / super_admin'

interface Endpoint {
  id: string
  method: keyof typeof METHOD_TONE
  path: string
  summary: string
  auth: EndpointAuth
  request?: object | string
  query?: Record<string, string>
  response?: object
  curl?: string
  notes?: string
}

interface Group {
  id: string
  title: string
  icon: typeof Server
  description: string
  endpoints: Endpoint[]
}

const BASE = 'https://your-instance.com'

const GROUPS: Group[] = [
  {
    id: 'auth',
    title: 'Authentication',
    icon: ShieldCheck,
    description: 'Register, sign in, refresh sessions, manage password & email verification.',
    endpoints: [
      {
        id: 'register',
        method: 'POST',
        path: '/api/auth/register',
        summary: 'Create a new user account',
        auth: 'Public',
        request: {
          name: 'Jane Doe',
          email: 'jane@example.com',
          password: 'minimum8chars',
        },
        query: { client_id: 'Optional · triggers OIDC consent flow' },
        response: {
          success: true,
          message: 'User created successfully',
          data: { id: 'd28a…', accessToken: 'eyJhbGc…' },
        },
        curl: `curl -X POST ${BASE}/api/auth/register \\
  -H 'Content-Type: application/json' \\
  -d '{
    "name": "Jane Doe",
    "email": "jane@example.com",
    "password": "supersecret"
  }'`,
      },
      {
        id: 'login',
        method: 'POST',
        path: '/api/auth/login',
        summary: 'Authenticate with email + password',
        auth: 'Public',
        request: { email: 'jane@example.com', password: 'supersecret' },
        query: { client_id: 'Optional · starts OIDC consent flow' },
        response: {
          success: true,
          message: 'User loggedin successfully',
          data: { id: 'd28a…', accessToken: 'eyJhbGc…' },
        },
        curl: `curl -X POST ${BASE}/api/auth/login \\
  -H 'Content-Type: application/json' \\
  -d '{ "email": "jane@example.com", "password": "supersecret" }'`,
      },
      {
        id: 'logout',
        method: 'POST',
        path: '/api/auth/logout',
        summary: 'Revoke access token + clear refresh',
        auth: 'Bearer',
        response: { success: true, message: 'User logout successfully', data: {} },
        curl: `curl -X POST ${BASE}/api/auth/logout \\
  -H 'Authorization: Bearer eyJhbGc…'`,
        notes: 'Inserts the access token jti into the revocation list. Future requests with this token return 401.',
      },
      {
        id: 'refresh',
        method: 'POST',
        path: '/api/auth/refresh',
        summary: 'Rotate refresh token + issue new access token',
        auth: 'Public',
        request: { refreshToken: 'eyJhbGc…' },
        response: {
          success: true,
          data: { accessToken: 'eyJhbGc…', refreshToken: 'eyJhbGc…' },
        },
      },
      {
        id: 'verify',
        method: 'POST',
        path: '/api/auth/verify',
        summary: 'Verify email with token from email link',
        auth: 'Public',
        request: { token: '<verification-jwt>' },
        response: { data: { id: 'd28a…', email: 'jane@example.com', isVerified: true } },
      },
      {
        id: 'verify-request',
        method: 'GET',
        path: '/api/auth/verify-email-request',
        summary: 'Send a verification email to current user',
        auth: 'Bearer',
        response: { message: 'Email Sent to jane@example.com successfully', data: {} },
        notes: 'In development mode the verification token is also returned in the body.',
      },
      {
        id: 'forgot',
        method: 'POST',
        path: '/api/auth/forgot-password',
        summary: 'Trigger password reset email',
        auth: 'Public',
        request: { email: 'jane@example.com' },
        response: { message: 'Email sent', data: {} },
      },
      {
        id: 'reset',
        method: 'POST',
        path: '/api/auth/reset-password',
        summary: 'Set new password with reset token',
        auth: 'Public',
        query: { token: 'Reset token from email link' },
        request: { password: 'newSecurePassword' },
        response: { data: { id: 'd28a…' } },
      },
      {
        id: 'profile',
        method: 'GET',
        path: '/api/auth/profile',
        summary: 'Fetch current user profile',
        auth: 'Bearer',
        response: {
          data: {
            user: {
              id: 'd28a…',
              name: 'Jane Doe',
              email: 'jane@example.com',
              role: 'user',
              isEmailVerified: true,
              avatar: 'https://cdn…',
            },
          },
        },
      },
      {
        id: 'upload',
        method: 'POST',
        path: '/api/auth/upload',
        summary: 'Upload avatar image (multipart)',
        auth: 'Bearer',
        notes: 'Use multipart/form-data with field `avatar`. Max 5 MB. PNG/JPEG only.',
        response: { data: { id: 'd28a…', avatarUrl: 'https://cdn…' } },
      },
    ],
  },
  {
    id: 'oidc',
    title: 'OIDC Protocol',
    icon: Lock,
    description: 'Standards-compliant OAuth2 + OIDC endpoints. Works with any compliant client library.',
    endpoints: [
      {
        id: 'jwks',
        method: 'GET',
        path: '/o/jwks.json',
        summary: 'JSON Web Key Set used to verify tokens',
        auth: 'Public',
        response: { keys: [{ kty: 'RSA', n: '…', e: 'AQAB' }] },
      },
      {
        id: 'discovery',
        method: 'GET',
        path: '/.well-known/openid-configuration',
        summary: 'OIDC service discovery document',
        auth: 'Public',
        response: {
          issuer: BASE,
          authorization_endpoint: `${BASE}/o/authorize`,
          token_endpoint: `${BASE}/o/token`,
          userinfo_endpoint: `${BASE}/o/userinfo`,
          jwks_uri: `${BASE}/o/jwks.json`,
        },
      },
      {
        id: 'authorize',
        method: 'GET',
        path: '/o/authorize',
        summary: 'PKCE flow entry — validates client, forwards params',
        auth: 'Public',
        query: {
          client_id: 'Required',
          code_challange: 'Required · SHA-256(code_verifier)',
          algorithm: 'Optional · defaults to SHA-256',
        },
        curl: `# Generate PKCE pair first
verifier=$(openssl rand -hex 32)
challenge=$(echo -n $verifier | openssl dgst -sha256 -binary | xxd -p)

# Redirect user here
open "${BASE}/o/authorize?client_id=$CLIENT_ID&code_challange=$challenge&algorithm=SHA-256"`,
      },
      {
        id: 'consent',
        method: 'POST',
        path: '/o/consent',
        summary: 'Exchange consent token for code',
        auth: 'Public',
        request: {
          consent_token: 'eyJhbGc…',
          client_id: 'abc123',
          code_challange: '<optional · PKCE flow>',
          algorithm: 'SHA-256',
        },
        response: { data: { redirectUriWithShortcode: 'https://app.example.com/cb?code=9f3a2b1c…' } },
      },
      {
        id: 'token',
        method: 'POST',
        path: '/o/token',
        summary: 'PKCE auth code → access + refresh tokens',
        auth: 'Public',
        request: {
          code: '9f3a2b1c…',
          client_id: 'abc123',
          code_verifier: 'dBjftJeZ…',
          algorithm: 'SHA-256',
        },
        response: { data: { accessToken: 'eyJhbGc…', refreshToken: 'eyJhbGc…' } },
        curl: `curl -X POST ${BASE}/o/token \\
  -H 'Content-Type: application/json' \\
  -d '{
    "code": "'$CODE'",
    "client_id": "'$CLIENT_ID'",
    "code_verifier": "'$verifier'",
    "algorithm": "SHA-256"
  }'`,
      },
      {
        id: 'access-token',
        method: 'GET',
        path: '/o/access-token',
        summary: 'Non-PKCE shortcode → access token',
        auth: 'Public',
        query: {
          short_code: 'From consent redirect',
          client_secret: 'Confidential client only',
        },
        response: { data: { id: 'd28a…', accessToken: 'eyJhbGc…' } },
      },
      {
        id: 'revoke',
        method: 'POST',
        path: '/o/revoke',
        summary: 'Revoke a token (RFC 7009)',
        auth: 'Client creds',
        request: {
          token: 'eyJhbGc…',
          token_type_hint: 'access_token',
          client_id: 'abc123',
          client_secret: 'shh',
        },
        response: { message: 'Token revoked successfully' },
      },
      {
        id: 'introspect',
        method: 'POST',
        path: '/o/introspect',
        summary: 'Inspect token validity (RFC 7662)',
        auth: 'Client creds',
        request: {
          token: 'eyJhbGc…',
          client_id: 'abc123',
          client_secret: 'shh',
        },
        response: {
          data: {
            active: true,
            sub: 'd28a…',
            email: 'jane@example.com',
            role: 'user',
            jti: '8ce…',
            exp: 1717084800,
          },
        },
      },
      {
        id: 'userInfo',
        method: 'GET',
        path: '/o/userInfo',
        summary: 'User profile from access token',
        auth: 'Bearer',
        response: { data: { user: { id: 'd28a…', name: 'Jane Doe', email: 'jane@example.com' } } },
      },
    ],
  },
  {
    id: 'apps',
    title: 'Applications',
    icon: AppWindow,
    description: 'Manage OAuth2 client applications registered in your workspace.',
    endpoints: [
      {
        id: 'register-client',
        method: 'POST',
        path: '/o/register-client',
        summary: 'Register a new OAuth2 application',
        auth: 'admin',
        request: {
          applicationDisplayName: 'Acme Inc',
          applicationUrl: 'https://acme.com',
          redirectUri: 'https://acme.com/auth/callback',
        },
        response: {
          data: {
            id: 'app-uuid',
            clientId: '32-char-hex',
            clientSecret: '64-char-hex (shown once)',
          },
        },
        notes: 'Client secret is hashed before storage. Copy it immediately on creation.',
      },
      {
        id: 'list-apps',
        method: 'GET',
        path: '/o/applications',
        summary: 'List visible applications',
        auth: 'admin / super_admin',
        response: {
          data: [
            { id: 'app1', name: 'Acme', url: 'https://acme.com', clientId: '…', redirectUri: '…' },
          ],
        },
      },
      {
        id: 'get-app',
        method: 'GET',
        path: '/o/application/:id',
        summary: 'Get application details',
        auth: 'admin / super_admin',
        response: {
          data: { id: 'app1', name: 'Acme', clientId: '…', createdAt: '…', updatedAt: '…' },
        },
      },
      {
        id: 'update-app',
        method: 'PATCH',
        path: '/o/applications/:id',
        summary: 'Update name or redirectUri',
        auth: 'admin / super_admin',
        request: { name: 'New name', redirectUri: 'https://acme.com/new-cb' },
        response: { data: { id: 'app1', name: 'New name', redirectUri: '…' } },
      },
      {
        id: 'rotate-secret',
        method: 'POST',
        path: '/o/rotate-secret/:id',
        summary: 'Rotate client secret — old secret invalidated',
        auth: 'admin / super_admin',
        response: { data: { id: 'app1', clientId: '…', clientSecret: 'new-64-char-hex' } },
      },
      {
        id: 'delete-client',
        method: 'DELETE',
        path: '/o/delete-client/:id',
        summary: 'Permanently delete an application',
        auth: 'super_admin',
        response: { message: 'Application with id <id> is deleted successfully' },
      },
    ],
  },
  {
    id: 'users',
    title: 'Users',
    icon: UsersIcon,
    description: 'Read and manage user accounts in your workspace.',
    endpoints: [
      {
        id: 'list-users',
        method: 'GET',
        path: '/api/users',
        summary: 'List all user accounts',
        auth: 'super_admin',
        response: {
          data: [
            { id: 'd28a…', name: 'Jane', email: 'jane@example.com', role: 'user', isVerified: true },
          ],
        },
      },
      {
        id: 'get-user',
        method: 'GET',
        path: '/api/users/:id',
        summary: 'Get a user by id',
        auth: 'self / super_admin',
        response: { data: { id: 'd28a…', name: 'Jane', email: 'jane@example.com', role: 'user' } },
      },
      {
        id: 'update-user',
        method: 'PATCH',
        path: '/api/users/:id',
        summary: 'Update user profile (role only by super_admin)',
        auth: 'self / super_admin',
        request: { name: 'Jane Smith', email: 'jane.smith@example.com', role: 'admin' },
        response: { data: { id: 'd28a…', name: 'Jane Smith', email: '…', role: 'admin' } },
      },
      {
        id: 'delete-user',
        method: 'DELETE',
        path: '/api/users/:id',
        summary: 'Delete user account',
        auth: 'super_admin',
        response: { message: 'User <id> deleted successfully' },
      },
    ],
  },
]

// Public docs hide super_admin–only endpoints — they're internal admin tooling,
// not part of the public integration surface.
const PUBLIC_GROUPS: Group[] = GROUPS.map((g) => ({
  ...g,
  endpoints: g.endpoints.filter((ep) => ep.auth !== 'super_admin'),
})).filter((g) => g.endpoints.length > 0)

function DocsPage() {
  const [activeGroup, setActiveGroup] = React.useState<string>(PUBLIC_GROUPS[0]?.id || 'auth')
  const [activeEndpoint, setActiveEndpoint] = React.useState<string>(
    PUBLIC_GROUPS[0]?.endpoints[0]?.id || 'register',
  )
  const activeGroupData = PUBLIC_GROUPS.find((g) => g.id === activeGroup) || PUBLIC_GROUPS[0]
  const activeEndpointData =
    activeGroupData.endpoints.find((e) => e.id === activeEndpoint) || activeGroupData.endpoints[0]

  return (
    <MarketingLayout bg="grid-only">
      <DocsHero />
      <DocsContent
        groups={PUBLIC_GROUPS}
        activeGroup={activeGroup}
        setActiveGroup={(id) => {
          setActiveGroup(id)
          const grp = PUBLIC_GROUPS.find((g) => g.id === id)
          if (grp) setActiveEndpoint(grp.endpoints[0].id)
        }}
        activeEndpoint={activeEndpoint}
        setActiveEndpoint={setActiveEndpoint}
        endpoint={activeEndpointData}
        group={activeGroupData}
      />
      <Quickstart />
    </MarketingLayout>
  )
}

function DocsHero() {
  return (
    <section className="px-6 pt-20 pb-10">
      <div className="max-w-6xl mx-auto">
        <p className="text-[12px] uppercase tracking-widest text-violet-300/80 font-semibold mb-3 anim-up">
          API Reference
        </p>
        <h1 className="text-5xl font-semibold tracking-[-0.03em] text-white leading-[1.05] mb-4 anim-up-1">
          Build with the API.
        </h1>
        <p className="text-[16px] text-white/55 leading-relaxed max-w-2xl mb-8 anim-up-2">
          Every endpoint with request shapes, response shapes, and copy-paste cURL examples.
          Self-hosted means you point your client at your instance — replace
          <code className="mx-1 px-1.5 py-0.5 rounded bg-white/[0.06] border border-white/10 font-mono text-[12.5px]">
            {BASE}
          </code>
          with your deployment.
        </p>

        <div className="anim-up-3 flex items-center gap-3 px-4 py-3 rounded-lg border border-white/8 bg-white/[0.02] max-w-2xl">
          <Server className="size-4 text-violet-300 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-[10.5px] uppercase tracking-wider text-white/35 font-semibold">Base URL</p>
            <p className="text-[13px] font-mono text-white/85 truncate">{BASE}</p>
          </div>
          <CopyButton value={BASE} />
        </div>
      </div>
    </section>
  )
}

function DocsContent({
  groups,
  activeGroup,
  setActiveGroup,
  activeEndpoint,
  setActiveEndpoint,
  endpoint,
  group,
}: {
  groups: Group[]
  activeGroup: string
  setActiveGroup: (id: string) => void
  activeEndpoint: string
  setActiveEndpoint: (id: string) => void
  endpoint: Endpoint
  group: Group
}) {
  return (
    <section className="px-6 pb-16">
      <div className="max-w-6xl mx-auto grid lg:grid-cols-[220px_minmax(0,1fr)] gap-6">
        {/* Sidebar nav */}
        <aside className="lg:sticky lg:top-20 lg:self-start">
          <div className="flex flex-col gap-1">
            {groups.map((g) => (
              <div key={g.id}>
                <button
                  onClick={() => setActiveGroup(g.id)}
                  className={`w-full text-left px-2.5 py-1.5 rounded-md text-[12.5px] font-medium flex items-center gap-2 transition-colors ${
                    activeGroup === g.id
                      ? 'bg-white/[0.07] text-white'
                      : 'text-white/55 hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  <g.icon className="size-3.5 text-violet-300 shrink-0" />
                  <span className="flex-1">{g.title}</span>
                  <span className="text-[10.5px] text-white/30">{g.endpoints.length}</span>
                </button>
                {activeGroup === g.id && (
                  <div className="ml-3 mt-1 mb-2 flex flex-col gap-px border-l border-white/8 pl-2">
                    {g.endpoints.map((ep) => (
                      <button
                        key={ep.id}
                        onClick={() => setActiveEndpoint(ep.id)}
                        className={`text-left px-2 py-1 rounded text-[11.5px] font-mono truncate transition-colors ${
                          activeEndpoint === ep.id
                            ? 'text-violet-200 bg-violet-500/10'
                            : 'text-white/40 hover:text-white/80 hover:bg-white/[0.03]'
                        }`}
                      >
                        <span
                          className={`mr-1.5 inline-block text-[9.5px] font-semibold ${
                            ep.method === 'GET'
                              ? 'text-emerald-400'
                              : ep.method === 'POST'
                              ? 'text-blue-400'
                              : ep.method === 'PATCH'
                              ? 'text-amber-400'
                              : ep.method === 'DELETE'
                              ? 'text-red-400'
                              : 'text-violet-400'
                          }`}
                        >
                          {ep.method}
                        </span>
                        {ep.path.replace(/^\/(api|o|\.well-known)/, '')}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </aside>

        {/* Endpoint detail */}
        <div className="min-w-0">
          <EndpointDetail group={group} endpoint={endpoint} />
        </div>
      </div>
    </section>
  )
}

function EndpointDetail({ group, endpoint }: { group: Group; endpoint: Endpoint }) {
  return (
    <article className="anim-in">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-[12px] text-white/45 mb-3">
        <group.icon className="size-3 text-violet-300" />
        <span>{group.title}</span>
        <ChevronRight className="size-3 text-white/25" />
        <span className="text-white/65 font-mono">{endpoint.path}</span>
      </div>

      <div className="flex items-center gap-3 mb-1">
        <Badge tone={METHOD_TONE[endpoint.method]} size="lg" className="font-mono">
          {endpoint.method}
        </Badge>
        <code className="text-[15px] font-mono text-white font-medium break-all">{endpoint.path}</code>
      </div>
      <p className="text-[14px] text-white/55 mt-2 mb-3">{endpoint.summary}</p>
      <div className="flex items-center gap-2 mb-6">
        <Badge tone={authTone(endpoint.auth)} size="md">
          <ShieldCheck className="size-2.5" /> {endpoint.auth}
        </Badge>
      </div>

      {endpoint.notes && (
        <div className="rounded-md border border-violet-500/15 bg-violet-500/[0.04] p-3 flex items-start gap-2 mb-6">
          <Sparkles className="size-3.5 text-violet-300 shrink-0 mt-0.5" />
          <p className="text-[12.5px] text-white/65">{endpoint.notes}</p>
        </div>
      )}

      {endpoint.query && Object.keys(endpoint.query).length > 0 && (
        <DocSection title="Query parameters">
          <Card className="overflow-hidden">
            <div className="divide-y divide-white/6">
              {Object.entries(endpoint.query).map(([k, v]) => (
                <div key={k} className="px-3 py-2 flex items-baseline gap-3">
                  <code className="text-[12px] font-mono text-violet-200 shrink-0">{k}</code>
                  <span className="text-[12.5px] text-white/55">{v}</span>
                </div>
              ))}
            </div>
          </Card>
        </DocSection>
      )}

      {endpoint.request && (
        <DocSection title="Request body">
          <CodeBlock value={typeof endpoint.request === 'string' ? endpoint.request : JSON.stringify(endpoint.request, null, 2)} lang="json" />
        </DocSection>
      )}

      {endpoint.response && (
        <DocSection title="Response">
          <CodeBlock value={JSON.stringify(endpoint.response, null, 2)} lang="json" />
        </DocSection>
      )}

      {endpoint.curl && (
        <DocSection title="cURL example">
          <CodeBlock value={endpoint.curl} lang="bash" />
        </DocSection>
      )}
    </article>
  )
}

function DocSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <p className="text-[10.5px] uppercase tracking-wider font-semibold text-white/35 mb-2">
        {title}
      </p>
      {children}
    </div>
  )
}

function CodeBlock({ value, lang }: { value: string; lang: 'json' | 'bash' }) {
  return (
    <div className="relative group rounded-md border border-white/8 bg-[#08080c] overflow-hidden">
      <div className="flex items-center justify-between px-3 h-8 border-b border-white/6 bg-white/[0.02]">
        <div className="flex items-center gap-1.5">
          {lang === 'bash' ? (
            <Terminal className="size-3 text-white/45" />
          ) : (
            <FileCode2 className="size-3 text-white/45" />
          )}
          <span className="text-[11px] font-mono text-white/40 uppercase tracking-wide">{lang}</span>
        </div>
        <CopyButton value={value} silent className="size-6" />
      </div>
      <pre className="px-4 py-3 text-[12.5px] font-mono leading-relaxed text-white/75 overflow-x-auto whitespace-pre">
        {value}
      </pre>
    </div>
  )
}

function authTone(auth: EndpointAuth): 'neutral' | 'green' | 'blue' | 'purple' | 'orange' {
  if (auth === 'Public') return 'neutral'
  if (auth === 'super_admin') return 'purple'
  if (auth === 'admin' || auth === 'admin / super_admin') return 'blue'
  if (auth === 'Bearer' || auth === 'self / super_admin') return 'green'
  return 'orange'
}

function Quickstart() {
  return (
    <section className="px-6 pb-24 border-t border-white/6 pt-16">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <p className="text-[12px] uppercase tracking-widest text-violet-300/80 font-semibold mb-2">
            Quickstart
          </p>
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-white mb-3">
            From zero to authenticated in 3 steps
          </h2>
          <p className="text-[14.5px] text-white/55 max-w-xl mx-auto">
            Recommended flow for SPAs and mobile apps — PKCE without client secrets.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-8">
          {[
            {
              n: 1,
              title: 'Register a client',
              desc: 'Get a clientId from your dashboard or POST /o/register-client',
              icon: KeyRound,
            },
            {
              n: 2,
              title: 'Send users to /authorize',
              desc: 'Generate PKCE pair, redirect with code_challange',
              icon: Zap,
            },
            {
              n: 3,
              title: 'Exchange code for tokens',
              desc: 'POST /o/token with code + code_verifier to get JWTs',
              icon: ShieldCheck,
            },
          ].map((s) => (
            <div key={s.n} className="relative rounded-lg border border-white/8 bg-white/[0.02] p-5">
              <span className="absolute -top-2 -left-2 size-6 rounded-full bg-violet-500/20 border border-violet-500/30 text-[11px] font-bold text-violet-200 flex items-center justify-center">
                {s.n}
              </span>
              <s.icon className="size-4 text-violet-300 mb-3" />
              <p className="text-[13.5px] font-semibold text-white mb-1">{s.title}</p>
              <p className="text-[12.5px] text-white/50 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>

        <CodeBlock
          value={`# 1. Generate PKCE pair
verifier=$(openssl rand -hex 32)
challenge=$(echo -n $verifier | openssl dgst -sha256 -binary | xxd -p)

# 2. Redirect user to /authorize
open "${BASE}/o/authorize?client_id=$CLIENT_ID&code_challange=$challenge&algorithm=SHA-256"

# 3. After consent, exchange the code (received via redirect_uri)
curl -X POST ${BASE}/o/token \\
  -H 'Content-Type: application/json' \\
  -d '{
    "code": "'$CODE'",
    "client_id": "'$CLIENT_ID'",
    "code_verifier": "'$verifier'",
    "algorithm": "SHA-256"
  }'

# Response
# {
#   "data": {
#     "accessToken": "eyJhbGc…",
#     "refreshToken": "eyJhbGc…"
#   }
# }`}
          lang="bash"
        />

        <div className="text-center mt-10">
          <Link to="/signup">
            <Button variant="primary" size="lg" className="gap-1.5">
              Start building <ArrowUpRight className="size-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
