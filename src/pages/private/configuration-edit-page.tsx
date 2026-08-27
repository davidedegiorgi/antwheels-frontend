import OptionalPicker from "@/components/optional-picker"
import PageLoader from "@/components/page-loader"
import PricePanel from "@/components/price-panel"
import { Button } from "@/components/ui/button"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  HUB_OPTION_ORDER,
  OPTIONAL_CATEGORY_LABELS,
  SPOKE_OPTION_ORDER,
  getWheelHubThumbnail,
} from "@/data/wheel-brand"
import { CatalogService } from "@/features/catalog/catalog.service"
import type { WheelComponent, WheelHub } from "@/features/catalog/catalog.type"
import { ConfigurationsService } from "@/features/configurations/configurations.service"
import { calculateLivePrice, getCompatibilityWarning, isWheelHubCompatible } from "@/lib/compatibility"
import { cn, formatPrice } from "@/lib/utils"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect, useMemo, useState } from "react"
import { Link, useNavigate, useParams } from "react-router"
import { toast } from "sonner"

export default function ConfigurationEditPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const configId = Number(id)

  const { data: config, isLoading } = useQuery({
    queryKey: ["configuration", configId],
    queryFn: () => ConfigurationsService.get(configId),
    enabled: Number.isFinite(configId),
  })

  const { data: components = [] } = useQuery({
    queryKey: ["components"],
    queryFn: CatalogService.listWheelComponents,
  })
  const { data: hubs = [] } = useQuery({
    queryKey: ["wheel-hubs"],
    queryFn: CatalogService.listWheelHubs,
  })

  const [name, setName] = useState("")
  const [wheelHubId, setWheelHubId] = useState<number | undefined>()
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    if (config && !initialized) {
      setName(config.name ?? "")
      setWheelHubId(config.wheel_hub_id)
      setSelectedIds(config.components?.map((o) => o.id) ?? [])
      setInitialized(true)
    }
  }, [config, initialized])

  const wheelHubs = useMemo(() => {
    const officialHubNames = new Set<string>(HUB_OPTION_ORDER)

    return hubs
      .filter((hub) => hub.wheel_category_id === config?.wheel_category_id)
      .filter((hub) => officialHubNames.has(hub.name))
      .sort((a, b) => HUB_OPTION_ORDER.indexOf(a.name as typeof HUB_OPTION_ORDER[number]) -
        HUB_OPTION_ORDER.indexOf(b.name as typeof HUB_OPTION_ORDER[number]))
  }, [config?.wheel_category_id, hubs])

  const selectedWheelHub = wheelHubs.find((hub) => hub.id === wheelHubId) ?? config?.wheel_hub

  const total = config
    ? calculateLivePrice(
        parseFloat(config.wheel_category?.base_price ?? "0"),
        selectedWheelHub ? parseFloat(selectedWheelHub.price) : 0,
        selectedIds,
        components,
        config.wheel_category?.name
      )
    : 0

  const optionGroups = useMemo(() => {
    const groups = new Map<string, WheelComponent[]>()

    for (const optional of components) {
      if (isProfileComponent(optional) && !isProfileAvailableForModel(optional, config?.wheel_category?.name)) {
        continue
      }
      const label = getOptionDisplayGroup(optional)
      if (label === "Raggi" && !(SPOKE_OPTION_ORDER as readonly string[]).includes(optional.name)) {
        continue
      }
      const group = groups.get(label) ?? []
      groups.set(label, [...group, optional])
    }

    return [...groups.entries()]
      .map(([label, groupOptionals]) => [label, uniqueWheelImageOptionals(groupOptionals)] as const)
      .filter(([, groupOptionals]) => groupOptionals.length > 0)
      .sort(([a], [b]) => {
      const aIndex = OPTION_GROUP_ORDER.indexOf(a)
      const bIndex = OPTION_GROUP_ORDER.indexOf(b)
      if (aIndex !== -1 || bIndex !== -1) {
        return (aIndex === -1 ? Number.MAX_SAFE_INTEGER : aIndex) -
          (bIndex === -1 ? Number.MAX_SAFE_INTEGER : bIndex)
      }
      return a.localeCompare(b)
    })
  }, [components])

  const updateMutation = useMutation({
    mutationFn: () =>
      ConfigurationsService.update(configId, {
        name,
        wheel_hub_id: wheelHubId,
        component_ids: selectedIds,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["configurations"] })
      toast.success("Configurazione aggiornata")
      navigate("/area-personale/configurazioni")
    },
    onError: () => toast.error("Errore nell'aggiornamento"),
  })

  if (isLoading) return <PageLoader />
  if (!config) return <p>Configurazione non trovata</p>

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_220px]">
      <div>
        <Button variant="ghost" size="sm" render={<Link to="/area-personale/configurazioni" />}>
          ← Torna alle configurazioni
        </Button>
        <h1 className="mt-4 text-2xl font-light">Modifica configurazione</h1>
        <p className="text-muted-foreground">
          {config.wheel_category?.name}
        </p>

        <Field className="mt-6">
          <FieldLabel>Nome</FieldLabel>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </Field>

        <div className="space-y-8">
          {optionGroups.map(([label, groupOptionals]) => (
            <section key={label} className="rounded-xl border bg-card p-5 shadow-sm">
              <h3 className="mb-3 flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2 text-sm font-medium">
                {label}
                <span className="text-xs font-normal text-muted-foreground">
                  {groupOptionals.length}
                </span>
              </h3>
              <OptionalPicker
                components={groupOptionals}
                ruleOptionals={components}
                selectedIds={selectedIds}
                wheelHub={selectedWheelHub}
                wheelCategoryId={config.wheel_category?.id}
                modelName={config.wheel_category?.name}
                onChange={setSelectedIds}
              />
            </section>
          ))}
          <section className="rounded-xl border bg-card p-5 shadow-sm">
            <h3 className="mb-3 flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2 text-sm font-medium">
              Mozzo
              <span className="text-xs font-normal text-muted-foreground">
                {wheelHubs.length}
              </span>
            </h3>
            <HubPicker
              wheelHubs={wheelHubs}
              wheelCategoryId={config.wheel_category_id}
              selectedId={wheelHubId}
              onSelect={(id) => {
                const nextWheelHub = wheelHubs.find((hub) => hub.id === id)
                const compatibleSelectedIds = selectedIds.filter((optionalId) => {
                  const optional = components.find((item) => item.id === optionalId)
                  return optional ? !getCompatibilityWarning(nextWheelHub, optional) : true
                })

                setSelectedIds(compatibleSelectedIds)
                setWheelHubId(id)
              }}
            />
          </section>
        </div>

        <Button
          className="mt-8"
          onClick={() => updateMutation.mutate()}
          disabled={updateMutation.isPending}
        >
          Salva modifiche
        </Button>
      </div>
      <PricePanel lines={[]} total={total} />
    </div>
  )
}

