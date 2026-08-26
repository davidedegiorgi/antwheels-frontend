import OptionalPicker from "@/components/optional-picker"
import { Button } from "@/components/ui/button"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  HUB_OPTION_ORDER,
  OPTIONAL_CATEGORY_LABELS,
  getWheelHubThumbnail,
  SPOKE_OPTION_ORDER,
  WIZARD_STEPS,
} from "@/data/wheel-brand"
import { CatalogService } from "@/features/catalog/catalog.service"
import type { WheelHub, WheelComponent } from "@/features/catalog/catalog.type"
import { useConfiguratorStore } from "@/features/configurator/configurator.store"
import { ConfigurationsService } from "@/features/configurations/configurations.service"
import { QuotesService } from "@/features/quotes/quotes.service"
import { useAuthStore } from "@/features/auth/auth.store"
import { calculateLivePrice, getCompatibilityWarning, getOptionalEffectivePrice, getSpokeCount, isWheelHubCompatible, isSpokeOptional } from "@/lib/compatibility"
import { cn, formatPrice } from "@/lib/utils"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { ArrowLeft, Check } from "lucide-react"
import { useEffect, useMemo, useRef } from "react"
import { Link, useLocation, useNavigate, useParams } from "react-router"
import { toast } from "sonner"

const SLUG_TO_NAME: Record<string, string> = {
  road: "Strada",
  gravel: "Gravel",
  mtb: "MTB",
}

const MODEL_DISPLAY_NAMES: Record<string, string> = {
  Strada: "strada",
  Gravel: "gravel",
  MTB: "MTB",
}

function getWheelCategoryDisplayName(modelName?: string) {
  if (!modelName) return undefined
  return MODEL_DISPLAY_NAMES[modelName] ?? modelName
}

