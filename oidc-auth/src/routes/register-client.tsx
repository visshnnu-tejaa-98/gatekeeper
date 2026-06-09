import { createFileRoute } from '@tanstack/react-router'
import { RegisterClientForm } from '../components/register-client-form'

export const Route = createFileRoute('/register-client')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <RegisterClientForm />
      </div>
    </div>
  )
}
