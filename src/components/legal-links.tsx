import { Link } from "react-router"

export default function LegalLinks({ className = "" }: { className?: string }) {
  return (
    <nav
      aria-label="Link legali"
      className={`flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-muted-foreground ${className}`}
    >
      <Link to="/privacy" className="transition-colors hover:text-foreground">
        Privacy
      </Link>
      <Link to="/termini" className="transition-colors hover:text-foreground">
        Termini
      </Link>
      <Link to="/contatti" className="transition-colors hover:text-foreground">
        Contatti
      </Link>
    </nav>
  )
}
