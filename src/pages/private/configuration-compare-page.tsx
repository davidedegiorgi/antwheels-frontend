import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import PageLoader from "@/components/page-loader"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { WheelComponent } from "@/features/catalog/catalog.type"
import { ConfigurationsService } from "@/features/configurations/configurations.service"
import type { Configuration } from "@/features/configurations/configurations.type"
import { formatPrice } from "@/lib/utils"
import { useQuery } from "@tanstack/react-query"
import { ArrowLeft, GitCompareArrows } from "lucide-react"
import { Link, useSearchParams } from "react-router"

export default function ConfigurationComparePage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { data: configurations = [], isLoading } = useQuery({
    queryKey: ["configurations"],
    queryFn: ConfigurationsService.list,
  })

  const firstId = Number(searchParams.get("a") ?? configurations[0]?.id)
  const secondId = Number(
    searchParams.get("b") ??
      configurations.find((configuration) => configuration.id !== firstId)?.id
  )

  const first = configurations.find((configuration) => configuration.id === firstId)
  const second = configurations.find((configuration) => configuration.id === secondId)
  const comparison = first && second ? compareConfigurations(first, second) : null

  function updateSelection(key: "a" | "b", value: string) {
    const next = new URLSearchParams(searchParams)
    next.set(key, value)
    setSearchParams(next)
  }

  if (isLoading) return <PageLoader />

  if (configurations.length < 2) {
    return (
      <div>
        <Button variant="ghost" size="sm" render={<Link to="/area-personale/configurazioni" />}>
          <ArrowLeft />
          Configurazioni
        </Button>
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Confronto configurazioni</CardTitle>
            <CardDescription>
              Servono almeno due configurazioni salvate per usare il confronto.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button render={<Link to="/configura" />}>Crea configurazione</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div>
      <Button variant="ghost" size="sm" render={<Link to="/area-personale/configurazioni" />}>
        <ArrowLeft />
        Configurazioni
      </Button>

      <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-3 text-3xl font-light">
            <GitCompareArrows className="size-7" />
            Confronta configurazioni
          </h1>
        </div>
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Selezione</CardTitle>
          <CardDescription>Scegli due configurazioni salvate da confrontare.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <ConfigurationSelect
            label="Configurazione A"
            value={first?.id}
            configurations={configurations}
            disabledId={second?.id}
            onChange={(value) => updateSelection("a", value)}
          />
          <ConfigurationSelect
            label="Configurazione B"
            value={second?.id}
            configurations={configurations}
            disabledId={first?.id}
            onChange={(value) => updateSelection("b", value)}
          />
        </CardContent>
      </Card>

      {first && second && comparison && (
        <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_1fr]">
          <ConfigurationSummary configuration={first} label="A" />
          <ConfigurationSummary configuration={second} label="B" />

          <Card className="xl:col-span-2">
            <CardHeader>
              <CardTitle>Risultato confronto</CardTitle>
              <CardDescription>
                Differenza totale:{" "}
                <span className="font-medium text-foreground">
                  {formatPrice(Math.abs(comparison.priceDifference))}
                </span>{" "}
                {comparison.priceDifference === 0
                  ? "nessuna differenza"
                  : comparison.priceDifference > 0
                    ? "in più sulla configurazione A"
                    : "in più sulla configurazione B"}
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 lg:grid-cols-3">
              <OptionList title="In comune" components={comparison.common} variant="secondary" />
              <OptionList title="Solo A" components={comparison.onlyFirst} />
              <OptionList title="Solo B" components={comparison.onlySecond} />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

function ConfigurationSelect({
  label,
  value,
  configurations,
  disabledId,
  onChange,
}: {
  label: string
  value?: number
  configurations: Configuration[]
  disabledId?: number
  onChange: (value: string) => void
}) {
  return (
    <label className="grid gap-2 text-sm font-medium">
      {label}
      <select
        value={value ?? ""}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {configurations.map((configuration) => (
          <option
            key={configuration.id}
            value={configuration.id}
            disabled={configuration.id === disabledId}
          >
            {configuration.name ?? `Config #${configuration.id}`} -{" "}
            {configuration.wheel_category?.name ?? "Categoria"} -{" "}
            {formatPrice(configuration.total_price)}
          </option>
        ))}
      </select>
    </label>
  )
}

function ConfigurationSummary({
  configuration,
  label,
}: {
  configuration: Configuration
  label: string
}) {
  return (
    <Card>
      <CardHeader>
        <CardDescription>Configurazione {label}</CardDescription>
        <CardTitle>{configuration.name ?? `Config #${configuration.id}`}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <ComparisonRow label="Categoria" value={configuration.wheel_category?.name ?? "-"} />
        <ComparisonRow label="Mozzo" value={configuration.wheel_hub?.name ?? "-"} />
        <ComparisonRow label="Totale" value={formatPrice(configuration.total_price)} strong />
      </CardContent>
    </Card>
  )
}

function ComparisonRow({
  label,
  value,
  strong,
}: {
  label: string
  value: string
  strong?: boolean
}) {
  return (
    <div className="flex justify-between gap-4 border-b pb-3 last:border-b-0 last:pb-0">
      <span className="text-muted-foreground">{label}</span>
      <span className={strong ? "font-semibold" : "text-right font-medium"}>{value}</span>
    </div>
  )
}

function OptionList({
  title,
  components,
  variant = "outline",
}: {
  title: string
  components: WheelComponent[]
  variant?: "outline" | "secondary"
}) {
  return (
    <div>
      <h2 className="text-sm font-medium">{title}</h2>
      {components.length ? (
        <ul className="mt-3 space-y-2">
          {components.map((optional) => (
            <li key={optional.id} className="flex items-start justify-between gap-3 text-sm">
              <span>{optional.name}</span>
              <Badge variant={variant}>{formatPrice(optional.price)}</Badge>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-sm text-muted-foreground">Nessun elemento.</p>
      )}
    </div>
  )
}

function compareConfigurations(first: Configuration, second: Configuration) {
  const firstOptionals = first.components ?? []
  const secondOptionals = second.components ?? []
  const secondIds = new Set(secondOptionals.map((optional) => optional.id))
  const firstIds = new Set(firstOptionals.map((optional) => optional.id))

  return {
    priceDifference: parseFloat(first.total_price) - parseFloat(second.total_price),
    common: firstOptionals.filter((optional) => secondIds.has(optional.id)),
    onlyFirst: firstOptionals.filter((optional) => !secondIds.has(optional.id)),
    onlySecond: secondOptionals.filter((optional) => !firstIds.has(optional.id)),
  }
}