function formatOptionalDisplayName(name: string) {
  return name.replace(/^Profilo\s+(\d+)\s*mm$/i, "$1mm")
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

export default function ConfiguratorPage() {
  const { slug } = useParams<{ slug?: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const queryClient = useQueryClient()
  const token = useAuthStore((s) => s.token)

  const {
    step,
    wheelCategoryId,
    wheelHubId,
    selectedOptionalIds,
    configName,
    setStep,
    setWheelCategoryId,
    setWheelHubId,
    setSelectedOptionalIds,
    setConfigName,
    saveDraft,
    restoreDraft,
    clearDraft,
    reset,
  } = useConfiguratorStore()

  // refs per scroll automatico
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({})
  const shouldScrollStepRef = useRef(false)

  const { data: modelsData, isLoading: modelsLoading } = useQuery({
    queryKey: ["wheel-categories"],
    queryFn: CatalogService.listWheelCategories,
  })

  const { data: allOptionalsData } = useQuery({
    queryKey: ["components"],
    queryFn: CatalogService.listWheelComponents,
  })

  const models = useMemo(
    () => (Array.isArray(modelsData) ? modelsData : []),
    [modelsData]
  )

  const allOptionals = useMemo(
    () => (Array.isArray(allOptionalsData) ? allOptionalsData : []),
    [allOptionalsData]
  )

  useEffect(() => {
    shouldScrollStepRef.current = false
    window.scrollTo({ top: 0, left: 0, behavior: "auto" })
  }, [slug])

  useEffect(() => {
    if (!slug || models.length === 0) return
    const name = SLUG_TO_NAME[slug]
    if (!name) {
      navigate("/", { replace: true })
      return
    }
    const model = models.find((m) => m.name === name)
    if (model) {
      setWheelCategoryId(model.id)
      setStep("interior")
    }
  }, [slug, models, setWheelCategoryId, setStep])

  useEffect(() => {
    if (!token) return
    const returnTo = restoreDraft()
    if (returnTo === location.pathname) {
      setStep("summary")
    }
  }, [location.pathname, restoreDraft, setStep, token])

  useEffect(() => {
    if (!shouldScrollStepRef.current) return
    shouldScrollStepRef.current = false

    const el = sectionRefs.current[step]
    if (!el) return

    const timer = window.setTimeout(() => {
      slowScrollTo(el)
    }, 140)

    return () => window.clearTimeout(timer)
  }, [step])

  const availableModels = useMemo(() => {
    const visibleModelNames = new Set(Object.keys(MODEL_DISPLAY_NAMES))
    return models.filter((m) => visibleModelNames.has(m.name))
  }, [models])

  const selectedModel = useMemo(
    () => availableModels.find((m) => m.id === wheelCategoryId),
    [availableModels, wheelCategoryId]
  )

  const wheel_hubs = useMemo(() => {
    const officialHubNames = new Set<string>(HUB_OPTION_ORDER)
    const sourceData =
      selectedModel?.wheel_hubs ??
      availableModels.find((m) => m.id === wheelCategoryId)?.wheel_hubs ??
      []
    const source = Array.isArray(sourceData) ? sourceData : []

    return source
      .filter((m) => officialHubNames.has(m.name))
      .sort((a, b) => HUB_OPTION_ORDER.indexOf(a.name as typeof HUB_OPTION_ORDER[number]) -
        HUB_OPTION_ORDER.indexOf(b.name as typeof HUB_OPTION_ORDER[number]))
  }, [selectedModel, availableModels, wheelCategoryId])

  const selectedWheelHub = wheel_hubs.find((m) => m.id === wheelHubId)
  const selectedProfile = allOptionals.find((o) =>
    selectedOptionalIds.includes(o.id) && isInteriorOptional(o)
  )
  const selectedSpoke = allOptionals.find((o) =>
    selectedOptionalIds.includes(o.id) && isSpokeOptional(o)
  )

  const displayModelName = getWheelCategoryDisplayName(selectedModel?.name)
  const configuratorTitle = displayModelName
    ? `Configurazione coppia ruote ${displayModelName}`
    : "Configurazione coppia ruote"
  const missingRequirements = [
    !selectedModel ? "categoria" : null,
    !selectedProfile ? "profilo" : null,
    !selectedWheelHub ? "mozzo" : null,
    !selectedSpoke ? "raggi" : null,
  ].filter((item): item is string => Boolean(item))
  const configurationComplete = missingRequirements.length === 0

  const total = useMemo(() => {
    if (!selectedModel) return 0
    return calculateLivePrice(
      parseFloat(selectedModel.base_price),
      selectedWheelHub ? parseFloat(selectedWheelHub.price) : 0,
      selectedOptionalIds,
      allOptionals,
      selectedModel.name
    )
  }, [selectedModel, selectedWheelHub, selectedOptionalIds, allOptionals])

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!wheelCategoryId || !wheelHubId || !selectedProfile || !selectedSpoke) {
        throw new Error("Completa tutti i componenti prima di salvare")
      }
      const config = await ConfigurationsService.create({
        wheel_category_id: wheelCategoryId,
        wheel_hub_id: wheelHubId,
        name: configName || `Configurazione ${displayModelName ?? selectedModel?.name}`,
        component_ids: selectedOptionalIds,
      })
      const quote = await QuotesService.create(config.id)
      return quote
    },
    onSuccess: (quote) => {
      queryClient.invalidateQueries({ queryKey: ["configurations"] })
      queryClient.invalidateQueries({ queryKey: ["quotes"] })
      toast.success("Preventivo creato con successo")
      clearDraft()
      reset()
      navigate(`/area-personale/preventivi/${quote.quote.id}`)
    },
    onError: (err: Error) => {
      toast.error(err.message || "Errore nel salvataggio")
    },
  })

  // indice dello step attivo (per il nav)
  const stepIndex = WIZARD_STEPS.findIndex((s) => s.id === step)
  const progressStepCount = Math.max(WIZARD_STEPS.length - 1, 1)
  const mtbStartsWithProfile = selectedModel?.name.toLowerCase().includes("mtb") ?? false
  const progressPercent =
    modelsLoading || !selectedModel
      ? 0
      : stepIndex <= 0
        ? mtbStartsWithProfile
          ? (1 / progressStepCount) * 100
          : 0
        : (stepIndex / progressStepCount) * 100

  const isMtbModel = selectedModel?.name.toLowerCase().includes("mtb") ?? false

  const interiorOptionals = useMemo(() => {
    const profiles = uniqueWheelImageOptionals(allOptionals.filter(isInteriorOptional))

    if (isMtbModel) {
      return profiles.filter((optional) => optional.name.toLowerCase().includes("20"))
    }

    return profiles.filter((optional) => !optional.name.toLowerCase().includes("20"))
  }, [allOptionals, isMtbModel])

  useEffect(() => {
    if (!isMtbModel || interiorOptionals.length !== 1) return

    const profile = interiorOptionals[0]
    if (selectedOptionalIds.includes(profile.id)) return

    const profileIds = allOptionals.filter(isInteriorOptional).map((optional) => optional.id)
    setSelectedOptionalIds([
      ...selectedOptionalIds.filter((id) => !profileIds.includes(id)),
      profile.id,
    ])
  }, [allOptionals, interiorOptionals, isMtbModel, selectedOptionalIds, setSelectedOptionalIds])
  const extraOptionals = allOptionals.filter((o) => {
    if (isInteriorOptional(o)) return false
    if (getOptionDisplayGroup(o) === "Raggi") {
      return (SPOKE_OPTION_ORDER as readonly string[]).includes(o.name)
    }
    return true
  })

  const extrasByCategory = useMemo(() => {
    const map = new Map<string, WheelComponent[]>()
    for (const o of extraOptionals) {
      const list = map.get(getOptionDisplayGroup(o)) ?? []
      list.push(o)
      map.set(getOptionDisplayGroup(o), list)
    }
    for (const [group, options] of map) {
      map.set(group, uniqueWheelImageOptionals(options))
    }
    return map
  }, [extraOptionals])

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* ── Header sticky ── */}
      <div className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/75">
        <div className="mx-auto flex max-w-full flex-col items-stretch gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <div className="min-w-0 flex-1">
            <Button
              variant="ghost"
              size="sm"
              className="mb-2"
              render={<Link to="/" />}
            >
              <ArrowLeft className="mr-1 size-4" />
              Indietro
            </Button>
            <div className="flex items-center">
              <h1 className="max-w-full text-balance text-xl font-semibold leading-tight tracking-tight sm:text-2xl">
                {configuratorTitle}
              </h1>
            </div>
          </div>
          <div className="shrink-0 rounded-lg border bg-card px-3 py-2 text-left shadow-sm sm:px-4 sm:text-right">
            <p className="text-xs font-medium text-muted-foreground">Prezzo totale</p>
            <p className="text-xl font-semibold tracking-tight text-primary sm:text-2xl">{formatPrice(total)}</p>
          </div>
        </div>
        {/* Progress bar */}
        <div className="h-1 w-full bg-muted">
          <div
            className="h-full bg-primary transition-all duration-500"
            style={{
              width: `${progressPercent}%`,
            }}
          />
        </div>
      </div>

      {/* ── Main layout: Image (left) + Options (right) ── */}
      <div className="flex-1 pb-24">
        {modelsLoading ? (
          <div className="flex min-h-[calc(100vh-12rem)] items-center justify-center px-8">
            <div className="h-px w-full max-w-sm overflow-hidden bg-white/10">
              <div className="h-full w-1/2 bg-white animate-loader-line" />
            </div>
          </div>
        ) : (
          <div className="mx-auto min-h-[calc(100vh-7rem)] w-full max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
            <div>
              {/* 1. Profilo */}
              <section
                ref={(el) => { sectionRefs.current["interior"] = el }}
                className="scroll-mt-32 rounded-xl border bg-card/95 p-5 shadow-sm first:pt-5"
              >
                <SectionHeader
                  title="Profilo"
                  done={selectedOptionalIds.some((id) =>
                    interiorOptionals.find((o) => o.id === id)
                  )}
                />
                <OptionalPicker
                  components={interiorOptionals}
                  ruleOptionals={allOptionals}
                  selectedIds={selectedOptionalIds}
                  wheelHub={selectedWheelHub}
                  wheelCategoryId={wheelCategoryId}
                  modelName={selectedModel?.name}
                  hideSelectionMark={isMtbModel}
                  lockedOptionalIds={isMtbModel ? interiorOptionals.map((optional) => optional.id) : []}
                  onChange={(ids) => {
                    setSelectedOptionalIds(ids)
                    if (ids.some((id) => interiorOptionals.find((o) => o.id === id))) {
                      shouldScrollStepRef.current = true
                      setStep("motor")
                    }
                  }}
                />
              </section>

              {/* 2. Mozzo */}
              <section
                ref={(el) => { sectionRefs.current["motor"] = el }}
                className="mt-6 scroll-mt-32 rounded-xl border bg-card/95 p-5 shadow-sm"
              >
                <SectionHeader title="Mozzo" done={!!wheelHubId} />
                {selectedModel ? (
                  <MotorStep
                    wheel_hubs={wheel_hubs}
                    wheelCategoryId={selectedModel.id}
                    selectedId={wheelHubId}
                    onSelect={(id) => {
                      const nextWheelHub = wheel_hubs.find((m) => m.id === id)
                      const compatibleSelectedIds = selectedOptionalIds.filter((optionalId) => {
                        const optional = allOptionals.find((item) => item.id === optionalId)
                        return optional ? !getCompatibilityWarning(nextWheelHub, optional) : true
                      })

                      if (compatibleSelectedIds.length !== selectedOptionalIds.length) {
                        setSelectedOptionalIds(compatibleSelectedIds)
                      }

                      setWheelHubId(id)
                      shouldScrollStepRef.current = true
                      setStep("extras")
                    }}
                  />
                ) : null}
              </section>

              {/* 3. Raggi */}
              <section
                ref={(el) => { sectionRefs.current["extras"] = el }}
                className="mt-6 scroll-mt-32 rounded-xl border bg-card/95 p-5 shadow-sm"
              >
                <SectionHeader title="Raggi" done={!!selectedSpoke} />
                <p className="-mt-3 mb-5 text-xs font-medium text-muted-foreground">
                  {isMtbModel ? "28 raggi per ruota" : "24 raggi per ruota"}
                </p>
                <div className="space-y-8">
                  {[...extrasByCategory.entries()].map(([cat, opts]) => (
                    <div key={cat}>
                      <OptionalPicker
                        components={opts}
                        ruleOptionals={allOptionals}
                        selectedIds={selectedOptionalIds}
                        wheelHub={selectedWheelHub}
                        wheelCategoryId={wheelCategoryId}
                        modelName={selectedModel?.name}
                        onChange={(ids) => {
                          setSelectedOptionalIds(ids)
                          if (ids.some((id) => opts.find((o) => o.id === id && isSpokeOptional(o)))) {
                            shouldScrollStepRef.current = true
                            setStep("summary")
                          } else {
                            setStep("extras")
                          }
                        }}
                      />
                    </div>
                  ))}
                </div>
              </section>

              {/* 4. Riepilogo */}
              <section
                ref={(el) => { sectionRefs.current["summary"] = el }}
                className="mt-6 scroll-mt-32 rounded-xl border bg-card/95 p-5 shadow-sm"
              >
                <SectionHeader title="Riepilogo" />
                <div className="space-y-8">
                  <dl className="grid gap-3 text-sm sm:grid-cols-3">
                    <SummaryCard
                      label="Profilo"
                      value={selectedProfile ? formatOptionalDisplayName(selectedProfile.name) : "-"}
                      price={selectedProfile ? getOptionalEffectivePrice(selectedProfile, selectedModel?.name) : undefined}
                    />
                    <SummaryCard
                      label="Mozzo"
                      value={selectedWheelHub?.name ?? "-"}
                      price={selectedWheelHub ? parseFloat(selectedWheelHub.price) : undefined}
                    />
                    <SummaryCard
                      label="Raggi"
                      value={selectedSpoke?.name ?? "-"}
                      price={selectedSpoke ? getOptionalEffectivePrice(selectedSpoke, selectedModel?.name) : undefined}
                      meta={selectedSpoke ? `${formatCurrency(parseFloat(selectedSpoke.price))} cad. x ${getSpokeCount(selectedModel?.name)} pz` : undefined}
                    />
                  </dl>
                  <Field>
                    <FieldLabel htmlFor="configName">Nome configurazione</FieldLabel>
                    <Input
                      id="configName"
                      placeholder="Es. Set gara strada"
                      value={configName}
                      onChange={(e) => {
                        setConfigName(e.target.value)
                        setStep("summary")
                      }}
                    />
                  </Field>
                  {!token && (
                    <p className="rounded-lg border border-accent/30 bg-accent/5 p-5 text-sm">
                      <Link
                        to="/login"
                        state={{ from: location.pathname }}
                        className="font-medium underline"
                        onClick={() => saveDraft(location.pathname)}
                      >
                        Accedi
                      </Link>{" "}
                      o{" "}
                      <Link
                        to="/register"
                        state={{ from: location.pathname }}
                        className="font-medium underline"
                        onClick={() => saveDraft(location.pathname)}
                      >
                        registrati
                      </Link>{" "}
                      per salvare la configurazione e generare il preventivo.
                    </p>
                  )}
                  {token && !configurationComplete && (
                    <p className="rounded-lg border border-destructive/35 bg-destructive/10 p-4 text-sm font-medium text-destructive">
                      Completa {missingRequirements.join(", ")} per salvare la configurazione.
                    </p>
                  )}
                  {token && (
                    <Button
                      variant="accent"
                      size="lg"
                      className="w-full"
                      disabled={!configName.trim() || !configurationComplete || saveMutation.isPending}
                      onClick={() => saveMutation.mutate()}
                    >
                      Salva e genera preventivo
                    </Button>
                  )}
                </div>
              </section>
            </div>
          </div>
        )}
      </div>

    </div>
  )
}

