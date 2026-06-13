import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'
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
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="font-sans antialiased bg-[#08080c] text-white [overflow-wrap:anywhere]">
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
