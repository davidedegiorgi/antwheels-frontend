export type UserRole = "user" | "admin"

export type User = {
  id: number
  name: string
  last_name?: string | null
  email: string
  role: UserRole
  email_verified_at?: string | null
  created_at?: string
  updated_at?: string
}
