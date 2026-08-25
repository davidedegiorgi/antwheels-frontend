import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { AuthService } from "@/features/auth/auth.service"
import { useAuthStore } from "@/features/auth/auth.store"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { AlertTriangle, Save, UserRound } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { useNavigate } from "react-router"
import { toast } from "sonner"
import { z } from "zod"

const profileSchema = z.object({
  name: z.string().trim().min(1, "Inserisci il nome").min(2, "Inserisci almeno 2 caratteri").max(255),
  last_name: z.string().trim().min(1, "Inserisci il cognome").min(2, "Inserisci almeno 2 caratteri").max(255),
})

export default function AccountPage() {
  const user = useAuthStore((state) => state.user)
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [confirmingDeletion, setConfirmingDeletion] = useState(false)
  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    values: { name: user?.name ?? "", last_name: user?.last_name ?? "" },
  })

  const updateProfile = useMutation({
    mutationFn: AuthService.updateProfile,
    onSuccess: () => {
      toast.success("Profilo aggiornato")
    },
    onError: () => {
      toast.error("Non è stato possibile aggiornare il profilo")
    },
  })

  const deleteAccount = useMutation({
    mutationFn: AuthService.deleteAccount,
    onSuccess: () => {
      queryClient.clear()
      toast.success("Account eliminato")
      navigate("/login", { replace: true })
    },
    onError: () => {
      toast.error("Non è stato possibile eliminare l'account")
    },
  })

  if (!user) return null

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-3xl font-light">Account</h1>
        <p className="mt-2 text-muted-foreground">Gestisci i dati di accesso e il profilo.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserRound className="size-5" />
            Dati di accesso
          </CardTitle>
          <CardDescription>L'indirizzo email è associato al tuo account.</CardDescription>
        </CardHeader>
        <CardContent>
          <Field>
            <FieldLabel htmlFor="account-email">Email</FieldLabel>
            <Input id="account-email" value={user.email} disabled />
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Profilo</CardTitle>
          <CardDescription>Modifica nome e cognome mostrati nell'applicazione.</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="grid gap-4 sm:grid-cols-2"
            onSubmit={form.handleSubmit((values) =>
              updateProfile.mutate({
                name: capitalizeName(values.name),
                last_name: capitalizeName(values.last_name),
              })
            )}
          >
            <Field className="flex-1">
              <FieldLabel htmlFor="account-name">Nome</FieldLabel>
              <Input
                id="account-name"
                {...form.register("name")}
                onChange={(event) => form.setValue("name", capitalizeName(event.target.value), { shouldValidate: true })}
              />
              <FieldError>{form.formState.errors.name?.message}</FieldError>
            </Field>
            <Field className="flex-1">
              <FieldLabel htmlFor="account-last-name">Cognome</FieldLabel>
              <Input
                id="account-last-name"
                {...form.register("last_name")}
                onChange={(event) => form.setValue("last_name", capitalizeName(event.target.value), { shouldValidate: true })}
              />
              <FieldError>{form.formState.errors.last_name?.message}</FieldError>
            </Field>
            <Button type="submit" className="sm:col-span-2" disabled={updateProfile.isPending}>
              <Save />
              {updateProfile.isPending ? "Salvo..." : "Salva"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-destructive/40">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="size-5" />
            Elimina account
          </CardTitle>
          <CardDescription>
            L'operazione elimina definitivamente account, configurazioni e preventivi.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {confirmingDeletion ? (
            <div className="flex flex-col gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm font-medium">Vuoi eliminare definitivamente il tuo account?</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setConfirmingDeletion(false)}>
                  Annulla
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={deleteAccount.isPending}
                  onClick={() => deleteAccount.mutate()}
                >
                  {deleteAccount.isPending ? "Elimino..." : "Elimina account"}
                </Button>
              </div>
            </div>
          ) : (
            <Button variant="destructive" onClick={() => setConfirmingDeletion(true)}>
              Elimina account
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function capitalizeName(value: string) {
  return value.replace(/(^|\s)(\p{L})/gu, (_, space: string, letter: string) => {
    return `${space}${letter.toUpperCase()}`
  })
}