function SectionHeader({ title }: { title: string; done?: boolean }) {
  return (
    <div className="mb-5 flex items-center gap-3">
      <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
    </div>
  )
}

function SummaryCard({
  label,
  value,
  price,
  meta,
}: {
  label: string
  value: string
  price?: number
  meta?: string
}) {
  return (
    <div className="rounded-lg border bg-background p-4">
      <dt className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{label}</dt>
      <dd className="mt-1 min-h-6 font-medium">{value}</dd>
      {meta && <p className="mt-1 text-xs text-muted-foreground">{meta}</p>}
      {price !== undefined && (
        <p className="mt-3 text-sm font-medium text-primary">
          {price > 0 ? `+ ${formatCurrency(price)}` : "Incluso"}
        </p>
      )}
    </div>
  )
}

function getOptionDisplayGroup(optional: WheelComponent) {
  const name = optional.name.toLowerCase()
  if (name.includes("ragg")) return "Raggi"
  if (name.includes("profilo")) return "Profilo"
  return OPTIONAL_CATEGORY_LABELS[optional.category] ?? optional.category
}


function isInteriorOptional(optional: WheelComponent) {
  const category = optional.category.toLowerCase()
  const name = optional.name.toLowerCase()

  return category === "profilo" || name.includes("profilo")
}

