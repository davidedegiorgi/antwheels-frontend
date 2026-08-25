import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { AuthService } from "@/features/auth/auth.service"
import { zodResolver } from "@hookform/resolvers/zod"
import { AxiosError } from "axios"
import { useForm } from "react-hook-form"
import { Link } from "react-router"
import { toast } from "sonner"
import { z } from "zod"

const forgotPasswordSchema = z.object({
  email: z.email("Email non valida"),
})

export default function ForgotPasswordForm() {
  const form = useForm<z.infer<typeof forgotPasswordSchema>>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  })

  async function onSubmit(values: z.infer<typeof forgotPasswordSchema>) {
    try {
      const res = await AuthService.forgotPassword(values)
      toast.success(res.message)
    } catch (error) {
      const msg =
        error instanceof AxiosError
          ? (error.response?.data as { message?: string })?.message
          : "Non è stato possibile inviare il link"
      toast.error(msg ?? "Errore")
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <Field>
        <FieldLabel htmlFor="email">Email</FieldLabel>
        <Input id="email" type="email" {...form.register("email")} />
        <FieldError>{form.formState.errors.email?.message}</FieldError>
      </Field>
      <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? "Invio..." : "Invia link"}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        Ricordi la password?{" "}
        <Link to="/login" className="font-medium text-foreground underline">
          Accedi
        </Link>
      </p>
    </form>
  )
}
