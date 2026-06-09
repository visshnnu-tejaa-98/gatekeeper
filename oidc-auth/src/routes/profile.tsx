import { authService } from '#/services/authService'
import { createFileRoute } from '@tanstack/react-router'
import { useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'

export const Route = createFileRoute('/profile')({
  component: RouteComponent,
})

function RouteComponent() {
  const navigate = useNavigate()
  const getUserDetails = async () => {
    const userDetails = await authService.profile()
    return userDetails
  }

  const {
    isLoading,
    isError,
    data: user,
    error,
  } = useQuery({
    queryKey: ['userinfo'],
    queryFn: getUserDetails,
  })

  console.log({ user })

  if (isLoading)
    return (
      <div>
        <p>Loading...</p>
      </div>
    )
  if (isError)
    return (
      <div>
        <p>{error.message}</p>
      </div>
    )

  if (!user) {
    return (
      <div>
        <p>Please Login</p>
        <button onClick={() => navigate({ to: '/login' })}>Login</button>
      </div>
    )
  }
  return (
    <div>
      <div>
        <h1>{user?.name}</h1>
        <p>{user?.id}</p>
        <h3>{user?.email}</h3>
        <button onClick={() => navigate({ to: '/register-client' })}>
          Register new client
        </button>
      </div>
    </div>
  )
}