function uniqueWheelImageOptionals(components: WheelComponent[]) {
  return components
}

function slowScrollTo(el: HTMLElement) {
  const headerOffset = window.innerWidth < 640 ? 166 : 124
  const targetY = Math.max(0, el.getBoundingClientRect().top + window.scrollY - headerOffset)
  const startY = window.scrollY
  const distance = targetY - startY
  const duration = 950
  const start = window.performance.now()
  const easeInOut = (value: number) =>
    value < 0.5 ? 2 * value * value : 1 - Math.pow(-2 * value + 2, 2) / 2

  function tick(now: number) {
    const progress = Math.min(1, (now - start) / duration)
    window.scrollTo(0, startY + distance * easeInOut(progress))
    if (progress < 1) window.requestAnimationFrame(tick)
  }

  window.requestAnimationFrame(tick)
}

function MotorStep({
  wheel_hubs,
  wheelCategoryId,
  selectedId,
  onSelect,
}: {
  wheel_hubs: WheelHub[]
  wheelCategoryId: number
  selectedId?: number
  onSelect: (id: number) => void
}) {
  return (
    <div className="space-y-2">
      {wheel_hubs.map((m) => {
        const compatible = isWheelHubCompatible(wheelCategoryId, m)
        const image = m.image_url ?? getWheelHubThumbnail(m.name)
        return (
          <button
            key={m.id}
            type="button"
            disabled={!compatible}
            onClick={() => onSelect(m.id)}
            className={cn(
              "grid w-full items-center gap-4 rounded-lg border bg-background p-3 text-left transition-all hover:border-primary/40 hover:bg-accent/40 hover:shadow-sm",
              image
                ? "grid-cols-[4.5rem_minmax(0,1fr)_auto_auto]"
                : "grid-cols-[minmax(0,1fr)_auto_auto]",
              selectedId === m.id && "border-primary bg-primary/5 shadow-sm",
              !compatible && "cursor-not-allowed opacity-40"
            )}
          >
            {image && (
              <span
                className={cn(
                  "relative flex size-16 items-center justify-center overflow-hidden rounded-full border bg-muted/30 transition-colors",
                  selectedId === m.id ? "border-primary ring-2 ring-primary/15" : "border-border"
                )}
              >
                <img
                  src={image}
                  alt={m.name}
                  className="size-full object-cover"
                  loading="lazy"
                />
              </span>
            )}
            <div className="min-w-0">
              <p className="font-medium">{m.name}</p>
            </div>
            <span className="shrink-0 text-sm font-medium">
              {parseFloat(m.price) > 0
                ? `+ ${formatPrice(m.price)}`
                : "Incluso"}
            </span>
            <SelectionMark selected={selectedId === m.id} />
          </button>
        )
      })}
    </div>
  )
}


function SelectionMark({ selected }: { selected: boolean }) {
  return (
    <span
      className={cn(
        "flex size-5 shrink-0 items-center justify-center rounded-sm border transition-colors",
        selected ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background"
      )}
    >
      {selected && <Check className="size-3" />}
    </span>
  )
}
