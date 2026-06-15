import { HeadContent, Link, Scripts, createRootRoute } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '../lib/queryClient'
import { Toaster } from 'sonner'
import appCss from '../styles.css?url'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'iLogin — Self-hosted Identity Platform' },
      {
        name: 'description',
        content:
          'Self-hosted OAuth2 + OIDC identity provider with PKCE support. Open source alternative to Okta, Auth0, and Clerk.',
      },
    ],
    links: [{ rel: 'stylesheet', href: appCss }],
  }),
  shellComponent: RootDocument,
  notFoundComponent: NotFound,
})

function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center bg-[#08080c]">
      <p className="text-[10.5px] uppercase tracking-widest font-semibold text-violet-300/80 mb-3">
        404 · Not found
      </p>
      <h1 className="text-4xl font-semibold tracking-tight text-white mb-3">
        That page doesn't exist.
      </h1>
      <p className="text-[13.5px] text-white/55 max-w-md mb-6">
        The URL might be mistyped, or the page may have moved. Head back to a known landing zone:
      </p>
      <div className="flex items-center gap-2">
        <Link
          to="/"
          className="inline-flex items-center justify-center h-9 px-4 rounded-md text-[13px] font-medium border border-white/12 text-white/75 hover:bg-white/[0.04] hover:text-white transition-colors"
        >
          Home
        </Link>
        <Link
          to="/dashboard"
          className="inline-flex items-center justify-center h-9 px-4 rounded-md text-[13px] font-medium bg-gradient-to-br from-violet-500 to-blue-500 text-white hover:opacity-90 transition-opacity"
        >
          Dashboard
        </Link>
      </div>
    </div>
  )
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body
        className="font-sans antialiased bg-[#08080c] text-white [overflow-wrap:anywhere]"
        suppressHydrationWarning
      >
        <QueryClientProvider client={queryClient}>
          <Toaster
            theme="dark"
            position="bottom-right"
            toastOptions={{
              style: {
                background: 'rgba(20, 20, 30, 0.95)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: 'rgba(255,255,255,0.92)',
                backdropFilter: 'blur(20px)',
                fontSize: '13px',
              },
            }}
          />
          {children}
          <TanStackDevtools
            config={{ position: 'bottom-right' }}
            plugins={[
              {
                name: 'Tanstack Router',
                render: <TanStackRouterDevtoolsPanel />,
              },
            ]}
          />
        </QueryClientProvider>
        <Scripts />
      </body>
    </html>
  )
}
