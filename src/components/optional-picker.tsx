import { getWheelOptionThumbnail } from "@/data/wheel-brand"
import { cn, formatPrice } from "@/lib/utils"
import {
  getCompatibilityWarning,
  getOptionalEffectivePrice,
  getSpokeCount,
  isSpokeOptional,
  toggleOptional,
} from "@/lib/compatibility"
import type { WheelHub, WheelComponent } from "@/features/catalog/catalog.type"
import { AlertTriangle, Check, X } from "lucide-react"
import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"

type OptionalPickerProps = {
  components: WheelComponent[]
  selectedIds: number[]
  wheelHub?: WheelHub
  wheelCategoryId?: number
  modelName?: string
  ruleOptionals?: WheelComponent[]
  hideSelectionMark?: boolean
  lockedOptionalIds?: number[]
  onChange: (ids: number[]) => void
}

export default function OptionalPicker({
  components,
  selectedIds,
  wheelHub,
  modelName,
  ruleOptionals,
  hideSelectionMark = false,
  lockedOptionalIds = [],
  onChange,
}: OptionalPickerProps) {
  const allOptionals = ruleOptionals ?? components
  const [conflict, setConflict] = useState<SeatHeatingConflict | null>(null)
  const [replacementId, setReplacementId] = useState<number | null>(null)

  const selectedNappaSeat = useMemo(
    () => findSelectedNappaSeat(selectedIds, allOptionals),
    [allOptionals, selectedIds]
  )
  const selectedHeatedSeat = useMemo(
    () => findSelectedHeatedSeat(selectedIds, allOptionals),
    [allOptionals, selectedIds]
  )

  function handleSelect(optional: WheelComponent) {
    if (lockedOptionalIds.includes(optional.id)) return

    const seatHeatingConflict = getSeatHeatingConflict(
      optional,
      selectedNappaSeat,
      selectedHeatedSeat,
      allOptionals
    )

    if (seatHeatingConflict) {
      setConflict(seatHeatingConflict)
      setReplacementId(seatHeatingConflict.alternatives[0]?.id ?? null)
      return
    }

    onChange(toggleOptional(selectedIds, optional, allOptionals))
  }

  function handleConfirmConflict() {
    if (!conflict) return

    const replacement = conflict.alternatives.find((item) => item.id === replacementId)
    if (!replacement && conflict.kind === "replace-seat-material") return

    const nextIds =
      conflict.kind === "replace-seat-material" && replacement
        ? toggleOptional(
            toggleOptional(selectedIds, replacement, allOptionals),
            conflict.requestedOption,
            allOptionals
          )
        : toggleOptional(
            selectedIds.filter((id) => id !== conflict.heatedSeat?.id),
            conflict.requestedOption,
            allOptionals
          )

    onChange(nextIds)
    setConflict(null)
    setReplacementId(null)
  }

  const selectedReplacement = conflict?.alternatives.find(
    (item) => item.id === replacementId
  )
  const priceDelta = conflict
    ? getCompatibilityPriceDelta(
        selectedIds,
        allOptionals,
        conflict,
        selectedReplacement
      )
    : 0

  return (
    <>
      <div className="space-y-2">
        {components.map((optional) => {
          const selected = selectedIds.includes(optional.id)
          const warning = getCompatibilityWarning(wheelHub, optional)
          const disabled = !!warning
          const showSelectionMark = !hideSelectionMark
          const image = optional.image_url ?? getWheelOptionThumbnail(optional.category, optional.name)
          const displayName = formatOptionalDisplayName(optional.name)
          const spoke = isSpokeOptional(optional)
          const unitPrice = parseFloat(optional.price)
          const effectivePrice = getOptionalEffectivePrice(optional, modelName)
          return (
            <button
              key={optional.id}
              type="button"
              disabled={disabled}
              onClick={() => handleSelect(optional)}
              className={cn(
                "grid w-full items-center gap-4 rounded-lg border bg-background p-3 text-left transition-all hover:border-primary/40 hover:bg-accent/40 hover:shadow-sm",
                image
                  ? showSelectionMark
                    ? "grid-cols-[4.5rem_minmax(0,1fr)_auto_auto]"
                    : "grid-cols-[4.5rem_minmax(0,1fr)_auto]"
                  : showSelectionMark
                    ? "grid-cols-[minmax(0,1fr)_auto_auto]"
                    : "grid-cols-[minmax(0,1fr)_auto]",
                selected && "border-primary bg-primary/5 shadow-sm",
                disabled && "cursor-not-allowed opacity-50"
              )}
            >
              {image && (
                <span
                  className={cn(
                    "relative flex size-16 items-center justify-center overflow-hidden rounded-full border bg-muted/30 transition-colors",
                    selected ? "border-primary ring-2 ring-primary/15" : "border-border"
                  )}
                >
                  <img
                    src={image}
                    alt={optional.name}
                    className={cn(
                      "size-full",
                      image?.match(/\.(jpg|jpeg|png|webp)$/i)
                        ? "object-cover"
                        : "object-contain p-1.5"
                    )}
                    loading="lazy"
                  />
                </span>
              )}
              <span className="min-w-0">
                <span className="block font-medium leading-snug">{displayName}</span>
                {warning && (
                  <span className="mt-2 block text-xs text-destructive">{warning}</span>
                )}
              </span>
              <span className="shrink-0 text-right text-sm font-medium">
                {spoke ? (
                  <span className="block leading-tight">
                    <span className="block">{formatSpokePrice(unitPrice)} cad.</span>
                    <span className="block text-xs text-muted-foreground">
                      {getSpokeCount(modelName)} pz · + {formatSpokePrice(effectivePrice)}
                    </span>
                  </span>
                ) : effectivePrice > 0 ? (
                  `+ ${formatPrice(effectivePrice)}`
                ) : (
                  "Incluso"
                )}
              </span>
              {showSelectionMark && (
                <span
                  className={cn(
                    "flex size-5 shrink-0 items-center justify-center rounded-sm border transition-colors",
                    selected
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-muted-foreground/40 bg-background"
                  )}
                >
                  {selected && <Check className="size-3.5" />}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {conflict && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/55 px-4 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-xl border bg-background p-5 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div className="flex gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
                  <AlertTriangle className="size-5" />
                </span>
                <div>
                  <h2 className="text-lg font-semibold tracking-tight">
                    Opzioni non compatibili
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {conflict.kind === "replace-seat-material" ? (
                      <>
                        {conflict.requestedOption.name} non è compatibile con{" "}
                        {conflict.currentSeat?.name}. Seleziona uno dei
                        rivestimenti disponibili qui sotto per continuare.
                      </>
                    ) : (
                      <>
                        {conflict.requestedOption.name} non è compatibile con{" "}
                        {conflict.heatedSeat?.name}. Per continuare verranno
                        rimosso il componente non compatibile dalla configurazione.
                      </>
                    )}
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                onClick={() => setConflict(null)}
                aria-label="Chiudi"
              >
                <X className="size-4" />
              </button>
            </div>

            {conflict.kind === "replace-seat-material" && (
              <>
                <p className="mt-5 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Clicca un rivestimento alternativo
                </p>
                <div className="mt-3 space-y-2">
                  {conflict.alternatives.map((alternative) => (
                    <button
                      key={alternative.id}
                      type="button"
                      className={cn(
                        "flex w-full items-center justify-between gap-4 rounded-lg border bg-card p-3 text-left transition-all hover:border-primary/50 hover:bg-primary/5",
                        replacementId === alternative.id && "border-primary bg-primary/5 ring-2 ring-primary/15"
                      )}
                      onClick={() => setReplacementId(alternative.id)}
                    >
                      <span
                        className={cn(
                          "flex size-5 shrink-0 items-center justify-center rounded-full border",
                          replacementId === alternative.id
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-muted-foreground/40"
                        )}
                      >
                        {replacementId === alternative.id && <Check className="size-3" />}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block font-medium">{alternative.name}</span>
                        <span className="mt-1 line-clamp-2 block text-sm text-muted-foreground">
                          {alternative.description}
                        </span>
                      </span>
                      <span className="shrink-0 text-sm font-medium">
                        {formatPrice(alternative.price)}
                      </span>
                    </button>
                  ))}
                </div>
              </>
            )}

            {conflict.kind === "remove-heated-seats" && conflict.heatedSeat && (
              <div className="mt-5 rounded-lg border bg-card p-4">
                <p className="text-sm font-medium">Modifica proposta</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Rimuovi {conflict.heatedSeat.name} e applica{" "}
                  {conflict.requestedOption.name}.
                </p>
              </div>
            )}

            <div className="mt-5 rounded-lg border bg-muted/40 p-4">
              <div className="flex items-center justify-between gap-4 text-sm">
                <span className="text-muted-foreground">
                  Variazione prezzo applicando la compatibilità
                </span>
                <span className="text-lg font-semibold">
                  {priceDelta >= 0 ? "+ " : "- "}
                  {formatPrice(Math.abs(priceDelta))}
                </span>
              </div>
            </div>

            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button variant="outline" onClick={() => setConflict(null)}>
                Annulla
              </Button>
              <Button
                onClick={handleConfirmConflict}
                disabled={conflict.kind === "replace-seat-material" && !replacementId}
              >
                Accetta e aggiorna
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

type SeatHeatingConflict = {
  kind: "replace-seat-material" | "remove-heated-seats"
  requestedOption: WheelComponent
  currentSeat?: WheelComponent
  heatedSeat?: WheelComponent
  alternatives: WheelComponent[]
}

function getSeatHeatingConflict(
  requestedOption: WheelComponent,
  selectedNappaSeat: WheelComponent | undefined,
  selectedHeatedSeat: WheelComponent | undefined,
  allOptionals: WheelComponent[]
): SeatHeatingConflict | null {
  if (selectedNappaSeat && isHeatedSeatOption(requestedOption)) {
    const alternatives = allOptionals
      .filter((optional) => isSeatMaterialAlternative(optional, selectedNappaSeat))
      .filter((optional) => !isFreeBlackFabric(optional))
      .slice(0, 3)

    if (alternatives.length === 0) return null

    return {
      kind: "replace-seat-material",
      requestedOption,
      currentSeat: selectedNappaSeat,
      alternatives,
    }
  }

  if (selectedHeatedSeat && isNappaSeat(requestedOption)) {
    return {
      kind: "remove-heated-seats",
      requestedOption,
      heatedSeat: selectedHeatedSeat,
      alternatives: [],
    }
  }

  return null
}

function findSelectedNappaSeat(selectedIds: number[], allOptionals: WheelComponent[]) {
  return allOptionals.find(
    (optional) =>
      selectedIds.includes(optional.id) &&
      isSeatMaterial(optional) &&
      isNappaSeat(optional)
  )
}

function findSelectedHeatedSeat(selectedIds: number[], allOptionals: WheelComponent[]) {
  return allOptionals.find(
    (optional) => selectedIds.includes(optional.id) && isHeatedSeatOption(optional)
  )
}

function isHeatedSeatOption(optional: WheelComponent) {
  const name = optional.name.toLowerCase()
  return name.includes("sedil") && name.includes("riscald")
}

function isSeatMaterialAlternative(optional: WheelComponent, currentSeat: WheelComponent) {
  if (optional.id === currentSeat.id) return false
  if (!isSeatMaterial(optional)) return false
  return !optional.name.toLowerCase().includes("nappa")
}

function isSeatMaterial(optional: WheelComponent) {
  const name = optional.name.toLowerCase()
  const category = optional.category.toLowerCase()
  return (
    category.includes("intern") ||
    category.includes("sedil") ||
    name.includes("intern") ||
    name.includes("pelle") ||
    name.includes("alcantara") ||
    name.includes("tessuto") ||
    name.includes("velluto")
  )
}

function isNappaSeat(optional: WheelComponent) {
  return isSeatMaterial(optional) && optional.name.toLowerCase().includes("nappa")
}

function isFreeBlackFabric(optional: WheelComponent) {
  const name = optional.name.toLowerCase()
  const price = parseFloat(optional.price)
  return name.includes("tessuto") && name.includes("nero") && price === 0
}

function formatSpokePrice(value: number) {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

function formatOptionalDisplayName(name: string) {
  return name.replace(/^Profilo\s+(\d+)\s*mm$/i, "$1mm")
}

function getCompatibilityPriceDelta(
  selectedIds: number[],
  allOptionals: WheelComponent[],
  conflict: SeatHeatingConflict,
  replacement?: WheelComponent
) {
  const currentTotal = getOptionalTotal(selectedIds, allOptionals)
  const nextIds =
    conflict.kind === "replace-seat-material" && replacement
      ? toggleOptional(
          toggleOptional(selectedIds, replacement, allOptionals),
          conflict.requestedOption,
          allOptionals
        )
      : toggleOptional(
          selectedIds.filter((id) => id !== conflict.heatedSeat?.id),
          conflict.requestedOption,
          allOptionals
        )
  const nextTotal = getOptionalTotal(nextIds, allOptionals)

  return nextTotal - currentTotal
}

function getOptionalTotal(selectedIds: number[], allOptionals: WheelComponent[]) {
  return allOptionals
    .filter((optional) => selectedIds.includes(optional.id))
    .reduce((sum, optional) => sum + getOptionalEffectivePrice(optional), 0)
}
