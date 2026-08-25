import { Button } from "@/components/ui/button"
import { Check, MailWarning } from "lucide-react"
import { Link, useSearchParams } from "react-router"

export default function EmailVerificationResultPage() {
  const [searchParams] = useSearchParams()
  const success = searchParams.get("status") === "success"

  return (
    <div className="mx-auto flex min-h-[55vh] w-full max-w-lg flex-col items-center justify-center text-center">
      <div className="mb-6 flex size-14 items-center justify-center rounded-full border border-white/10 bg-white/[0.035]">
        {success ? <Check className="size-6" /> : <MailWarning className="size-6" />}
      </div>
      <h1 className="text-3xl font-semibold tracking-tight">
        {success ? "Email confermata" : "Verifica non riuscita"}
      </h1>
      <p className="mt-4 text-muted-foreground">
        {success
          ? "Il tuo account ANTWHEELS è attivo. Ora puoi accedere e salvare configurazioni e preventivi."
          : "Il link non è valido o è scaduto. Puoi richiedere un nuovo invio dalla pagina di login."}
      </p>
      <Button className="mt-8 rounded-full" render={<Link to="/login" />}>
        Vai al login
      </Button>
    </div>
  )
}
