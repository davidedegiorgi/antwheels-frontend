import ForgotPasswordForm from "@/components/forgot-password-form"

export default function ForgotPasswordPage() {
  return (
    <>
      <h1 className="mb-2 text-center text-xl font-medium">Recupera password</h1>
      <p className="mb-6 text-center text-sm text-muted-foreground">
        Inserisci la tua email e riceverai un link per crearne una nuova.
      </p>
      <ForgotPasswordForm />
    </>
  )
}
