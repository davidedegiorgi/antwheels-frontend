import { useEffect, useState } from "react"
import LegalLinks from "@/components/legal-links"
import { Button } from "@/components/ui/button"
import { AuthService } from "@/features/auth/auth.service"
import { useAuthStore } from "@/features/auth/auth.store"
import { useConfiguratorStore } from "@/features/configurator/configurator.store"
import { cn } from "@/lib/utils"
import { LogOut, User } from "lucide-react"
import { Link, useLocation, useNavigate } from "react-router"

export default function AppShell({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, token } = useAuthStore()
  const saveDraft = useConfiguratorStore((s) => s.saveDraft)
  const navigate = useNavigate()
  const location = useLocation()
  const isConfiguratorPage = location.pathname.startsWith("/configura")
  const [showSplash, setShowSplash] = useState(() => location.pathname === "/")

  useEffect(() => {
    if (!showSplash) return

    const timer = window.setTimeout(() => {
      setShowSplash(false)
    }, 1700)

    return () => window.clearTimeout(timer)
  }, [showSplash])

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" })
  }, [location.pathname])

  async function handleLogout() {
    await AuthService.logout()
    navigate("/")
  }

  function handleAuthLinkClick() {
    if (isConfiguratorPage) saveDraft(location.pathname)
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {showSplash && <AppSplash />}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-background/90 backdrop-blur-xl">
        <div className="relative flex h-[72px] items-center justify-center px-4 sm:h-[76px] sm:px-6 lg:h-20 lg:px-10">
          <Link to="/" className="absolute left-1/2 flex -translate-x-1/2 items-center justify-center" aria-label="ANTWHEELS home">
            <img
              src="/antwheels-logo-new.png"
              alt="ANTWHEELS"
              className="h-24 w-auto max-w-[88vw] object-contain sm:h-28 lg:h-32"
            />
          </Link>

          <div className="ml-auto flex items-center gap-2">
            {token && user ? (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-10 rounded-full border border-white/15 bg-white/[0.03] text-sm font-semibold uppercase text-foreground hover:bg-white/10"
                  render={<Link to="/area-personale" />}
                  aria-label="Area personale"
                >
                  {getInitials(user.name, user.last_name)}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-10 rounded-full border border-white/10 text-muted-foreground hover:bg-white/10 hover:text-foreground"
                  onClick={handleLogout}
                  aria-label="Esci"
                >
                  <LogOut className="size-4" />
                </Button>
              </>
            ) : (
              <div className="flex items-center gap-1.5">
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-10 rounded-full border border-white/15 bg-white/[0.03] hover:bg-white/10"
                  render={<Link to="/login" state={{ from: location.pathname }} />}
                  onClick={handleAuthLinkClick}
                  aria-label="Accedi"
                >
                  <User className="size-4" />
                </Button>

              </div>
            )}
          </div>
        </div>
      </header>

      <main
        className={cn(
          "w-full flex-1",
          isConfiguratorPage ? "p-0" : "mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8"
        )}
      >
        {children}
      </main>
      {!isConfiguratorPage && <LegalLinks className="px-4 pb-8" />}
    </div>
  )
}

function getInitials(name?: string, lastName?: string | null) {
  const parts = [name, lastName].filter(Boolean).join(" ").trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "U"
  const first = parts[0]?.[0] ?? "U"
  const last = parts.length > 1 ? parts[parts.length - 1][0] ?? "" : ""
  return `${first}${last}`.toUpperCase()
}


function AppSplash() {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-[#020202] animate-splash-out">
      <div className="relative flex w-full max-w-4xl -translate-y-8 flex-col items-center px-8 sm:translate-y-0">
        <img
          src="/antwheels-logo-new.png"
          alt="ANTWHEELS"
          className="w-full max-w-[760px] object-contain opacity-0 animate-splash-logo"
        />
        <div className="mt-8 h-px w-full max-w-sm overflow-hidden bg-white/10">
          <div className="h-full w-1/2 bg-white animate-loader-line" />
        </div>
      </div>
    </div>
  )
}
