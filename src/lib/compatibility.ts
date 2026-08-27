import type { WheelHub, WheelComponent } from "@/features/catalog/catalog.type"

export function isWheelHubCompatible(
  wheelCategoryId: number,
  wheel_hub: WheelHub
): boolean {
  return wheel_hub.wheel_category_id === wheelCategoryId
}

export function toggleOptional(
  selected: number[],
  optional: WheelComponent,
  allOptionals: WheelComponent[]
): number[] {
  const isSelected = selected.includes(optional.id)

  if (isSelected) {
    // Deseleziona
    return selected.filter((id) => id !== optional.id)
  }

  const inferredGroup = getInferredExclusiveGroup(optional)

  // Se ha un exclusive_group, o e una categoria a scelta singola, rimuovi gli altri dello stesso gruppo
  if (optional.exclusive_group || inferredGroup) {
    const sameGroup = allOptionals
      .filter((o) => {
        if (optional.exclusive_group) {
          return o.exclusive_group === optional.exclusive_group
        }

        return getInferredExclusiveGroup(o) === inferredGroup
      })
      .map((o) => o.id)
    return [...selected.filter((id) => !sameGroup.includes(id)), optional.id]
  }

  // Nessun vincolo: aggiungi e basta
  return [...selected, optional.id]
}

function getInferredExclusiveGroup(optional: WheelComponent): string | null {
  const name = optional.name.toLowerCase()
  const category = optional.category.toLowerCase()

  if (category === "profilo" || name.includes("profilo")) return "profile"
  if (category === "raggi" || name.includes("ragg")) return "spoke"

  return null
}

export function getCompatibilityWarning(
  wheel_hub: WheelHub | undefined,
  optional: WheelComponent
): string | null {
  const optionalName = optional.name.toLowerCase()
  const hubName = wheel_hub?.name.toLowerCase() ?? ""

  if (optionalName.includes("berd") && !["extralight", "erase"].some((hub) => hubName.includes(hub))) {
    return "Compatibile solo con mozzi Extralight o Erase"
  }

  if (optionalName.includes("carbon") && !hubName.includes("bitex")) {
    return "Compatibile solo con mozzo Bitex"
  }

  return null
}

export function isHubCompatibleWithSelectedOptionals(
  wheel_hub: WheelHub | undefined,
  components: WheelComponent[]
): boolean {
  return components.every((optional) => !getCompatibilityWarning(wheel_hub, optional))
}

export function calculateLivePrice(
  basePrice: number,
  wheel_hubPrice: number,
  selectedIds: number[],
  components: WheelComponent[],
  modelName?: string
): number {
  const optionalTotal = components
    .filter((o) => selectedIds.includes(o.id))
    .reduce((sum, o) => sum + getOptionalEffectivePrice(o, modelName), 0)
  const subtotal = basePrice + wheel_hubPrice + optionalTotal

  return subtotal * 1.12
}

export function getSpokeCount(modelName?: string): number {
  return modelName?.toLowerCase().includes("mtb") ? 56 : 48
}

export function isSpokeOptional(optional: WheelComponent): boolean {
  const name = optional.name.toLowerCase()
  return optional.exclusive_group === "spoke" || name.includes("sapim") || name.includes("raggi") || name.includes("berd")
}

export function getOptionalEffectivePrice(optional: WheelComponent, modelName?: string): number {
  const unitPrice = parseFloat(optional.price)
  return isSpokeOptional(optional) ? unitPrice * getSpokeCount(modelName) : unitPrice
}
