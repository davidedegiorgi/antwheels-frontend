import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { myEnv } from "./env"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(value: number | string): string {
  const n = typeof value === "string" ? parseFloat(value) : value
  const safeValue = Number.isFinite(n) ? n : 0
  const hasCents = Math.round(safeValue * 100) % 100 !== 0

  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: hasCents ? 2 : 0,
    maximumFractionDigits: hasCents ? 2 : 0,
  }).format(safeValue)
}

export function resolveAssetUrl(url?: string | null) {
  if (!url) return undefined
  if (/^(https?:)?\/\//.test(url) || url.startsWith("data:")) return url
  if (url.startsWith("/")) return `${myEnv.backendUrl}${url}`
  return url
}
