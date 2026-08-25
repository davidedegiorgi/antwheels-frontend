import LegalLinks from "@/components/legal-links"
import { useAuthStore } from "@/features/auth/auth.store"
import { Link, Navigate, Outlet, useLocation } from "react-router"

export default function AuthLayout() {
  const token = useAuthStore((s) => s.token)
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from ?? "/"
  if (token) return <Navigate to={from} replace />

  return (
    <div className="min-h-screen bg-background px-4 text-foreground">
      <header className="flex h-[72px] items-center justify-center sm:h-[76px] lg:h-20">
        <Link to="/" aria-label="Torna alla home" className="flex items-center justify-center">
          <img
            src="/antwheels-logo-new.png"
            alt="ANTWHEELS"
            className="h-24 w-auto max-w-[88vw] object-contain sm:h-28 lg:h-32"
          />
        </Link>
      </header>
      <main className="flex min-h-[calc(100vh-5rem)] flex-col items-center justify-center gap-8 pb-20">
        <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/[0.035] p-6 shadow-2xl shadow-black/30 backdrop-blur sm:p-8">
          <Outlet />
        </div>
        <LegalLinks />
      </main>
    </div>
  )
}
