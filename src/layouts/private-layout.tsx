import AppShell from "@/components/app-shell"
import { AuthService } from "@/features/auth/auth.service"
import { useAuthStore } from "@/features/auth/auth.store"
import { useEffect } from "react"
import { Navigate, Outlet, useLocation } from "react-router"

export default function PrivateLayout() {
  const token = useAuthStore((s) => s.token)
  const user = useAuthStore((s) => s.user)
  const location = useLocation()

  useEffect(() => {
    if (token) {
      AuthService.me().catch(() => useAuthStore.getState().logout())
    }
  }, [token])

  if (!token || !user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return (
    <AppShell>
      <Outlet />
    </AppShell>
  )
}
