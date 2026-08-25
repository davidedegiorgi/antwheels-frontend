import AppShell from "@/components/app-shell"
import { AuthService } from "@/features/auth/auth.service"
import { useAuthStore } from "@/features/auth/auth.store"
import { useEffect } from "react"
import { Outlet } from "react-router"

export default function WebsiteLayout() {
  useEffect(() => {
    const token = useAuthStore.getState().token
    if (!token) return
    AuthService.me().catch(() => useAuthStore.getState().logout())
  }, [])

  return (
    <AppShell>
      <Outlet />
    </AppShell>
  )
}
