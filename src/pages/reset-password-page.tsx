import ResetPasswordForm from "@/components/reset-password-form"

export default function ResetPasswordPage() {
  return (
    <>
      <h1 className="mb-2 text-center text-xl font-medium">Nuova password</h1>
      <p className="mb-6 text-center text-sm text-muted-foreground">
        Scegli una nuova password per il tuo account.
      </p>
      <ResetPasswordForm />
    </>
  )
}
