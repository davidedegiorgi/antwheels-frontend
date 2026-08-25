import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { PasswordInput } from "@/components/ui/password-input"
import { AuthService } from "@/features/auth/auth.service"
import { zodResolver } from "@hookform/resolvers/zod"
import { AxiosError } from "axios"
import { useForm } from "react-hook-form"
import { Link, useNavigate, useLocation } from "react-router"
import { toast } from "sonner"
import { z } from "zod"

export const loginFormSchema = z.object({
  email: z.email("Email non valida"),
  password: z.string().min(1, "Password obbligatoria"),
})

export default function LoginForm() {
  const form = useForm<z.infer<typeof loginFormSchema>>({
    resolver: zodResolver(loginFormSchema),
  })
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string })?.from ?? "/"

  async function onSubmit(values: z.infer<typeof loginFormSchema>) {
    try {
      await AuthService.login(values)
      toast.success("Accesso effettuato")
      navigate(from, { replace: true })
    } catch (error) {
      const data = error instanceof AxiosError
        ? (error.response?.data as { message?: string })
        : undefined

      toast.error(data?.message ?? "Errore del server, riprova")
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
        <FieldLabel htmlFor="password">Password</FieldLabel>
        <PasswordInput id="password" {...form.register("password")} />
        <FieldError>{form.formState.errors.password?.message}</FieldError>
      </Field>
      <div className="-mt-2 text-right">
        <Link to="/forgot-password" className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
          Password dimenticata?
        </Link>
      </div>
      <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
        Accedi
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        Non hai un account?{" "}
        <Link
          to="/register"
          state={{ from }}
          className="font-medium text-foreground underline"
        >
          Registrati
        </Link>
      </p>
    </form>
  )
}