const OPTION_GROUP_ORDER = [
  "Profilo",
  "Mozzo",
  "Raggi",
]

function getOptionDisplayGroup(optional: WheelComponent) {
  const name = optional.name.toLowerCase()
  if (name.includes("ragg")) return "Raggi"
  if (name.includes("profilo")) return "Profilo"
  return OPTIONAL_CATEGORY_LABELS[optional.category] ?? optional.category
}

function isProfileComponent(optional: WheelComponent) {
  return getOptionDisplayGroup(optional) === "Profilo"
}

function uniqueWheelImageOptionals(components: WheelComponent[]) {
  return components
}

function formatOptionalDisplayName(name: string) {
  return name.replace(/^Profilo\s+/i, "").replace(/\s+mm/gi, "mm")
}

function isProfileAvailableForModel(optional: WheelComponent, modelName?: string) {
  const model = modelName?.toLowerCase() ?? ""
  const profile = formatOptionalDisplayName(optional.name).toLowerCase()

  if (model.includes("mtb")) return profile === "20mm"
  if (model.includes("gravel")) return ["30mm", "40mm", "35/40mm wave"].includes(profile)

  return ["30mm", "45mm", "60mm", "45/50mm wave"].includes(profile)
}

function HubPicker({
  wheelHubs,
  wheelCategoryId,
  selectedId,
  onSelect,
}: {
  wheelHubs: WheelHub[]
  wheelCategoryId: number
  selectedId?: number
  onSelect: (id: number) => void
}) {
  return (
    <div className="space-y-2">
      {wheelHubs.map((hub) => {
        const compatible = isWheelHubCompatible(wheelCategoryId, hub)
        const image = hub.image_url ?? getWheelHubThumbnail(hub.name)

        return (
          <button
            key={hub.id}
            type="button"
            disabled={!compatible}
            onClick={() => onSelect(hub.id)}
            className={cn(
              "grid w-full items-center gap-4 rounded-lg border bg-background p-3 text-left transition-all hover:border-primary/40 hover:bg-accent/40 hover:shadow-sm",
              image
                ? "grid-cols-[4.5rem_minmax(0,1fr)_auto]"
                : "grid-cols-[minmax(0,1fr)_auto]",
              selectedId === hub.id && "border-primary bg-primary/5 shadow-sm",
              !compatible && "cursor-not-allowed opacity-40"
            )}
          >
            {image && (
              <span
                className={cn(
                  "relative flex size-16 items-center justify-center overflow-hidden rounded-full border bg-muted/30 transition-colors",
                  selectedId === hub.id ? "border-primary ring-2 ring-primary/15" : "border-border"
                )}
              >
                <img src={image} alt={hub.name} className="size-full object-cover" loading="lazy" />
              </span>
            )}
            <div className="min-w-0">
              <p className="font-medium">{hub.name}</p>
            </div>
            <span className="shrink-0 text-sm font-medium">
              {parseFloat(hub.price) > 0 ? `+ ${formatPrice(hub.price)}` : "Incluso"}
            </span>
          </button>
        )
      })}
    </div>
  )
}
