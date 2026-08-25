import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { PasswordInput } from "@/components/ui/password-input"
import { AuthService } from "@/features/auth/auth.service"
import { zodResolver } from "@hookform/resolvers/zod"
import { AxiosError } from "axios"
import { useForm } from "react-hook-form"
import { Link, useLocation, useNavigate } from "react-router"
import { toast } from "sonner"
import { z } from "zod"

export const registerSchema = z
  .object({
    name: z.string().trim().min(1, "Inserisci il nome").min(2, "Inserisci almeno 2 caratteri"),
    last_name: z.string().trim().min(1, "Inserisci il cognome").min(2, "Inserisci almeno 2 caratteri"),
    email: z.email("Email non valida"),
    password: z.string().min(8, "Minimo 8 caratteri"),
    password_confirmation: z.string(),
  })
  .refine((d) => d.password === d.password_confirmation, {
    message: "Le password non coincidono",
    path: ["password_confirmation"],
  })

export default function RegisterForm() {
  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      last_name: "",
      email: "",
      password: "",
      password_confirmation: "",
    },
  })
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from ?? "/"

  async function onSubmit(values: z.infer<typeof registerSchema>) {
    try {
      await AuthService.register({
        ...values,
        name: capitalizeName(values.name),
        last_name: capitalizeName(values.last_name),
      })
      toast.success("Registrazione completata. Ora puoi accedere.")
      navigate("/login", { state: { from }, replace: true })
    } catch (error) {
      const msg =
        error instanceof AxiosError
          ? (error.response?.data as { message?: string })?.message
          : "Errore durante la registrazione"
      toast.error(msg ?? "Errore")
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <Field>
        <FieldLabel htmlFor="name">Nome</FieldLabel>
        <Input
          id="name"
          {...form.register("name")}
          onChange={(event) => form.setValue("name", capitalizeName(event.target.value), { shouldValidate: true })}
        />
        <FieldError>{form.formState.errors.name?.message}</FieldError>
      </Field>
      <Field>
        <FieldLabel htmlFor="last_name">Cognome</FieldLabel>
        <Input
          id="last_name"
          {...form.register("last_name")}
          onChange={(event) => form.setValue("last_name", capitalizeName(event.target.value), { shouldValidate: true })}
        />
        <FieldError>{form.formState.errors.last_name?.message}</FieldError>
      </Field>
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
      <Field>
        <FieldLabel htmlFor="password_confirmation">Conferma password</FieldLabel>
        <PasswordInput
          id="password_confirmation"
          {...form.register("password_confirmation")}
        />
        <FieldError>
          {form.formState.errors.password_confirmation?.message}
        </FieldError>
      </Field>
      <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
        Registrati
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        Hai già un account?{" "}
        <Link to="/login" state={{ from }} className="font-medium underline">
          Accedi
        </Link>
      </p>
    </form>
  )
}

function capitalizeName(value: string) {
  return value.replace(/(^|\s)(\p{L})/gu, (_, space: string, letter: string) => {
    return `${space}${letter.toUpperCase()}`
  })
}
