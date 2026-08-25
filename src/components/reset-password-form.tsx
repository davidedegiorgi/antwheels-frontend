import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { PasswordInput } from "@/components/ui/password-input"
import { AuthService } from "@/features/auth/auth.service"
import { zodResolver } from "@hookform/resolvers/zod"
import { AxiosError } from "axios"
import { useForm } from "react-hook-form"
import { Link, useNavigate, useSearchParams } from "react-router"
import { toast } from "sonner"
import { z } from "zod"

const resetPasswordSchema = z
  .object({
    email: z.email("Email non valida"),
    password: z.string().min(8, "Minimo 8 caratteri"),
    password_confirmation: z.string(),
  })
  .refine((d) => d.password === d.password_confirmation, {
    message: "Le password non coincidono",
    path: ["password_confirmation"],
  })

export default function ResetPasswordForm() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get("token") ?? ""
  const email = searchParams.get("email") ?? ""
  const form = useForm<z.infer<typeof resetPasswordSchema>>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email,
      password: "",
      password_confirmation: "",
    },
  })

  async function onSubmit(values: z.infer<typeof resetPasswordSchema>) {
    if (!token) {
      toast.error("Link non valido")
      return
    }

    try {
      const res = await AuthService.resetPassword({ ...values, token })
      toast.success(res.message)
      navigate("/login", { replace: true })
    } catch (error) {
      const msg =
        error instanceof AxiosError
          ? (error.response?.data as { message?: string })?.message
          : "Non è stato possibile aggiornare la password"
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
      <Field>
        <FieldLabel htmlFor="password">Nuova password</FieldLabel>
        <PasswordInput id="password" {...form.register("password")} />
        <FieldError>{form.formState.errors.password?.message}</FieldError>
      </Field>
      <Field>
        <FieldLabel htmlFor="password_confirmation">Conferma password</FieldLabel>
        <PasswordInput
          id="password_confirmation"
          {...form.register("password_confirmation")}
        />
        <FieldError>{form.formState.errors.password_confirmation?.message}</FieldError>
      </Field>
      <Button type="submit" className="w-full" disabled={form.formState.isSubmitting || !token}>
        {form.formState.isSubmitting ? "Aggiorno..." : "Aggiorna password"}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        <Link to="/forgot-password" className="font-medium text-foreground underline">
          Richiedi un nuovo link
        </Link>
      </p>
    </form>
  )
}
