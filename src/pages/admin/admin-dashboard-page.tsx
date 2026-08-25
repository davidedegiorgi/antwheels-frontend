import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import PageLoader from "@/components/page-loader"
import { AdminService } from "@/features/admin/admin.service"
import { formatPrice } from "@/lib/utils"
import { useQuery } from "@tanstack/react-query"
import { Car, FileText, TrendingUp, Users } from "lucide-react"

export default function AdminDashboardPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: AdminService.getStats,
  })

  const { data: byStatus } = useQuery({
    queryKey: ["admin-quotes-status"],
    queryFn: AdminService.getQuotesByStatus,
  })

  const { data: popular } = useQuery({
    queryKey: ["admin-popular-models"],
    queryFn: AdminService.getPopularModels,
  })

  const { data: revenue } = useQuery({
    queryKey: ["admin-revenue"],
    queryFn: AdminService.getRevenueByMonth,
  })

  if (isLoading) return <PageLoader />

  const statCards = [
    {
      label: "Utenti",
      value: stats?.total_users ?? 0,
      icon: Users,
    },
    {
      label: "Preventivi",
      value: stats?.total_quotes ?? 0,
      icon: FileText,
    },
    {
      label: "Fatturato",
      value: formatPrice(stats?.total_revenue ?? 0),
      icon: TrendingUp,
    },
    {
      label: "Valore medio",
      value: formatPrice(stats?.average_quote_value ?? 0),
      icon: Car,
    },
  ]

  return (
    <div>
      <h1 className="text-3xl font-light">Dashboard amministratore</h1>
      <p className="mt-2 text-muted-foreground">
        Panoramica utenti, preventivi e modelli più richiesti.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardDescription>{label}</CardDescription>
              <Icon className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <CardTitle className="text-2xl">{value}</CardTitle>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Preventivi per stato</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              {byStatus &&
                Object.entries(byStatus).map(([status, count]) => (
                  <li key={status} className="flex justify-between">
                    <span className="capitalize">{status}</span>
                    <span className="font-medium">{count}</span>
                  </li>
                ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Linee ruote più popolari</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              {popular?.map((m) => (
                <li key={m.id} className="flex justify-between">
                  <span>{m.name}</span>
                  <span className="font-medium">{m.count} config.</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Fatturato mensile</CardTitle>
          </CardHeader>
          <CardContent>
            {revenue?.length ? (
              <ul className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
                {revenue.map((r) => (
                  <li
                    key={r.month}
                    className="flex justify-between rounded-lg border p-3 text-sm"
                  >
                    <span>{r.month}</span>
                    <span className="font-medium">{formatPrice(r.revenue)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">
                Nessun dato disponibile (richiede PostgreSQL in produzione).
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
