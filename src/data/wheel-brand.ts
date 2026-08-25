export type ModelSlug = "road" | "gravel" | "mtb"

export type WheelModelAsset = {
  slug: ModelSlug
  tagline: string
  heroImage: string
  sideImage: string
  configuratorUrl: string
  highlights: string[]
}

export type WheelConfiguratorImageSet = {
  model: string
  motor: string
  exterior: string
  color: string
  interior: string
  technology: string
  comfort: string
  safety: string
  accessory: string
}

const WHEEL_ASSET_BASE = "/wheel-configurator"

export const WHEEL_MODEL_ASSETS: Record<string, WheelModelAsset> = {
  Strada: {
    slug: "road",
    tagline: "Strada endurance e race",
    heroImage: `${WHEEL_ASSET_BASE}/cards/strada.jpg`,
    sideImage: `${WHEEL_ASSET_BASE}/cards/strada.jpg`,
    configuratorUrl: "",
    highlights: ["45 mm", "Carbonio", "Tubeless"],
  },
  Gravel: {
    slug: "gravel",
    tagline: "Gravel veloce e stabile",
    heroImage: `${WHEEL_ASSET_BASE}/cards/gravel.jpg`,
    sideImage: `${WHEEL_ASSET_BASE}/cards/gravel.jpg`,
    configuratorUrl: "",
    highlights: ["35 mm", "Hookless", "Disc"],
  },
  MTB: {
    slug: "mtb",
    tagline: "Trail, all-mountain e bike park",
    heroImage: `${WHEEL_ASSET_BASE}/cards/mtb.jpg`,
    sideImage: `${WHEEL_ASSET_BASE}/cards/mtb.jpg`,
    configuratorUrl: "",
    highlights: ["30 mm", "Boost", "6 fori"],
  },
}

export const WHEEL_CONFIGURATOR_IMAGES: Record<string, WheelConfiguratorImageSet> = Object.fromEntries(
  Object.entries(WHEEL_MODEL_ASSETS).map(([name, asset]) => [
    name,
    {
      model: asset.sideImage,
      motor: asset.heroImage,
      exterior: asset.sideImage,
      color: asset.sideImage,
      interior: asset.sideImage,
      technology: asset.sideImage,
      comfort: asset.sideImage,
      safety: asset.sideImage,
      accessory: asset.sideImage,
    },
  ])
) as Record<string, WheelConfiguratorImageSet>

export function getWheelConfiguratorImage(
  modelName?: string
) {
  if (!modelName) return undefined

  const images = WHEEL_CONFIGURATOR_IMAGES[modelName]
  if (!images) return WHEEL_MODEL_ASSETS[modelName]?.sideImage

  return images.model
}

export function getWheelOptionThumbnail(_category?: string, componentName?: string) {
  const name = componentName?.toLowerCase() ?? ""

  if (name.includes("30") || name.includes("45") || name.includes("50") || name.includes("60")) return undefined
  if (name.includes("ceramic")) return `${WHEEL_ASSET_BASE}/mozzo-ceramic.svg`
  if (name.includes("mozzo") || name.includes("ratchet") || name.includes("dt swiss")) return `${WHEEL_ASSET_BASE}/mozzo-ratchet.svg`
  if (name.includes("carbon")) return `${WHEEL_ASSET_BASE}/components/raggio-carbon.webp`
  if (name.includes("berd")) return `${WHEEL_ASSET_BASE}/components/raggio-berd.png`
  return undefined
}

export function getWheelColorImage(modelName?: string, componentName?: string) {
  if (!modelName) return undefined

  const color = getWheelColorKey(componentName)
  const asset = WHEEL_MODEL_ASSETS[modelName]
  if (!asset) return undefined

  return `${WHEEL_ASSET_BASE}/${asset.slug}-${color}.svg`
}

function getWheelColorKey(componentName?: string) {
  const name = componentName?.toLowerCase() ?? ""

  if (name.includes("rosso")) return "rosso"
  if (name.includes("bianco")) return "bianco"
  if (name.includes("blu")) return "blu"
  if (name.includes("argento")) return "argento"
  if (name.includes("grigio")) return "grigio"
  return "nero"
}

export const OPTIONAL_CATEGORY_LABELS: Record<string, string> = {
  profilo: "Profilo",
  raggi: "Raggi",
}

export const EXCLUSIVE_CATEGORIES = new Set([
  "profilo",
  "raggi",
])

export const WIZARD_STEPS = [
  { id: "interior", label: "Profilo" },
  { id: "motor", label: "Mozzo" },
  { id: "extras", label: "Raggi" },
  { id: "summary", label: "Riepilogo" },
] as const

export type WizardStepId = (typeof WIZARD_STEPS)[number]["id"]

export const HUB_OPTION_ORDER = [
  "Mozzo DT Swiss 350",
  "Mozzo DT Swiss 240",
  "Mozzo DT Swiss 180",
  "Mozzo Extralight",
  "Mozzo Damil",
  "Mozzo Erase",
  "Mozzo Bitex",
  "Mozzo Industry Nine",
  "Mozzo Chris King",
  "Mozzo OGS",
  "Mozzo Spank",
] as const

export const HUB_THUMBNAILS: Record<string, string> = {
  "Mozzo DT Swiss 350": `${WHEEL_ASSET_BASE}/components/mozzo-dtswiss350.jpg`,
  "Mozzo DT Swiss 240": `${WHEEL_ASSET_BASE}/components/mozzo-dtswiss240.jpg`,
  "Mozzo DT Swiss 180": `${WHEEL_ASSET_BASE}/components/mozzo-dtswiss180.jpg`,
  "Mozzo Extralight": `${WHEEL_ASSET_BASE}/components/mozzo-extralight.jpeg`,
  "Mozzo Damil": `${WHEEL_ASSET_BASE}/components/mozzo-damil.webp`,
  "Mozzo Erase": `${WHEEL_ASSET_BASE}/components/mozzo-erase.jpg`,
  "Mozzo Bitex": `${WHEEL_ASSET_BASE}/components/mozzo-bitex.png`,
  "Mozzo Industry Nine": `${WHEEL_ASSET_BASE}/components/mozzo-industrynine.webp`,
  "Mozzo Chris King": `${WHEEL_ASSET_BASE}/components/mozzo-chrisking.webp`,
  "Mozzo OGS": `${WHEEL_ASSET_BASE}/components/mozzo-ogs.webp`,
  "Mozzo Spank": `${WHEEL_ASSET_BASE}/components/mozzo-spank.webp`,
}

export function getWheelHubThumbnail(name?: string) {
  if (!name) return undefined
  return HUB_THUMBNAILS[name]
}

export const SPOKE_OPTION_ORDER = [
  "Sapim CX-Ray",
  "Sapim Laser",
  "Sapim Sprint",
  "Sapim Leader",
  "Raggi Carbon",
  "Raggi Berd",
] as const
