export type RegisterUserType = {
  name: string
  email: string
  password: string
  confirmPassword?: string
}

export type LoginUserType = {
  email: string
  password: string
}

export type UserType = {
  name: string
  email: string
  id: string
}
